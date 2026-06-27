import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callGroqWithFallback } from "@/lib/groq/pool";
import { buildInsightsPrompt, INSIGHTS_MODEL } from "@/lib/ai/prompts/insights";
import type { WeeklyInsight } from "@/lib/types";

function getWeekStart(date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const weekStart = getWeekStart();
    const force = request.nextUrl.searchParams.get("force") === "true";

    const { data: existing } = await supabase
      .from("weekly_insights")
      .select("*")
      .eq("user_id", user.id)
      .eq("week_start", weekStart)
      .single();

    if (existing && !force) {
      return NextResponse.json({ insight: existing, cached: true });
    }

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data: journals } = await supabase
      .from("journal_entries")
      .select("content, themes, created_at")
      .eq("user_id", user.id)
      .gte("created_at", weekAgo.toISOString())
      .order("created_at", { ascending: true });

    const { data: moods } = await supabase
      .from("mood_checkins")
      .select("mood, tags, created_at")
      .eq("user_id", user.id)
      .gte("created_at", weekAgo.toISOString());

    if (!journals?.length && !moods?.length) {
      return NextResponse.json({
        insight: null,
        message: "Write a few journal entries this week to unlock your Pattern Report.",
      });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("language_pref")
      .eq("id", user.id)
      .single();

    const language = profile?.language_pref ?? "hinglish";
    const dataPayload = JSON.stringify({ journals, moods }, null, 2);

    const { result } = await callGroqWithFallback(async (client) => {
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

    const { data: insight, error } = await supabase
      .from("weekly_insights")
      .upsert(
        {
          user_id: user.id,
          week_start: weekStart,
          summary: parsed.summary,
          patterns: parsed.patterns,
          evidence_quotes: parsed.patterns.map((p) => p.evidenceQuote),
          invitation_question: parsed.invitationQuestion,
        },
        { onConflict: "user_id,week_start" }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ insight, parsed, cached: false });
  } catch (error) {
    console.error("Insights error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Insights failed" },
      { status: 500 }
    );
  }
}
