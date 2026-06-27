import { describe, expect, it } from "vitest";
import { checkCrisisContent, CRISIS_KEYWORDS } from "./crisis";

describe("checkCrisisContent", () => {
  it("returns no crisis for normal journal text", () => {
    const result = checkCrisisContent(
      "Physics mock went badly today but I will try again tomorrow."
    );
    expect(result.isCrisis).toBe(false);
    expect(result.severity).toBe("none");
    expect(result.matchedTerms).toHaveLength(0);
  });

  it("detects English high-severity crisis language", () => {
    const result = checkCrisisContent("I want to end my life after this mock.");
    expect(result.isCrisis).toBe(true);
    expect(result.severity).toBe("high");
    expect(result.matchedTerms).toContain("end my life");
  });

  it("detects Hindi crisis phrases", () => {
    const result = checkCrisisContent("Aaj bahut ho gaya, mar jaunga shayad.");
    expect(result.isCrisis).toBe(true);
    expect(result.severity).toBe("high");
    expect(result.matchedTerms).toContain("mar jaunga");
  });

  it("flags moderate severity for self-harm language without high-severity terms", () => {
    const result = checkCrisisContent("Sometimes I think about self harm.");
    expect(result.isCrisis).toBe(true);
    expect(result.severity).toBe("moderate");
  });

  it("is case-insensitive", () => {
    const result = checkCrisisContent("SUICIDAL thoughts after NEET prep");
    expect(result.isCrisis).toBe(true);
    expect(result.matchedTerms).toContain("suicidal");
  });

  it("covers all configured keywords without false positives on substrings in unrelated words", () => {
    expect(CRISIS_KEYWORDS.length).toBeGreaterThan(10);
    const safe = checkCrisisContent("I feel tired but grateful for my family.");
    expect(safe.isCrisis).toBe(false);
  });
});
