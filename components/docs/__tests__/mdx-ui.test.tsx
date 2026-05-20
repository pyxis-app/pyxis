import { render, screen } from "@testing-library/react";
import { Callout, AgentCard, HonestGap } from "@/components/docs/mdx-ui";

describe("docs mdx-ui", () => {
  it("AgentCard renders the agent label and body", () => {
    render(<AgentCard agent="scout">news and narrative</AgentCard>);
    expect(screen.getByText("Scout")).toBeInTheDocument();
    expect(screen.getByText("news and narrative")).toBeInTheDocument();
  });

  it("Callout renders its children", () => {
    render(<Callout>be careful</Callout>);
    expect(screen.getByText("be careful")).toBeInTheDocument();
  });

  it("HonestGap renders the default title", () => {
    render(<HonestGap>no fabrication</HonestGap>);
    expect(screen.getByText("What Pyxis does not claim")).toBeInTheDocument();
    expect(screen.getByText("no fabrication")).toBeInTheDocument();
  });
});
