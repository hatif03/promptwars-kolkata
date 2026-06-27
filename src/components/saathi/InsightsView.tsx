"use client";

import { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { WeeklyInsight, WeeklyInsightRecord } from "@/lib/types";

type InsightsViewProps = {
  currentInsight: WeeklyInsight | null;
  pastInsights: WeeklyInsightRecord[];
  initialMessage: string | null;
};

function formatWeekLabel(weekStart: string, label?: string): string {
  if (label) return label;
  const d = new Date(weekStart);
  return `Week of ${d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`;
}

function InsightContent({ insight, hero }: { insight: WeeklyInsight; hero?: boolean }) {
  return (
    <>
      <Card className={hero ? "border-saathi-sage/25 bg-saathi-lavender/20" : ""}>
        <CardContent className="space-y-3 pt-5">
          {hero && (
            <div className="flex items-center gap-2 text-saathi-sage-dark">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">This week</span>
            </div>
          )}
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
  );
}

function PastReportCard({ record }: { record: WeeklyInsightRecord }) {
  const [open, setOpen] = useState(false);
  const isWeek4 = record.weekStart === "2026-04-28";

  return (
    <Card className={isWeek4 ? "border-saathi-sage/30" : ""}>
      <CardContent className="p-4">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between gap-2 text-left"
        >
          <div>
            <p className="text-sm font-medium text-saathi-ink">
              {formatWeekLabel(record.weekStart, record.label)}
            </p>
            {!open && (
              <p className="mt-1 line-clamp-2 text-xs text-saathi-muted">{record.summary}</p>
            )}
          </div>
          {open ? (
            <ChevronUp className="h-4 w-4 shrink-0 text-saathi-muted" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 text-saathi-muted" />
          )}
        </button>
        {open && (
          <div className="mt-4 space-y-3">
            <InsightContent insight={record} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function InsightsView({
  currentInsight,
  pastInsights,
  initialMessage,
}: InsightsViewProps) {
  const [insight, setInsight] = useState(currentInsight);
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
        <Card className="border-saathi-destructive/30 bg-saathi-destructive/5">
          <CardContent className="pt-5 text-sm text-saathi-destructive">{error}</CardContent>
        </Card>
      )}

      {message && !insight && (
        <Card>
          <CardContent className="pt-5 text-center text-sm text-saathi-muted">
            {message}
          </CardContent>
        </Card>
      )}

      {insight && <InsightContent insight={insight} hero />}

      {pastInsights.length > 0 && (
        <div className="space-y-2 pt-2">
          <h3 className="text-sm font-medium text-saathi-ink">Past reports</h3>
          {pastInsights.map((record) => (
            <PastReportCard key={record.weekStart} record={record} />
          ))}
        </div>
      )}

      <Button variant="outline" className="w-full" onClick={refresh} disabled={loading}>
        {loading ? "Refreshing..." : "Refresh report"}
      </Button>
    </div>
  );
}
