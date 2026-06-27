import { describe, expect, it } from "vitest";
import {
  crisisCheckRequestSchema,
  formatZodError,
  journalAnalyzeRequestSchema,
} from "./schemas";

describe("journalAnalyzeRequestSchema", () => {
  it("accepts valid journal payload", () => {
    const result = journalAnalyzeRequestSchema.safeParse({
      content: "Feeling anxious about physics.",
      mood: "anxious",
      tags: ["Physics", "Mock test"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty content", () => {
    const result = journalAnalyzeRequestSchema.safeParse({ content: "   " });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result.error)).toBe("Content required");
    }
  });

  it("rejects invalid mood values", () => {
    const result = journalAnalyzeRequestSchema.safeParse({
      content: "Hello",
      mood: "excited",
    });
    expect(result.success).toBe(false);
  });

  it("rejects too many tags", () => {
    const result = journalAnalyzeRequestSchema.safeParse({
      content: "Hello",
      tags: Array.from({ length: 11 }, (_, i) => `tag-${i}`),
    });
    expect(result.success).toBe(false);
  });
});

describe("crisisCheckRequestSchema", () => {
  it("accepts non-empty text", () => {
    const result = crisisCheckRequestSchema.safeParse({ text: "need help" });
    expect(result.success).toBe(true);
  });

  it("rejects blank text", () => {
    const result = crisisCheckRequestSchema.safeParse({ text: "  " });
    expect(result.success).toBe(false);
  });
});
