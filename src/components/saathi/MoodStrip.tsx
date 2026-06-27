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
  const [mood, setMood] = useState<MoodType | null>(selectedMood ?? null);
  const [tags, setTags] = useState<string[]>([]);

  function toggleTag(tag: string) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function selectMood(m: MoodType) {
    setMood(m);
    onMoodSelect?.(m, tags);
  }

  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      <p className="text-sm text-saathi-muted">How are you feeling today?</p>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {MOOD_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => selectMood(option.id)}
            className={cn(
              "flex min-w-[64px] flex-col items-center gap-1 rounded-2xl p-2 transition-colors",
              mood === option.id
                ? "bg-saathi-sage/20 ring-2 ring-saathi-sage/40"
                : "bg-saathi-cream/80 hover:bg-saathi-lavender/20"
            )}
          >
            <span className="text-2xl">{option.emoji}</span>
            <span className="text-xs text-saathi-ink">{option.label}</span>
          </button>
        ))}
      </div>
      {!compact && (
        <div className="flex flex-wrap gap-2">
          {MOOD_TAGS.map((tag) => (
            <button key={tag} type="button" onClick={() => toggleTag(tag)}>
              <Badge
                className={cn(
                  "cursor-pointer transition-colors",
                  tags.includes(tag) && "bg-saathi-sage/25 ring-1 ring-saathi-sage/30"
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
