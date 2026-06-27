import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MoodStrip } from "./MoodStrip";

describe("MoodStrip", () => {
  it("announces mood options accessibly", () => {
    render(<MoodStrip />);
    expect(screen.getByRole("button", { name: "Feeling Anxious" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("calls onMoodSelect when a mood is chosen", async () => {
    const user = userEvent.setup();
    const onMoodSelect = vi.fn();
    render(<MoodStrip onMoodSelect={onMoodSelect} />);

    await user.click(screen.getByRole("button", { name: "Feeling Calm" }));

    expect(onMoodSelect).toHaveBeenCalledWith("calm", []);
    expect(screen.getByRole("button", { name: "Feeling Calm" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("reflects controlled selectedMood from parent", () => {
    render(<MoodStrip selectedMood="sad" onMoodSelect={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Feeling Sad" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("exposes tag toggles with aria-pressed in full mode", async () => {
    const user = userEvent.setup();
    render(<MoodStrip onMoodSelect={vi.fn()} />);

    const physicsTag = screen.getByRole("button", { name: "Tag Physics" });
    expect(physicsTag).toHaveAttribute("aria-pressed", "false");

    await user.click(physicsTag);
    expect(physicsTag).toHaveAttribute("aria-pressed", "true");
  });
});
