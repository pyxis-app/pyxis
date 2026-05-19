import { describe, it, expect, vi } from "vitest";
import { runCommander } from "../commander";

vi.mock("../../llm", () => ({
  complete: vi.fn().mockResolvedValue(
    JSON.stringify({
      scout: "What is the latest news on Solana liquid staking?",
      analyst: "What are Solana's current price, market cap, and TVL?",
      sentinel: "What does the developer community think of Solana?",
      topicType: "chain",
      chainHint: "solana",
      temporalMode: "realtime",
      lookbackDays: null,
      hints: {
        symbol: "SOL",
        binanceSymbol: "SOLUSDT",
        geckoNetwork: "solana",
        defillamaSlug: null,
        contractAddress: null,
        twitterHandle: "solana",
        subreddit: "solana",
        snapshotSpace: null,
      },
    }),
  ),
}));

describe("runCommander", () => {
  it("parses JSON output with rich hints", async () => {
    const out = await runCommander("Solana state");
    expect(out.scout).toContain("liquid staking");
    expect(out.analyst).toContain("price");
    expect(out.sentinel).toContain("community");
    expect(out.topicType).toBe("chain");
    expect(out.chainHint).toBe("solana");
    expect(out.temporalMode).toBe("realtime");
    expect(out.hints.symbol).toBe("SOL");
    expect(out.hints.binanceSymbol).toBe("SOLUSDT");
    expect(out.hints.twitterHandle).toBe("solana");
    // null hints should be omitted
    expect(out.hints.contractAddress).toBeUndefined();
  });

  it("falls back to template queries on garbage output", async () => {
    const { complete } = await import("../../llm");
    (complete as unknown as { mockResolvedValueOnce: (v: string) => void })
      .mockResolvedValueOnce("garbage output without JSON");
    const out = await runCommander("Topic X");
    expect(out.scout).toContain("Topic X");
    expect(out.analyst).toContain("Topic X");
    expect(out.sentinel).toContain("Topic X");
    expect(out.topicType).toBe("token");
    expect(out.temporalMode).toBe("realtime");
  });

  it("strips code fences if model wraps response", async () => {
    const { complete } = await import("../../llm");
    (complete as unknown as { mockResolvedValueOnce: (v: string) => void })
      .mockResolvedValueOnce(
        "```json\n" +
          JSON.stringify({
            scout: "s",
            analyst: "a",
            sentinel: "se",
            topicType: "token",
            temporalMode: "realtime",
            hints: { symbol: "BTC" },
          }) +
          "\n```",
      );
    const out = await runCommander("BTC");
    expect(out.scout).toBe("s");
    expect(out.hints.symbol).toBe("BTC");
  });
});
