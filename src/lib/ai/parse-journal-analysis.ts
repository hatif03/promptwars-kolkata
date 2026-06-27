import type { JournalAnalysis } from "@/lib/types";

export const JOURNAL_ANALYSIS_FALLBACK: JournalAnalysis = {
  reflection:
    "Thank you for sharing this. What you're feeling matters, and I'm glad you wrote it down.",
  themes: ["stress"],
  microStep: "Take 3 slow breaths before your next study block.",
  invitationQuestion: "Does this feel true to you?",
  recommendedExerciseId: "box-breathing",
};

export function parseJournalAnalysis(raw: string): JournalAnalysis {
  try {
    return JSON.parse(raw) as JournalAnalysis;
  } catch {
    return JOURNAL_ANALYSIS_FALLBACK;
  }
}
