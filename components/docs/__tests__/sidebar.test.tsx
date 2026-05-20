import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DocsSidebar } from "@/components/docs/sidebar";

vi.mock("next/navigation", () => ({ usePathname: () => "/docs/agents" }));

describe("DocsSidebar", () => {
  it("renders all nine links and marks the current page active", () => {
    render(<DocsSidebar open={false} onNavigate={() => {}} />);
    const link = screen.getByRole("link", { name: "The five agents" });
    expect(link).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Introduction" })).not.toHaveAttribute("aria-current");
  });
});
