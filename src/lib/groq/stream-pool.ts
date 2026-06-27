import { createGroq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { loadApiKeys } from "./keys";

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

const COOLDOWN_MS = 60_000;

type KeyState = {
  key: string;
  keyId: string;
  cooldownUntil: number;
};

let keyStates: KeyState[] | null = null;
let roundRobinIndex = 0;

function getKeyStates(): KeyState[] {
  if (keyStates) return keyStates;

  const keys = loadApiKeys();
  keyStates = keys.map((key, index) => ({
    key,
    keyId: `key-${index + 1}`,
    cooldownUntil: 0,
  }));

  return keyStates;
}

function pickKey(): KeyState {
  const states = getKeyStates();
  if (states.length === 0) {
    throw new Error("No Groq API keys configured");
  }

  const now = Date.now();
  const available = states.filter((s) => s.cooldownUntil <= now);
  const pool = available.length > 0 ? available : states;
  const entry = pool[roundRobinIndex % pool.length];
  roundRobinIndex += 1;
  return entry;
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

export function resetStreamKeyPoolForTests() {
  keyStates = null;
  roundRobinIndex = 0;
}

type StreamTextWithFallbackOptions = {
  modelId: string;
  system: string;
  messages: ChatMessage[];
  temperature?: number;
  maxOutputTokens?: number;
  onFinish?: (event: { text: string }) => void | Promise<void>;
};

export async function streamTextWithFallback(
  options: StreamTextWithFallbackOptions,
  maxAttempts = 6
) {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const entry = pickKey();

    try {
      const groq = createGroq({ apiKey: entry.key });
      return streamText({
        model: groq(options.modelId),
        system: options.system,
        messages: options.messages,
        temperature: options.temperature,
        maxOutputTokens: options.maxOutputTokens,
        onFinish: options.onFinish,
      });
    } catch (error) {
      lastError = error;
      if (isRateLimitError(error)) {
        entry.cooldownUntil = Date.now() + COOLDOWN_MS;
        const backoff = Math.min(1000 * 2 ** attempt, 8000);
        await sleep(backoff + Math.random() * 500);
        continue;
      }
      throw error;
    }
  }

  throw lastError ?? new Error("All Groq API keys exhausted for streaming");
}

export async function pingChatModel(modelId: string): Promise<{ ok: boolean; keyId: string }> {
  const entry = pickKey();
  const groq = createGroq({ apiKey: entry.key });
  const result = await streamText({
    model: groq(modelId),
    messages: [{ role: "user", content: "Reply with exactly: ok" }],
    maxOutputTokens: 5,
  });
  await result.text;
  return { ok: true, keyId: entry.keyId };
}
