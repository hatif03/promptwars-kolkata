"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { WeeklyInsight } from "@/lib/types";

type InsightsViewProps = {
  initialInsight: WeeklyInsight | null;
  initialMessage: string | null;
};

export function InsightsView({ initialInsight, initialMessage }: InsightsViewProps) {
  const [insight, setInsight] = useState(initialInsight);
  const [message, setMessage] = useState(initialMessage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/insights/weekly?force=true");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load");

      if (data.parsed) {
        setInsight(data.parsed);
        setMessage(null);
      } else if (data.insight?.summary) {
        setInsight({
          summary: data.insight.summary,
          patterns: data.insight.patterns ?? [],
          invitationQuestion: data.insight.invitation_question ?? "",
          focusForWeek: "",
        });
        setMessage(null);
      } else {
        setInsight(null);
        setMessage(data.message ?? "Keep journaling to unlock your Pattern Report.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load insights");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-5 text-sm text-red-700">{error}</CardContent>
        </Card>
      )}

      {message && !insight && (
        <Card>
          <CardContent className="pt-5 text-center text-sm text-saathi-muted">
            {message}
          </CardContent>
        </Card>
      )}

      {insight && (
        <>
          <Card className="bg-saathi-lavender/10">
            <CardContent className="space-y-3 pt-5">
              <div className="flex items-center gap-2 text-saathi-sage-dark">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">This week</span>
              </div>
              <p className="text-sm leading-relaxed text-saathi-ink">{insight.summary}</p>
            </CardContent>
          </Card>

          {insight.patterns?.map((pattern, i) => (
            <Card key={i}>
              <CardContent className="space-y-2 pt-5">
                <p className="text-sm text-saathi-ink">{pattern.observation}</p>
                {pattern.evidenceQuote && (
                  <blockquote className="border-l-2 border-saathi-sage/30 pl-3 text-xs italic text-saathi-muted">
                    &ldquo;{pattern.evidenceQuote}&rdquo;
                  </blockquote>
                )}
              </CardContent>
            </Card>
          ))}

          {insight.focusForWeek && (
            <Card className="bg-saathi-cream/50">
              <CardContent className="pt-5">
                <p className="text-sm font-medium text-saathi-ink">Focus this week</p>
                <p className="mt-1 text-sm text-saathi-muted">{insight.focusForWeek}</p>
              </CardContent>
            </Card>
          )}

          {insight.invitationQuestion && (
            <p className="text-center text-sm italic text-saathi-muted">
              {insight.invitationQuestion}
            </p>
          )}
        </>
      )}

      <Button variant="outline" className="w-full" onClick={refresh} disabled={loading}>
        {loading ? "Refreshing..." : "Refresh report"}
      </Button>
    </div>
  );
}
