import { describe, it, expect, vi } from "vitest";
import { runCommander } from "../commander";

vi.mock("../../llm", () => ({
  complete: vi.fn().mockResolvedValue(
`SCOUT: What is the latest news on Solana liquid staking?
ANALYST: What are Solana's current price, market cap, and TVL?
SENTINEL: What does the developer community think of Solana?`
  ),
}));

describe("runCommander", () => {
  it("parses SCOUT/ANALYST/SENTINEL queries", async () => {
    const out = await runCommander("Solana state");
    expect(out.scout).toContain("liquid staking");
    expect(out.analyst).toContain("price");
    expect(out.sentinel).toContain("community");
  });

  it("falls back to template queries on parse failure", async () => {
    const { complete } = await import("../../llm");
    (complete as any).mockResolvedValueOnce("garbage output without keys");
    const out = await runCommander("Topic X");
    expect(out.scout).toContain("Topic X");
    expect(out.analyst).toContain("Topic X");
    expect(out.sentinel).toContain("Topic X");
  });
});
