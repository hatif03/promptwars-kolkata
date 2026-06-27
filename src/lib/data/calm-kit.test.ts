import { describe, expect, it } from "vitest";
import {
  CALM_KIT_EXERCISES,
  getExerciseById,
  recommendExercise,
} from "./calm-kit";

describe("getExerciseById", () => {
  it("returns exercise when id exists", () => {
    expect(getExerciseById("box-breathing")?.title).toBe("Box Breathing");
  });

  it("returns undefined for unknown id", () => {
    expect(getExerciseById("missing-id")).toBeUndefined();
  });
});

describe("recommendExercise", () => {
  it("returns default exercise when no themes match", () => {
    expect(recommendExercise([])).toEqual(CALM_KIT_EXERCISES[0]);
  });

  it("prefers exercises matching journal themes", () => {
    const exercise = recommendExercise(["rank", "comparison"]);
    expect(exercise.id).toBe("self-compassion-rank");
  });

  it("considers mood tags in scoring", () => {
    const exercise = recommendExercise([], ["family", "sunday"]);
    expect(exercise.id).toBe("parent-boundary");
  });

  it("handles mixed theme and tag input", () => {
    const exercise = recommendExercise(["burnout"], ["long study"]);
    expect(["study-break-reset", "grounding-54321"]).toContain(exercise.id);
  });
});
