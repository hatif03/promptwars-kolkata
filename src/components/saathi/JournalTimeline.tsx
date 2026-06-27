"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export type JournalEntryRow = {
  id: string;
  content: string;
  ai_reflection: string | null;
  themes: string[] | null;
  micro_step: string | null;
  invitation_question: string | null;
  created_at: string;
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  if (isToday) return "Today — Exam Day";

  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
}

function excerpt(text: string, max = 120): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trim() + "…";
}

function EntryCard({ entry, defaultOpen }: { entry: JournalEntryRow; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const isToday = formatDate(entry.created_at).startsWith("Today");
  const detailsId = `journal-entry-${entry.id}`;

  return (
    <Card className={isToday ? "border-saathi-sage/40 bg-saathi-sage/5" : ""}>
      <CardContent className="p-4">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls={detailsId}
          className="flex w-full items-start justify-between gap-2 text-left"
        >
          <div className="min-w-0 flex-1">
            <p className={`text-xs font-medium ${isToday ? "text-saathi-sage-dark" : "text-saathi-muted"}`}>
              {formatDate(entry.created_at)}
            </p>
            <p className="mt-1 text-sm text-saathi-ink">
              {open ? entry.content : excerpt(entry.content)}
            </p>
            {!open && entry.themes && entry.themes.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {entry.themes.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-saathi-lavender/20 px-2 py-0.5 text-xs text-saathi-muted"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
          {open ? (
            <ChevronUp className="h-4 w-4 shrink-0 text-saathi-muted" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 text-saathi-muted" aria-hidden="true" />
          )}
        </button>

        {open && (
          <div id={detailsId} className="mt-3 space-y-3 border-t border-saathi-sage/10 pt-3">
            {entry.themes && entry.themes.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {entry.themes.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-saathi-lavender/20 px-2 py-0.5 text-xs text-saathi-muted"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
            {entry.ai_reflection && (
              <div className="rounded-2xl bg-saathi-lavender/15 px-3 py-2">
                <p className="text-xs font-medium text-saathi-sage-dark">Saathi</p>
                <p className="mt-1 text-sm italic text-saathi-ink">{entry.ai_reflection}</p>
              </div>
            )}
            {entry.micro_step && (
              <p className="text-xs text-saathi-muted">
                <span className="font-medium">Micro-step:</span> {entry.micro_step}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

type JournalTimelineProps = {
  entries: JournalEntryRow[];
};

export function JournalTimeline({ entries }: JournalTimelineProps) {
  if (entries.length === 0) return null;

  const todayStr = new Date().toISOString().split("T")[0];
  const sorted = [...entries].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="mb-8 space-y-3">
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-saathi-sage" />
        <h3 className="text-sm font-medium text-saathi-ink">Your journal history</h3>
        <span className="text-xs text-saathi-muted">({entries.length} entries)</span>
      </div>
      {sorted.map((entry, i) => {
        const entryDate = entry.created_at.split("T")[0];
        const isExamDay = entryDate === todayStr;
        return (
          <EntryCard key={entry.id} entry={entry} defaultOpen={isExamDay && i === 0} />
        );
      })}
    </div>
  );
}
