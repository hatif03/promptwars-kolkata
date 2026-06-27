import { NextResponse } from "next/server";
import { hasGroqKeys, loadApiKeys } from "@/lib/groq/keys";
import { callGroqWithFallback } from "@/lib/groq/pool";
import { pingChatModel } from "@/lib/groq/stream-pool";
import { COMPANION_MODEL } from "@/lib/ai/prompts/companion";
import {
  JOURNAL_ANALYSIS_MODEL,
  buildJournalAnalystPrompt,
} from "@/lib/ai/prompts/journal";
import { parseJournalAnalysis } from "@/lib/ai/parse-journal-analysis";
import { generateWeeklyInsight } from "@/lib/ai/generate-weekly-insight";
import Groq from "groq-sdk";

type SurfaceStatus = "ok" | "fail" | "skipped";

type HealthResult = {
  keysConfigured: number;
  chat: SurfaceStatus;
  journal: SurfaceStatus;
  insights: SurfaceStatus;
  keyIdsUsed: string[];
  latencyMs: number;
  errors?: Record<string, string>;
};

function isHealthCheckEnabled(): boolean {
  return process.env.AI_HEALTH_CHECK_ENABLED === "true" || process.env.NODE_ENV === "development";
}

export async function GET() {
  if (!isHealthCheckEnabled()) {
    return NextResponse.json({ error: "AI health check disabled" }, { status: 403 });
  }

  const start = Date.now();
  const keys = loadApiKeys();
  const result: HealthResult = {
    keysConfigured: keys.length,
    chat: "skipped",
    journal: "skipped",
    insights: "skipped",
    keyIdsUsed: [],
    latencyMs: 0,
    errors: {},
  };

  if (!hasGroqKeys()) {
    result.errors = { keys: "No Groq API keys configured" };
    result.latencyMs = Date.now() - start;
    return NextResponse.json(result, { status: 503 });
  }

  try {
    const chatPing = await pingChatModel(COMPANION_MODEL);
    result.chat = "ok";
    result.keyIdsUsed.push(chatPing.keyId);
  } catch (error) {
    result.chat = "fail";
    result.errors!.chat = error instanceof Error ? error.message : "Chat ping failed";
  }

  try {
    const { result: journalResult, keyId } = await callGroqWithFallback(async (client: Groq) => {
      return client.chat.completions.create({
        model: JOURNAL_ANALYSIS_MODEL,
        messages: [
          { role: "system", content: buildJournalAnalystPrompt("en") },
          { role: "user", content: "Feeling a bit stressed about physics mock tomorrow." },
        ],
        temperature: 0.2,
        max_tokens: 200,
        response_format: { type: "json_object" },
      });
    });
    parseJournalAnalysis(journalResult.choices[0]?.message?.content ?? "{}");
    result.journal = "ok";
    result.keyIdsUsed.push(keyId);
  } catch (error) {
    result.journal = "fail";
    result.errors!.journal = error instanceof Error ? error.message : "Journal ping failed";
  }

  try {
    await generateWeeklyInsight(
      [
        {
          content: "Physics mock went badly. Feeling low.",
          themes: ["physics", "mock test"],
          created_at: new Date().toISOString(),
        },
      ],
      [{ mood: "low", tags: ["physics"], created_at: new Date().toISOString() }],
      "en"
    );
    result.insights = "ok";
  } catch (error) {
    result.insights = "fail";
    result.errors!.insights = error instanceof Error ? error.message : "Insights ping failed";
  }

  result.latencyMs = Date.now() - start;
  result.keyIdsUsed = [...new Set(result.keyIdsUsed)];

  const allOk =
    result.chat === "ok" && result.journal === "ok" && result.insights === "ok";

  return NextResponse.json(result, { status: allOk ? 200 : 503 });
}
