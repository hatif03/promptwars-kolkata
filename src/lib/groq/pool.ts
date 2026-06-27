import Groq from "groq-sdk";
import { loadApiKeys } from "./keys";

const COOLDOWN_MS = 60_000;

type PoolClient = {
  client: Groq;
  keyId: string;
  cooldownUntil: number;
  failures: number;
};

let pool: PoolClient[] | null = null;
let roundRobinIndex = 0;

function getPool(): PoolClient[] {
  if (pool) return pool;

  const keys = loadApiKeys();
  if (keys.length === 0) {
    throw new Error(
      "No Groq API keys configured. Set GROQ_API_KEY or GROQ_API_KEY_1, GROQ_API_KEY_2, etc."
    );
  }

  pool = keys.map((key, index) => ({
    client: new Groq({ apiKey: key }),
    keyId: `key-${index + 1}`,
    cooldownUntil: 0,
    failures: 0,
  }));

  return pool;
}

function pickClient(): PoolClient {
  const clients = getPool();
  const now = Date.now();
  const available = clients.filter((c) => c.cooldownUntil <= now);

  if (available.length === 0) {
    const soonest = clients.reduce((a, b) =>
      a.cooldownUntil < b.cooldownUntil ? a : b
    );
    return soonest;
  }

  const client = available[roundRobinIndex % available.length];
  roundRobinIndex += 1;
  return client;
}

function isRateLimitError(error: unknown): boolean {
  if (error && typeof error === "object") {
    const e = error as { status?: number; message?: string };
    return e.status === 429 || Boolean(e.message?.includes("429"));
  }
  return false;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function callGroqWithFallback<T>(
  fn: (client: Groq, keyId: string) => Promise<T>,
  maxAttempts = 6
): Promise<{ result: T; keyId: string }> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const entry = pickClient();

    try {
      const result = await fn(entry.client, entry.keyId);
      entry.failures = 0;
      return { result, keyId: entry.keyId };
    } catch (error) {
      lastError = error;
      entry.failures += 1;

      if (isRateLimitError(error)) {
        entry.cooldownUntil = Date.now() + COOLDOWN_MS;
        const backoff = Math.min(1000 * 2 ** attempt, 8000);
        await sleep(backoff + Math.random() * 500);
        continue;
      }

      throw error;
    }
  }

  throw lastError ?? new Error("All Groq API keys exhausted");
}

export { hasGroqKeys } from "./keys";
