import { AppShell } from "@/components/saathi/AppShell";
import { CalmKitList } from "@/components/saathi/CalmKitList";

export default function CalmKitPage() {
  return (
    <AppShell title="Calm Kit" subtitle="2–7 min exercises for when you need them">
      <CalmKitList />
    </AppShell>
  );
}
