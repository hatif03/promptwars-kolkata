"use client";

import { useState } from "react";
import { MoodStrip } from "./MoodStrip";
import { JournalEditor } from "./JournalEditor";
import type { MoodType } from "@/lib/types";

export function HomeJournalSection() {
  const [mood, setMood] = useState<MoodType | null>(null);
  const [tags, setTags] = useState<string[]>([]);

  function handleMoodSelect(selectedMood: MoodType, selectedTags: string[]) {
    setMood(selectedMood);
    setTags(selectedTags);
  }

  function handleSaved() {
    setMood(null);
    setTags([]);
  }

  return (
    <>
      <div className="mb-6">
        <MoodStrip compact selectedMood={mood} onMoodSelect={handleMoodSelect} />
      </div>
      <JournalEditor compact mood={mood} tags={tags} onSaved={handleSaved} />
    </>
  );
}
