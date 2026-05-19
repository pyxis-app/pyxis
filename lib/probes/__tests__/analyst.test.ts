import { describe, it, expect, vi } from "vitest";
import { runAnalyst } from "../analyst";

vi.mock("../../llm", () => ({
  complete: vi.fn().mockResolvedValue("**Headline metrics**: Price $84.20"),
}));
vi.mock("../../data/dossiers/analyst-dossier", () => ({
  buildAnalystDossier: vi.fn().mockResolvedValue({
    query: "Solana metrics",
    topicType: "chain",
    chainHint: "solana",
    markdown:
      "## Live Market Dossier\n\n### Solana (SOL) — CoinGecko snapshot [live]\n- Price: $84.20 USD",
    freshness: [
      {
        source: "coingecko",
        sampledAt: "2026-05-19T10:00:00Z",
        endpoint: "https://api.coingecko.com/api/v3/coins/solana",
        cached: false,
      },
    ],
    failedSources: [],
    endpointSources: ["https://api.coingecko.com/api/v3/coins/solana"],
  }),
  collectMeta: vi.fn(() => []),
}));

describe("runAnalyst", () => {
  it("passes dossier markdown into prompt and returns shaped finding", async () => {
    const out = await runAnalyst({
      query: "Solana metrics",
      topicType: "chain",
      chainHint: "solana",
      hints: {},
    });
    expect(out.probeType).toBe("analyst");
    expect(out.failed).toBe(false);
    expect(out.findings).toContain("$84.20");
    expect(out.freshness).toHaveLength(1);
    expect(out.freshness[0].source).toBe("coingecko");
    expect(out.sources).toContain("https://api.coingecko.com/api/v3/coins/solana");

    const { complete } = await import("../../llm");
    const call = (complete as unknown as { mock: { calls: Array<Array<{ user: string }>> } })
      .mock.calls[0][0];
    expect(call.user).toContain("Live Market Dossier");
    expect(call.user).toContain("$84.20");
  });
});
