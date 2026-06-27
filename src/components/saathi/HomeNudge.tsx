import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type HomeNudgeProps = {
  nudgeEnabled: boolean;
  daysSinceLastJournal: number | null;
  recentLowMoods: number;
};

export function HomeNudge({
  nudgeEnabled,
  daysSinceLastJournal,
  recentLowMoods,
}: HomeNudgeProps) {
  if (!nudgeEnabled) return null;

  const needsJournal =
    daysSinceLastJournal !== null && daysSinceLastJournal >= 3;
  const needsCheckIn = recentLowMoods >= 2;

  if (!needsJournal && !needsCheckIn) return null;

  const message = needsJournal
    ? "It's been a few days since you journaled. Even one line helps Saathi understand you better."
    : "You've had some tough moods lately. Want to talk to Saathi or try a quick Calm Kit exercise?";

  return (
    <Card className="mb-4 border-saathi-lavender/40 bg-saathi-lavender/20">
      <CardContent className="space-y-3 pt-5">
        <p className="text-sm text-saathi-ink">{message}</p>
        <div className="flex gap-2">
          <Link href={needsJournal ? "/journal" : "/companion"} className="flex-1">
            <Button size="sm" className="w-full">
              {needsJournal ? "Write a journal entry" : "Talk to Saathi"}
            </Button>
          </Link>
          <Link href="/calm-kit" className="flex-1">
            <Button size="sm" variant="outline" className="w-full">
              Calm Kit
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
