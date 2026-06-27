import type Groq from "groq-sdk";
import { callGroqWithFallback } from "@/lib/groq/pool";
import {
  buildInsightsPrompt,
  INSIGHTS_MODEL,
} from "@/lib/ai/prompts/insights";
import type { WeeklyInsight } from "@/lib/types";

export type JournalRow = {
  content: string;
  themes: string[] | null;
  created_at: string;
};

export type MoodRow = {
  mood: string;
  tags: string[] | null;
  created_at: string;
};

export function parseWeeklyInsight(raw: string): WeeklyInsight {
  try {
    return JSON.parse(raw) as WeeklyInsight;
  } catch {
    return {
      summary: "You've been showing up for yourself this week. That takes courage.",
      patterns: [],
      invitationQuestion: "Does anything feel familiar here?",
      focusForWeek: "Try one small break without guilt.",
    };
  }
}

export async function generateWeeklyInsight(
  journals: JournalRow[],
  moods: MoodRow[],
  language: string
): Promise<WeeklyInsight> {
  const dataPayload = JSON.stringify({ journals, moods }, null, 2);

  const { result } = await callGroqWithFallback(async (client: Groq) => {
    return client.chat.completions.create({
      model: INSIGHTS_MODEL,
      messages: [
        { role: "system", content: buildInsightsPrompt(language) },
        { role: "user", content: dataPayload },
      ],
      temperature: 0.3,
      max_tokens: 900,
      response_format: { type: "json_object" },
    });
  });

  const raw = result.choices[0]?.message?.content ?? "{}";
  return parseWeeklyInsight(raw);
}

export function getWeekStart(date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}
