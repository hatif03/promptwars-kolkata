import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CrisisSheet } from "./CrisisSheet";

describe("CrisisSheet", () => {
  it("renders dialog semantics when open", () => {
    render(<CrisisSheet open onClose={vi.fn()} />);

    const dialog = screen.getByRole("dialog", { name: "You deserve support" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByRole("link", { name: /Tele-MANAS/i })).toBeInTheDocument();
  });

  it("closes on Escape and backdrop click", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<CrisisSheet open onClose={onClose} />);

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);

    onClose.mockClear();
    await user.click(screen.getByRole("presentation"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("wraps focus from last element to first", async () => {
    const user = userEvent.setup();
    render(<CrisisSheet open onClose={vi.fn()} />);

    const closeButton = screen.getByRole("button", { name: "Close crisis resources" });
    const emergencyLink = screen.getByRole("link", { name: /Emergency/i });

    emergencyLink.focus();
    await user.tab();
    expect(closeButton).toHaveFocus();
  });
});
