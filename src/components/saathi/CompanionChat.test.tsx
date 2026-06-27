import { render, screen, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { CompanionChat } from "./CompanionChat";

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
    },
    from: vi.fn(),
  }),
}));

describe("CompanionChat accessibility", () => {
  it("has no axe violations when loaded", async () => {
    const { container } = render(<CompanionChat />);
    await waitFor(() => {
      expect(screen.getByLabelText("Message to Saathi")).toBeInTheDocument();
    });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("labels the message input", async () => {
    render(<CompanionChat />);
    await waitFor(() => {
      expect(document.getElementById("companion-chat-input")).toBeInTheDocument();
    });
    expect(screen.getByLabelText("Message to Saathi")).toBeInTheDocument();
  });
});
