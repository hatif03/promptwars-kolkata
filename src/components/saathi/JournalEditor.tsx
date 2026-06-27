"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MoodStrip } from "./MoodStrip";
import type { JournalAnalysis, MoodType } from "@/lib/types";
import { getExerciseById } from "@/lib/data/calm-kit";
import { AI_DISCLAIMER } from "@/lib/safety/crisis";

type JournalEditorProps = {
  onSaved?: () => void;
  compact?: boolean;
};

export function JournalEditor({ onSaved, compact = false }: JournalEditorProps) {
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<MoodType | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<JournalAnalysis | null>(null);
  const [isCrisis, setIsCrisis] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!content.trim()) return;
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const res = await fetch("/api/journal/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, mood, tags }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");

      setAnalysis(data.analysis);
      setIsCrisis(data.isCrisis);
      setContent("");
      onSaved?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const exercise = analysis
    ? getExerciseById(analysis.recommendedExerciseId)
    : null;

  return (
    <div className="space-y-4">
      {!compact && (
        <MoodStrip
          onMoodSelect={(m, t) => {
            setMood(m);
            setTags(t);
          }}
        />
      )}

      <div>
        <label htmlFor="journal" className="mb-2 block text-sm font-medium text-saathi-ink">
          How are you really doing today?
        </label>
        <Textarea
          id="journal"
          placeholder="Write freely — Hinglish, fragments, anything. Saathi is listening..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[140px] bg-saathi-cream/30"
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={loading || !content.trim()}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saathi is reflecting...
          </>
        ) : (
          "Save & reflect"
        )}
      </Button>

      {error && (
        <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      {analysis && (
        <Card className={isCrisis ? "border-saathi-crisis/30 bg-red-50/50" : "bg-saathi-lavender/10"}>
          <CardContent className="space-y-3 pt-5">
            <div className="flex items-center gap-2 text-saathi-sage-dark">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Saathi&apos;s reflection</span>
            </div>
            <p className="text-sm leading-relaxed text-saathi-ink">{analysis.reflection}</p>
            {analysis.themes?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {analysis.themes.map((theme) => (
                  <span
                    key={theme}
                    className="rounded-full bg-white/80 px-3 py-1 text-xs text-saathi-muted"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            )}
            {analysis.microStep && (
              <p className="rounded-2xl bg-white/60 p-3 text-sm text-saathi-ink">
                <span className="font-medium">Tonight: </span>
                {analysis.microStep}
              </p>
            )}
            {analysis.invitationQuestion && (
              <p className="text-sm italic text-saathi-muted">
                {analysis.invitationQuestion}
              </p>
            )}
            {exercise && !isCrisis && (
              <Link href={`/calm-kit/${exercise.id}`}>
                <Button variant="secondary" className="w-full">
                  Try {exercise.title} ({exercise.duration} min)
                </Button>
              </Link>
            )}
            <p className="text-xs text-saathi-muted">{AI_DISCLAIMER}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
