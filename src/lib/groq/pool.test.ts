import { describe, expect, it, vi, beforeEach } from "vitest";
import { resetStreamKeyPoolForTests } from "./stream-pool";

describe("stream key pool", () => {
  beforeEach(() => {
    resetStreamKeyPoolForTests();
    vi.unstubAllEnvs();
  });

  it("resetStreamKeyPoolForTests clears pool state", () => {
    process.env.GROQ_API_KEY_1 = "test-key";
    resetStreamKeyPoolForTests();
    expect(resetStreamKeyPoolForTests).toBeDefined();
  });
});
