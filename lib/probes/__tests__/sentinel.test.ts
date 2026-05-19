import { describe, it, expect, vi } from "vitest";
import { runSentinel } from "../sentinel";

vi.mock("../../llm", () => ({
  complete: vi
    .fn()
    .mockResolvedValue("**Overall Sentiment**: positive — engagement steady"),
}));
vi.mock("../../data/dossiers/sentinel-dossier", () => ({
  buildSentinelDossier: vi.fn().mockResolvedValue({
    query: "solana community sentiment",
    topicType: "chain",
    markdown:
      "## Live Sentiment Dossier\n\n### Macro F&G [live]\n- 42 (Fear)",
    webResults: [{ title: "S", url: "https://s.com", content: "good vibes" }],
    freshness: [
      {
        source: "alternativeme",
        sampledAt: "2026-05-19T10:00:00Z",
        endpoint: "https://api.alternative.me/fng",
        cached: false,
      },
    ],
    failedSources: [],
    endpointSources: ["https://api.alternative.me/fng"],
    getxapiCallsUsed: 0,
  }),
}));

describe("runSentinel", () => {
  it("calls dossier builder then LLM and returns sentiment finding", async () => {
    const out = await runSentinel({
      query: "solana community sentiment",
      topicType: "chain",
      hints: {},
    });
    expect(out.probeType).toBe("sentinel");
    expect(out.findings).toContain("positive");
    expect(out.freshness).toHaveLength(1);
    expect(out.sources).toContain("https://s.com");
  });
});
