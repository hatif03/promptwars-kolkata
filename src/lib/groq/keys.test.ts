import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { loadApiKeys, hasGroqKeys } from "./keys";

describe("groq keys", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.GROQ_API_KEY;
    delete process.env.GROQ_API_KEYS;
    for (let i = 1; i <= 10; i++) {
      delete process.env[`GROQ_API_KEY_${i}`];
    }
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("loads comma-separated GROQ_API_KEYS", () => {
    process.env.GROQ_API_KEYS = "key-a, key-b";
    expect(loadApiKeys()).toEqual(["key-a", "key-b"]);
  });

  it("loads numbered keys in order", () => {
    process.env.GROQ_API_KEY_1 = "first";
    process.env.GROQ_API_KEY_2 = "second";
    expect(loadApiKeys()).toEqual(["first", "second"]);
  });

  it("deduplicates keys", () => {
    process.env.GROQ_API_KEY = "same";
    process.env.GROQ_API_KEY_1 = "same";
    expect(loadApiKeys()).toEqual(["same"]);
  });

  it("reports hasGroqKeys correctly", () => {
    expect(hasGroqKeys()).toBe(false);
    process.env.GROQ_API_KEY_1 = "x";
    expect(hasGroqKeys()).toBe(true);
  });
});
