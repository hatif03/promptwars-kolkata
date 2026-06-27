import { AppShell } from "@/components/saathi/AppShell";
import { OnboardingFlow } from "@/components/saathi/OnboardingFlow";

export default function OnboardingPage() {
  return (
    <AppShell title="Welcome" showNav={false}>
      <OnboardingFlow />
    </AppShell>
  );
}
