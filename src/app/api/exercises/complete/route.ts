import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { exerciseId, helpfulRating, triggerContext } = await request.json();

    await supabase.from("exercise_completions").insert({
      user_id: user.id,
      exercise_id: exerciseId,
      helpful_rating: helpfulRating,
      trigger_context: triggerContext,
    });

    const { data: existing } = await supabase
      .from("coping_preferences")
      .select("*")
      .eq("user_id", user.id)
      .eq("exercise_id", exerciseId)
      .single();

    const newScore = helpfulRating / 5;
    const useCount = (existing?.use_count ?? 0) + 1;
    const effectiveness = existing
      ? (existing.effectiveness_score * (useCount - 1) + newScore) / useCount
      : newScore;

    await supabase.from("coping_preferences").upsert(
      {
        user_id: user.id,
        exercise_id: exerciseId,
        effectiveness_score: effectiveness,
        use_count: useCount,
      },
      { onConflict: "user_id,exercise_id" }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}
