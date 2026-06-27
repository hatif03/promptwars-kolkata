import { AppShell } from "@/components/saathi/AppShell";
import { CompanionChat } from "@/components/saathi/CompanionChat";

export default function CompanionPage() {
  return (
    <AppShell title="Saathi" subtitle="Your AI companion — here to listen">
      <CompanionChat />
    </AppShell>
  );
}
