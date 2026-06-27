import Link from "next/link";
import { Wind, MessageCircle, BookOpen, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDailyQuote } from "@/lib/data/quotes";
import { recommendExercise } from "@/lib/data/calm-kit";

type HomeCardsProps = {
  displayName: string;
  recentThemes?: string[];
};

export function HomeCards({ recentThemes = [] }: HomeCardsProps) {
  const exercise = recommendExercise(recentThemes);
  const quote = getDailyQuote();

  return (
    <div className="space-y-4">
      <Link href="/companion">
        <Card className="overflow-hidden bg-gradient-to-br from-saathi-sage/20 to-saathi-lavender/30 transition-transform hover:scale-[1.01]">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-lg font-semibold text-saathi-ink">Talk to Saathi</p>
              <p className="mt-1 text-sm text-saathi-muted">
                Open up about what matters most — I&apos;m listening.
              </p>
              <Button size="sm" className="mt-3">
                Start chat
              </Button>
            </div>
            <MessageCircle className="h-12 w-12 text-saathi-sage/60" />
          </CardContent>
        </Card>
      </Link>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/journal">
          <Card className="h-full transition-colors hover:bg-saathi-cream/50">
            <CardContent className="flex flex-col items-start gap-2 p-4">
              <BookOpen className="h-5 w-5 text-saathi-sage" />
              <span className="font-medium text-saathi-ink">Journal</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/calm-kit">
          <Card className="h-full transition-colors hover:bg-saathi-cream/50">
            <CardContent className="flex flex-col items-start gap-2 p-4">
              <Wind className="h-5 w-5 text-saathi-sage" />
              <span className="font-medium text-saathi-ink">Calm Kit</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card className="bg-saathi-cream/40">
        <CardContent className="p-4">
          <p className="text-sm italic leading-relaxed text-saathi-ink">
            &ldquo;{quote}&rdquo;
          </p>
        </CardContent>
      </Card>

      {recentThemes.length > 0 && (
        <Link href={`/calm-kit/${exercise.id}`}>
          <Card className="border-saathi-sage/20">
            <CardContent className="flex items-center gap-3 p-4">
              <Sparkles className="h-5 w-5 shrink-0 text-saathi-sage" />
              <div>
                <p className="text-sm font-medium text-saathi-ink">
                  Suggested for you: {exercise.title}
                </p>
                <p className="text-xs text-saathi-muted">{exercise.duration} min</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      <Link href="/insights">
        <Button variant="outline" className="w-full">
          View Pattern Report
        </Button>
      </Link>
    </div>
  );
}

export function WelcomeHeader({ displayName }: { displayName: string }) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="mb-4">
      <h2 className="text-2xl font-semibold text-saathi-ink">
        {greeting}, {displayName}!
      </h2>
      <p className="text-sm text-saathi-muted">How are you really doing today?</p>
    </div>
  );
}
