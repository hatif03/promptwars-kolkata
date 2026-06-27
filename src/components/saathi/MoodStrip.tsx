"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MOOD_OPTIONS, MOOD_TAGS, type MoodType } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

type MoodStripProps = {
  onMoodSelect?: (mood: MoodType, tags: string[]) => void;
  selectedMood?: MoodType | null;
  compact?: boolean;
};

export function MoodStrip({
  onMoodSelect,
  selectedMood,
  compact = false,
}: MoodStripProps) {
  const isControlled = selectedMood !== undefined;
  const [internalMood, setInternalMood] = useState<MoodType | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const mood = isControlled ? selectedMood : internalMood;

  function toggleTag(tag: string) {
    setTags((prev) => {
      const next = prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag];
      if (mood) onMoodSelect?.(mood, next);
      return next;
    });
  }

  function selectMood(m: MoodType) {
    if (!isControlled) setInternalMood(m);
    onMoodSelect?.(m, tags);
  }

  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      <p id="mood-strip-label" className="text-sm text-saathi-muted">
        How are you feeling today?
      </p>
      <div
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
        role="group"
        aria-labelledby="mood-strip-label"
      >
        {MOOD_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => selectMood(option.id)}
            aria-label={`Feeling ${option.label}`}
            aria-pressed={mood === option.id}
            className={cn(
              "flex min-w-[64px] flex-col items-center gap-1 rounded-2xl p-2 transition-colors",
              mood === option.id
                ? "bg-saathi-sage text-white ring-2 ring-saathi-sage-dark"
                : "bg-saathi-surface ring-1 ring-saathi-border hover:bg-saathi-sage-light"
            )}
          >
            <span className="text-2xl" aria-hidden="true">
              {option.emoji}
            </span>
            <span
              className={cn(
                "text-xs",
                mood === option.id ? "text-white" : "text-saathi-ink"
              )}
            >
              {option.label}
            </span>
          </button>
        ))}
      </div>
      {!compact && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Context tags">
          {MOOD_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              aria-label={`Tag ${tag}`}
              aria-pressed={tags.includes(tag)}
            >
              <Badge
                className={cn(
                  "cursor-pointer transition-colors",
                  tags.includes(tag) && "bg-saathi-sage/30 ring-1 ring-saathi-sage/40"
                )}
              >
                {tag}
              </Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function useMoodState() {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  return {
    selectedMood,
    selectedTags,
    setSelectedMood,
    setSelectedTags,
    reset: () => {
      setSelectedMood(null);
      setSelectedTags([]);
    },
  };
}
