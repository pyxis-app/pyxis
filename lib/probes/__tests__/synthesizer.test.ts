import { describe, it, expect, vi } from "vitest";
import { runSynthesizer } from "../synthesizer";
import type { ProbeFinding } from "../types";
import type { FreshnessMeta } from "../../data/freshness";

vi.mock("../../llm", () => ({
  complete: vi.fn().mockResolvedValue(
    `## Executive Summary
ok.

## Confidence Assessment
- Overall confidence: 88/100`,
  ),
}));

const findings: ProbeFinding[] = [
  {
    probeType: "scout",
    query: "q",
    findings: "scout text",
    sources: ["https://a"],
    freshness: [],
    failed: false,
  },
  {
    probeType: "analyst",
    query: "q",
    findings: "analyst text",
    sources: ["https://b"],
    freshness: [],
    failed: false,
  },
  {
    probeType: "sentinel",
    query: "q",
    findings: "sentinel text",
    sources: ["https://c"],
    freshness: [],
    failed: false,
  },
];

describe("runSynthesizer", () => {
  it("returns briefing markdown + parsed confidence", async () => {
    const out = await runSynthesizer({
      topic: "Solana",
      topicType: "chain",
      findings,
      freshness: [],
    });
    expect(out.briefing).toContain("Executive Summary");
    expect(out.confidence).toBe(88);
    expect(out.partial).toBe(false);
  });

  it("flags partial when a probe failed", async () => {
    const failed: ProbeFinding[] = [
      findings[0],
      { ...findings[1], findings: "", failed: true },
      findings[2],
    ];
    const out = await runSynthesizer({
      topic: "Solana",
      topicType: "chain",
      findings: failed,
      freshness: [],
    });
    expect(out.partial).toBe(true);
  });

  it("appends Data Freshness table when freshness array non-empty", async () => {
    const fresh: FreshnessMeta[] = [
      {
        source: "coingecko",
        sampledAt: "2026-05-19T10:00:00Z",
        endpoint: "https://api.coingecko.com/api/v3/coins/solana",
        cached: false,
      },
    ];
    const out = await runSynthesizer({
      topic: "Solana",
      topicType: "chain",
      findings,
      freshness: fresh,
    });
    expect(out.briefing).toContain("## Data Freshness");
    expect(out.briefing).toContain("coingecko");
    expect(out.briefing).toContain("live");
  });
});
