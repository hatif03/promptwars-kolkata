import { NextRequest, NextResponse } from "next/server";
import { createGroq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { createClient } from "@/lib/supabase/server";
import { buildCompanionPrompt, COMPANION_MODEL } from "@/lib/ai/prompts/companion";
import { checkCrisisContent, CRISIS_RESPONSE_TEMPLATE } from "@/lib/safety/crisis";
import { loadApiKeys } from "@/lib/groq/keys";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, sessionId } = await request.json();

    if (!messages?.length) {
      return NextResponse.json({ error: "Messages required" }, { status: 400 });
    }

    const lastUserMessage = [...messages]
      .reverse()
      .find((m: { role: string }) => m.role === "user");

    if (lastUserMessage?.content) {
      const crisisCheck = checkCrisisContent(lastUserMessage.content);
      if (crisisCheck.isCrisis) {
        await supabase.from("crisis_events").insert({
          user_id: user.id,
          severity: crisisCheck.severity,
          source: "chat",
        });
      }
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const { data: recentMoods } = await supabase
      .from("mood_checkins")
      .select("mood")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(7);

    const { data: recentJournals } = await supabase
      .from("journal_entries")
      .select("themes, content")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3);

    const recentThemes = [
      ...new Set(recentJournals?.flatMap((j) => j.themes ?? []) ?? []),
    ];

    const systemPrompt = buildCompanionPrompt({
      displayName: profile?.display_name ?? "Student",
      examType: profile?.exam_type ?? "NEET",
      languagePref: profile?.language_pref ?? "hinglish",
      trustLevel: profile?.trust_level ?? 1,
      daysToExam: profile?.days_to_exam,
      recentMoods: recentMoods?.map((m) => m.mood) ?? [],
      recentThemes,
      recentJournalSnippet: recentJournals?.[0]?.content,
    });

    const keys = loadApiKeys();
    const apiKey = keys[0];
    if (!apiKey) {
      return NextResponse.json({ error: "Groq API key not configured" }, { status: 503 });
    }

    const groq = createGroq({ apiKey });

    if (lastUserMessage?.content && checkCrisisContent(lastUserMessage.content).isCrisis) {
      let activeSessionId = sessionId;
      if (!activeSessionId) {
        const { data: session } = await supabase
          .from("chat_sessions")
          .insert({ user_id: user.id, title: "Crisis support" })
          .select()
          .single();
        activeSessionId = session?.id;
      }

      if (activeSessionId) {
        await supabase.from("chat_messages").insert([
          { session_id: activeSessionId, role: "user", content: lastUserMessage.content },
          { session_id: activeSessionId, role: "assistant", content: CRISIS_RESPONSE_TEMPLATE },
        ]);
      }

      return new Response(CRISIS_RESPONSE_TEMPLATE, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const result = streamText({
      model: groq(COMPANION_MODEL),
      system: systemPrompt,
      messages,
      temperature: 0.7,
      maxOutputTokens: 800,
      onFinish: async ({ text }) => {
        let activeSessionId = sessionId;
        if (!activeSessionId) {
          const { data: session } = await supabase
            .from("chat_sessions")
            .insert({
              user_id: user.id,
              title: lastUserMessage?.content?.slice(0, 40) ?? "Conversation",
            })
            .select()
            .single();
          activeSessionId = session?.id;
        }

        if (activeSessionId && lastUserMessage?.content) {
          await supabase.from("chat_messages").insert([
            { session_id: activeSessionId, role: "user", content: lastUserMessage.content },
            { session_id: activeSessionId, role: "assistant", content: text },
          ]);
        }
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Chat failed" },
      { status: 500 }
    );
  }
}
