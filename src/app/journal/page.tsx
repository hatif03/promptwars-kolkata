import { AppShell } from "@/components/saathi/AppShell";
import { JournalEditor } from "@/components/saathi/JournalEditor";
import { JournalTimeline } from "@/components/saathi/JournalTimeline";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let entries: Parameters<typeof JournalTimeline>[0]["entries"] = [];

  if (user) {
    const { data } = await supabase
      .from("journal_entries")
      .select("id, content, ai_reflection, themes, micro_step, invitation_question, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    entries = data ?? [];
  }

  return (
    <AppShell title="Journal" subtitle="Just write — Saathi listens">
      <JournalTimeline entries={entries} />
      <JournalEditor />
    </AppShell>
  );
}
