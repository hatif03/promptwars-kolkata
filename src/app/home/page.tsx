import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/saathi/AppShell";
import { WelcomeHeader, HomeCards } from "@/components/saathi/HomeCards";
import { JournalEditor } from "@/components/saathi/JournalEditor";
import { MoodStrip } from "@/components/saathi/MoodStrip";

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

  return (
    <AppShell>
      <WelcomeHeader displayName={profile?.display_name ?? "friend"} />
      <div className="mb-6">
        <MoodStrip compact />
      </div>
      <JournalEditor compact />
      <div className="mt-8">
        <HomeCards
          displayName={profile?.display_name ?? "friend"}
          recentThemes={recentThemes}
        />
      </div>
    </AppShell>
  );
}
