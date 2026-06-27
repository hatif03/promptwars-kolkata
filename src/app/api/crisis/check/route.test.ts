import { describe, expect, it } from "vitest";
import { checkCrisisContent } from "@/lib/safety/crisis";
import { crisisCheckRequestSchema } from "@/lib/validation/schemas";

describe("crisis check API logic", () => {
  it("validates request schema", () => {
    const parsed = crisisCheckRequestSchema.safeParse({ text: "hello" });
    expect(parsed.success).toBe(true);
  });

  it("detects crisis keywords", () => {
    const result = checkCrisisContent("I want to kill myself");
    expect(result.isCrisis).toBe(true);
    expect(result.severity).toBe("high");
  });

  it("returns safe for normal text", () => {
    const result = checkCrisisContent("Physics mock was hard today");
    expect(result.isCrisis).toBe(false);
  });
});
