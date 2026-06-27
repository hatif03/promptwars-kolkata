import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { HomeJournalSection } from "./HomeJournalSection";

describe("HomeJournalSection", () => {
  it("passes selected mood into journal submission payload", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        analysis: {
          reflection: "Thanks for sharing.",
          themes: ["stress"],
          microStep: "Breathe.",
          invitationQuestion: "Want to talk?",
          recommendedExerciseId: "box-breathing",
        },
        isCrisis: false,
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<HomeJournalSection />);

    await user.click(screen.getByRole("button", { name: "Feeling Anxious" }));
    await user.type(
      screen.getByLabelText("How are you really doing today?"),
      "Mock test stress"
    );
    await user.click(screen.getByRole("button", { name: "Save & reflect" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/journal/analyze",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          content: "Mock test stress",
          mood: "anxious",
          tags: [],
        }),
      })
    );

    vi.unstubAllGlobals();
  });
});
