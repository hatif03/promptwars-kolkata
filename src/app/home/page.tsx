import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/saathi/AppShell";
import { WelcomeHeader, HomeCards } from "@/components/saathi/HomeCards";
import { HomeJournalSection } from "@/components/saathi/HomeJournalSection";
import { HomeNudge } from "@/components/saathi/HomeNudge";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  const { data: recentJournals } = await supabase
    .from("journal_entries")
    .select("themes")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const recentThemes = [
    ...new Set(recentJournals?.flatMap((j) => j.themes ?? []) ?? []),
  ];

  const { data: lastJournal } = await supabase
    .from("journal_entries")
    .select("created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const now = new Date();
  const daysSinceLastJournal = lastJournal?.created_at
    ? Math.floor(
        (now.getTime() - new Date(lastJournal.created_at).getTime()) / (1000 * 60 * 60 * 24)
      )
    : null;

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const { data: recentMoods } = await supabase
    .from("mood_checkins")
    .select("mood")
    .eq("user_id", user!.id)
    .gte("created_at", weekAgo.toISOString());

  const recentLowMoods =
    recentMoods?.filter((m) => m.mood === "low" || m.mood === "anxious").length ?? 0;

  return (
    <AppShell>
      <WelcomeHeader displayName={profile?.display_name ?? "friend"} />
      <HomeNudge
        nudgeEnabled={profile?.nudge_enabled ?? false}
        daysSinceLastJournal={daysSinceLastJournal}
        recentLowMoods={recentLowMoods}
      />
      <HomeJournalSection />
      <div className="mt-8">
        <HomeCards
          displayName={profile?.display_name ?? "friend"}
          recentThemes={recentThemes}
          daysToExam={profile?.days_to_exam}
        />
      </div>
    </AppShell>
  );
}
