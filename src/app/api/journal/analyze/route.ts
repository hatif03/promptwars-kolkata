import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callGroqWithFallback } from "@/lib/groq/pool";
import { buildJournalAnalystPrompt, JOURNAL_ANALYSIS_MODEL } from "@/lib/ai/prompts/journal";
import { checkCrisisContent, CRISIS_RESPONSE_TEMPLATE } from "@/lib/safety/crisis";
import type { JournalAnalysis } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content, mood, tags } = body as {
      content: string;
      mood?: string;
      tags?: string[];
    };

    if (!content?.trim()) {
      return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    const crisisCheck = checkCrisisContent(content);
    if (crisisCheck.isCrisis) {
      await supabase.from("crisis_events").insert({
        user_id: user.id,
        severity: crisisCheck.severity,
        source: "journal",
      });

      const { data: entry } = await supabase
        .from("journal_entries")
        .insert({
          user_id: user.id,
          content: content.trim(),
          ai_reflection: CRISIS_RESPONSE_TEMPLATE,
          themes: ["crisis"],
          micro_step: "Please call Tele-MANAS at 14416",
          invitation_question: "Can you reach out to someone you trust right now?",
        })
        .select()
        .single();

      return NextResponse.json({
        analysis: {
          reflection: CRISIS_RESPONSE_TEMPLATE,
          themes: ["crisis"],
          microStep: "Please call Tele-MANAS at 14416",
          invitationQuestion: "Can you reach out to someone you trust right now?",
          recommendedExerciseId: "box-breathing",
        },
        entry,
        isCrisis: true,
      });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("language_pref")
      .eq("id", user.id)
      .single();

    const language = profile?.language_pref ?? "hinglish";
    const systemPrompt = buildJournalAnalystPrompt(language);

    const userContext = [
      content.trim(),
      mood ? `Current mood: ${mood}` : "",
      tags?.length ? `Tags: ${tags.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const { result } = await callGroqWithFallback(async (client) => {
      return client.chat.completions.create({
        model: JOURNAL_ANALYSIS_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContext },
        ],
        temperature: 0.4,
        max_tokens: 600,
        response_format: { type: "json_object" },
      });
    });

    const raw = result.choices[0]?.message?.content ?? "{}";
    let analysis: JournalAnalysis;

    try {
      analysis = JSON.parse(raw) as JournalAnalysis;
    } catch {
      analysis = {
        reflection:
          "Thank you for sharing this. What you're feeling matters, and I'm glad you wrote it down.",
        themes: ["stress"],
        microStep: "Take 3 slow breaths before your next study block.",
        invitationQuestion: "Does this feel true to you?",
        recommendedExerciseId: "box-breathing",
      };
    }

    const postCrisis = checkCrisisContent(analysis.reflection);
    if (postCrisis.isCrisis) {
      analysis.reflection = CRISIS_RESPONSE_TEMPLATE;
    }

    const { data: entry, error } = await supabase
      .from("journal_entries")
      .insert({
        user_id: user.id,
        content: content.trim(),
        ai_reflection: analysis.reflection,
        themes: analysis.themes ?? [],
        micro_step: analysis.microStep,
        invitation_question: analysis.invitationQuestion,
        sentiment_signals: { mood, tags },
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (mood) {
      await supabase.from("mood_checkins").insert({
        user_id: user.id,
        mood,
        tags: tags ?? [],
      });
    }

    return NextResponse.json({ analysis, entry, isCrisis: false });
  } catch (error) {
    console.error("Journal analyze error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
