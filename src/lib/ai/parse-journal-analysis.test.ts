import { describe, expect, it } from "vitest";
import {
  JOURNAL_ANALYSIS_FALLBACK,
  parseJournalAnalysis,
} from "./parse-journal-analysis";

describe("parseJournalAnalysis", () => {
  it("parses valid JSON from the model", () => {
    const raw = JSON.stringify({
      reflection: "That sounds heavy.",
      themes: ["family"],
      microStep: "Drink water.",
      invitationQuestion: "Want to talk more?",
      recommendedExerciseId: "parent-boundary",
    });

    const result = parseJournalAnalysis(raw);
    expect(result.reflection).toBe("That sounds heavy.");
    expect(result.themes).toEqual(["family"]);
    expect(result.recommendedExerciseId).toBe("parent-boundary");
  });

  it("returns fallback when JSON is invalid", () => {
    expect(parseJournalAnalysis("not json")).toEqual(JOURNAL_ANALYSIS_FALLBACK);
  });

  it("returns fallback for empty string", () => {
    expect(parseJournalAnalysis("")).toEqual(JOURNAL_ANALYSIS_FALLBACK);
  });
});
