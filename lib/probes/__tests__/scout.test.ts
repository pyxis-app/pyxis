import { describe, it, expect, vi } from "vitest";
import { runScout } from "../scout";

vi.mock("../../llm", () => ({ complete: vi.fn() }));
vi.mock("../../data/dossiers/scout-dossier", () => ({
  buildScoutDossier: vi.fn().mockResolvedValue({
    query: "scout query about solana",
    topicType: "chain",
    markdown: "## Live Information Dossier\n\n### Web news — Tavily [live]\n- **T1** (https://t1.com)",
    webResults: [
      { title: "T1", url: "https://t1.com", content: "context one" },
    ],
    freshness: [
      {
        source: "tavily",
        sampledAt: "2026-05-19T10:00:00Z",
        endpoint: "https://api.tavily.com/search",
        cached: false,
      },
    ],
    failedSources: [],
    endpointSources: ["https://api.tavily.com/search"],
  }),
}));

describe("runScout", () => {
  it("calls dossier builder then LLM, returns findings + sources", async () => {
    const { complete } = await import("../../llm");
    (complete as unknown as { mockResolvedValue: (v: string) => void }).mockResolvedValue(
      "**Finding 1**: Solana shipping FireDancer (Source: https://t1.com) — Confidence: high",
    );

    const out = await runScout({
      query: "scout query about solana",
      topicType: "chain",
      chainHint: "solana",
      hints: {},
    });
    expect(out.probeType).toBe("scout");
    expect(out.findings).toContain("FireDancer");
    expect(out.sources).toContain("https://t1.com");
    expect(out.freshness).toHaveLength(1);
    expect(out.failed).toBe(false);
  });
});
