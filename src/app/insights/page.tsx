import { AppShell } from "@/components/saathi/AppShell";
import { InsightsView } from "@/components/saathi/InsightsView";
import { createClient } from "@/lib/supabase/server";
import { generateWeeklyInsight, getWeekStart } from "@/lib/ai/generate-weekly-insight";
import type { WeeklyInsight, WeeklyInsightRecord } from "@/lib/types";
import { hasGroqKeys } from "@/lib/groq/keys";

export const dynamic = "force-dynamic";

const WEEK_LABELS: Record<string, string> = {
  "2026-04-07": "Week 2 — Early patterns",
  "2026-04-28": "Week 4 — The Sunday pattern",
  "2026-05-19": "Month 2 — Progress",
  "2026-06-09": "Month 3 — Coping rituals",
  "2026-06-23": "Exam week",
};

const FOCUS_LABELS: Record<string, string> = {
  "2026-04-07": "Try 3 minutes of breathing before opening physics notes.",
  "2026-04-28": "Try journaling before and after your Sunday call to see how it affects you.",
  "2026-05-19": "Keep the before/after call journaling — it's working.",
  "2026-06-09": "Trust your rituals on exam week.",
  "2026-06-23": "Exam day: breathe first, then everything else.",
};

async function loadInsights(userId: string) {
  const supabase = await createClient();
  const weekStart = getWeekStart();

  const { data: allInsights } = await supabase
    .from("weekly_insights")
    .select("*")
    .eq("user_id", userId)
    .order("week_start", { ascending: false });

  const existing = allInsights?.find((i) => i.week_start === weekStart);

  const pastInsights: WeeklyInsightRecord[] = (allInsights ?? [])
    .filter((i) => i.week_start !== weekStart)
    .map((i) => ({
      weekStart: i.week_start,
      label: WEEK_LABELS[i.week_start],
      summary: i.summary,
      patterns: (i.patterns as WeeklyInsight["patterns"]) ?? [],
      invitationQuestion: i.invitation_question ?? "",
      focusForWeek: FOCUS_LABELS[i.week_start] ?? "",
    }));

  if (existing) {
    return {
      currentInsight: {
        summary: existing.summary,
        patterns: (existing.patterns as WeeklyInsight["patterns"]) ?? [],
        invitationQuestion: existing.invitation_question ?? "",
        focusForWeek: FOCUS_LABELS[weekStart] ?? "",
      },
      pastInsights,
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
      currentInsight: null,
      pastInsights,
      message: "Write a few journal entries this week to unlock your Pattern Report.",
    };
  }

  if (!hasGroqKeys()) {
    return {
      currentInsight: null,
      pastInsights,
      message: "Add Groq API keys to generate your Pattern Report.",
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("language_pref")
    .eq("id", userId)
    .single();

  const language = profile?.language_pref ?? "hinglish";

  const parsed = await generateWeeklyInsight(journals ?? [], moods ?? [], language);

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

  return { currentInsight: parsed, pastInsights, message: null };
}

export default async function InsightsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initial: {
    currentInsight: WeeklyInsight | null;
    pastInsights: WeeklyInsightRecord[];
    message: string | null;
  } = {
    currentInsight: null,
    pastInsights: [],
    message: "Sign in to view insights.",
  };

  if (user) {
    try {
      initial = await loadInsights(user.id);
    } catch {
      initial = {
        currentInsight: null,
        pastInsights: [],
        message: "Could not load insights right now.",
      };
    }
  }

  return (
    <AppShell title="Pattern Report" subtitle="What your words are telling you">
      <InsightsView
        currentInsight={initial.currentInsight}
        pastInsights={initial.pastInsights}
        initialMessage={initial.message}
      />
    </AppShell>
  );
}
