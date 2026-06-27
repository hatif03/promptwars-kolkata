import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { JournalEditor } from "./JournalEditor";

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
    },
    from: vi.fn(),
  }),
}));

describe("JournalEditor accessibility", () => {
  it("has no axe violations", async () => {
    const { container } = render(<JournalEditor compact />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("associates label with journal textarea", () => {
    render(<JournalEditor compact />);
    expect(screen.getByLabelText(/How are you really doing today/i)).toBeInTheDocument();
  });
});
