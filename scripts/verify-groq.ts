/**
 * Verifies Groq AI health by calling /api/health/ai or direct pool checks.
 * Usage: npm run verify:ai
 * Requires dev server running OR set VERIFY_AI_DIRECT=1 for direct pool checks.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  const content = readFileSync(path, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

async function verifyViaHttp(): Promise<boolean> {
  const url = `${APP_URL.replace(/\/$/, "")}/api/health/ai`;
  console.log(`Checking ${url} ...`);

  const res = await fetch(url);
  const data = await res.json();

  console.log(JSON.stringify(data, null, 2));

  if (!res.ok) {
    console.error("\nAI health check failed.");
    return false;
  }

  console.log("\nAll AI surfaces OK.");
  return true;
}

async function verifyDirect(): Promise<boolean> {
  const { hasGroqKeys, loadApiKeys } = await import("../src/lib/groq/keys");
  const { pingChatModel } = await import("../src/lib/groq/stream-pool");
  const { callGroqWithFallback } = await import("../src/lib/groq/pool");
  const { COMPANION_MODEL } = await import("../src/lib/ai/prompts/companion");
  const {
    JOURNAL_ANALYSIS_MODEL,
    buildJournalAnalystPrompt,
  } = await import("../src/lib/ai/prompts/journal");
  const { parseJournalAnalysis } = await import("../src/lib/ai/parse-journal-analysis");
  const { generateWeeklyInsight } = await import("../src/lib/ai/generate-weekly-insight");

  if (!hasGroqKeys()) {
    console.error("No Groq API keys found in environment.");
    return false;
  }

  console.log(`Keys configured: ${loadApiKeys().length}`);

  let ok = true;

  try {
    const chat = await pingChatModel(COMPANION_MODEL);
    console.log(`Chat (${COMPANION_MODEL}): ok [${chat.keyId}]`);
  } catch (e) {
    ok = false;
    console.error("Chat: fail", e instanceof Error ? e.message : e);
  }

  try {
    const { result, keyId } = await callGroqWithFallback(async (client) => {
      return client.chat.completions.create({
        model: JOURNAL_ANALYSIS_MODEL,
        messages: [
          { role: "system", content: buildJournalAnalystPrompt("en") },
          { role: "user", content: "Feeling stressed about mock test." },
        ],
        temperature: 0.2,
        max_tokens: 200,
        response_format: { type: "json_object" },
      });
    });
    parseJournalAnalysis(result.choices[0]?.message?.content ?? "{}");
    console.log(`Journal (${JOURNAL_ANALYSIS_MODEL}): ok [${keyId}]`);
  } catch (e) {
    ok = false;
    console.error("Journal: fail", e instanceof Error ? e.message : e);
  }

  try {
    await generateWeeklyInsight(
      [{ content: "Rough day.", themes: ["stress"], created_at: new Date().toISOString() }],
      [],
      "en"
    );
    console.log("Insights: ok");
  } catch (e) {
    ok = false;
    console.error("Insights: fail", e instanceof Error ? e.message : e);
  }

  return ok;
}

async function main() {
  const useDirect = process.env.VERIFY_AI_DIRECT === "1";

  try {
    const ok = useDirect ? await verifyDirect() : await verifyViaHttp();
    process.exit(ok ? 0 : 1);
  } catch (error) {
    if (!useDirect && error instanceof Error && error.message.includes("fetch failed")) {
      console.log("Dev server not reachable — falling back to direct Groq checks.\n");
      const ok = await verifyDirect();
      process.exit(ok ? 0 : 1);
    }
    console.error(error);
    process.exit(1);
  }
}

main();
