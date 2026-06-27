import { AppShell } from "@/components/saathi/AppShell";
import { JournalEditor } from "@/components/saathi/JournalEditor";

export default function JournalPage() {
  return (
    <AppShell title="Journal" subtitle="Just write — Saathi listens">
      <JournalEditor />
    </AppShell>
  );
}
