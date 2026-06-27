import { AppShell } from "@/components/saathi/AppShell";
import { InsightsView } from "@/components/saathi/InsightsView";
import { createClient } from "@/lib/supabase/server";
import { callGroqWithFallback } from "@/lib/groq/pool";
import { buildInsightsPrompt, INSIGHTS_MODEL } from "@/lib/ai/prompts/insights";
import type { WeeklyInsight } from "@/lib/types";
import { hasGroqKeys } from "@/lib/groq/keys";

export const dynamic = "force-dynamic";

function getWeekStart(date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

async function loadInsights(userId: string) {
  const supabase = await createClient();
  const weekStart = getWeekStart();

  const { data: existing } = await supabase
    .from("weekly_insights")
    .select("*")
    .eq("user_id", userId)
    .eq("week_start", weekStart)
    .single();

  if (existing) {
    return {
      insight: {
        summary: existing.summary,
        patterns: (existing.patterns as WeeklyInsight["patterns"]) ?? [],
        invitationQuestion: existing.invitation_question ?? "",
        focusForWeek: "",
      },
      message: null,
    };
  }

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { data: journals } = await supabase
    .from("journal_entries")
    .select("content, themes, created_at")
    .eq("user_id", userId)
    .gte("created_at", weekAgo.toISOString());

  const { data: moods } = await supabase
    .from("mood_checkins")
    .select("mood, tags, created_at")
    .eq("user_id", userId)
    .gte("created_at", weekAgo.toISOString());

  if (!journals?.length && !moods?.length) {
    return {
      insight: null,
      message: "Write a few journal entries this week to unlock your Pattern Report.",
    };
  }

  if (!hasGroqKeys()) {
    return {
      insight: null,
      message: "Add Groq API keys to generate your Pattern Report.",
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("language_pref")
    .eq("id", userId)
    .single();

  const language = profile?.language_pref ?? "hinglish";

  const { result } = await callGroqWithFallback(async (client) => {
    return client.chat.completions.create({
      model: INSIGHTS_MODEL,
      messages: [
        { role: "system", content: buildInsightsPrompt(language) },
        { role: "user", content: JSON.stringify({ journals, moods }, null, 2) },
      ],
      temperature: 0.3,
      max_tokens: 900,
      response_format: { type: "json_object" },
    });
  });

  const raw = result.choices[0]?.message?.content ?? "{}";
  let parsed: WeeklyInsight;

  try {
    parsed = JSON.parse(raw) as WeeklyInsight;
  } catch {
    parsed = {
      summary: "You've been showing up for yourself this week. That takes courage.",
      patterns: [],
      invitationQuestion: "Does anything feel familiar here?",
      focusForWeek: "Try one small break without guilt.",
    };
  }

  await supabase.from("weekly_insights").upsert(
    {
      user_id: userId,
      week_start: weekStart,
      summary: parsed.summary,
      patterns: parsed.patterns,
      evidence_quotes: parsed.patterns.map((p) => p.evidenceQuote),
      invitation_question: parsed.invitationQuestion,
    },
    { onConflict: "user_id,week_start" }
  );

  return { insight: parsed, message: null };
}

export default async function InsightsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initial: { insight: WeeklyInsight | null; message: string | null } = {
    insight: null,
    message: "Sign in to view insights.",
  };

  if (user) {
    try {
      initial = await loadInsights(user.id);
    } catch {
      initial = { insight: null, message: "Could not load insights right now." };
    }
  }

  return (
    <AppShell title="Pattern Report" subtitle="What your words are telling you">
      <InsightsView initialInsight={initial.insight} initialMessage={initial.message} />
    </AppShell>
  );
}
