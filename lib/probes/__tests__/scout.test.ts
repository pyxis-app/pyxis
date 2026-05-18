import { describe, it, expect, vi } from "vitest";
import { runScout } from "../scout";

vi.mock("../../llm", () => ({ complete: vi.fn() }));
vi.mock("../../tavily", () => ({ searchTavily: vi.fn() }));

describe("runScout", () => {
  it("calls Tavily then LLM with web context, returns findings + sources", async () => {
    const { searchTavily } = await import("../../tavily");
    const { complete } = await import("../../llm");

    (searchTavily as any).mockResolvedValue([
      { title: "T1", url: "https://t1.com", content: "context one" },
      { title: "T2", url: "https://t2.com", content: "context two" },
    ]);
    (complete as any).mockResolvedValue(
      "**Finding 1**: Solana shipping FireDancer (Source: https://t1.com) - Confidence: high"
    );

    const out = await runScout("scout query about solana");
    expect(out.probeType).toBe("scout");
    expect(out.findings).toContain("FireDancer");
    expect(out.sources).toContain("https://t1.com");
    expect(out.failed).toBe(false);
  });
});
