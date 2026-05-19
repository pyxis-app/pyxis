import { describe, it, expect, vi } from "vitest";

vi.mock("../commander", () => ({ runCommander: vi.fn() }));
vi.mock("../scout", () => ({ runScout: vi.fn() }));
vi.mock("../analyst", () => ({ runAnalyst: vi.fn() }));
vi.mock("../sentinel", () => ({ runSentinel: vi.fn() }));
vi.mock("../synthesizer", () => ({ runSynthesizer: vi.fn() }));
vi.mock("../../data/cache", () => ({ cachePurgeExpired: vi.fn().mockReturnValue(0) }));

import { runPipeline } from "../pipeline";

const baseCmd = {
  scout: "qs",
  analyst: "qa",
  sentinel: "qse",
  topicType: "chain" as const,
  chainHint: "solana",
  temporalMode: "realtime" as const,
  hints: { symbol: "SOL" },
};

describe("runPipeline", () => {
  it("happy path: probes succeed, freshness aggregated, sources counted", async () => {
    const { runCommander } = await import("../commander");
    const { runScout } = await import("../scout");
    const { runAnalyst } = await import("../analyst");
    const { runSentinel } = await import("../sentinel");
    const { runSynthesizer } = await import("../synthesizer");

    (runCommander as unknown as { mockResolvedValue: (v: unknown) => void }).mockResolvedValue(baseCmd);
    (runScout as unknown as { mockResolvedValue: (v: unknown) => void }).mockResolvedValue({
      probeType: "scout",
      query: "qs",
      findings: "f",
      sources: ["https://a", "https://b"],
      freshness: [],
      failed: false,
    });
    (runAnalyst as unknown as { mockResolvedValue: (v: unknown) => void }).mockResolvedValue({
      probeType: "analyst",
      query: "qa",
      findings: "f",
      sources: ["https://c"],
      freshness: [
        {
          source: "coingecko",
          sampledAt: "2026-05-19T10:00:00Z",
          endpoint: "https://api.coingecko.com",
          cached: false,
        },
      ],
      failed: false,
    });
    (runSentinel as unknown as { mockResolvedValue: (v: unknown) => void }).mockResolvedValue({
      probeType: "sentinel",
      query: "qse",
      findings: "f",
      sources: ["https://d"],
      freshness: [],
      failed: false,
    });
    (runSynthesizer as unknown as { mockResolvedValue: (v: unknown) => void }).mockResolvedValue({
      briefing: "## ok",
      confidence: 90,
      partial: false,
    });

    const out = await runPipeline("Solana");
    expect(out.topic).toBe("Solana");
    expect(out.briefing).toContain("ok");
    expect(out.confidence).toBe(90);
    expect(out.partial).toBe(false);
    expect(out.sources).toBe(4);
    expect(out.topicType).toBe("chain");
    expect(out.freshness).toHaveLength(1);
    expect(out.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("partial: one probe fails → synthesizer still runs, partial=true", async () => {
    const { runCommander } = await import("../commander");
    const { runScout } = await import("../scout");
    const { runAnalyst } = await import("../analyst");
    const { runSentinel } = await import("../sentinel");
    const { runSynthesizer } = await import("../synthesizer");

    (runCommander as unknown as { mockResolvedValue: (v: unknown) => void }).mockResolvedValue(baseCmd);
    (runScout as unknown as { mockResolvedValue: (v: unknown) => void }).mockResolvedValue({
      probeType: "scout",
      query: "qs",
      findings: "f",
      sources: [],
      freshness: [],
      failed: false,
    });
    (runAnalyst as unknown as { mockResolvedValue: (v: unknown) => void }).mockResolvedValue({
      probeType: "analyst",
      query: "qa",
      findings: "",
      sources: [],
      freshness: [],
      failed: true,
    });
    (runSentinel as unknown as { mockResolvedValue: (v: unknown) => void }).mockResolvedValue({
      probeType: "sentinel",
      query: "qse",
      findings: "f",
      sources: [],
      freshness: [],
      failed: false,
    });
    (runSynthesizer as unknown as { mockResolvedValue: (v: unknown) => void }).mockResolvedValue({
      briefing: "## partial",
      confidence: 70,
      partial: true,
    });

    const out = await runPipeline("Solana");
    expect(out.partial).toBe(true);
  });

  it("commander fails → returns fallback briefing without throwing", async () => {
    const { runCommander } = await import("../commander");
    (runCommander as unknown as { mockRejectedValue: (v: unknown) => void })
      .mockRejectedValue(new Error("commander down"));

    const out = await runPipeline("Solana");
    expect(out.partial).toBe(true);
    expect(out.briefing).toContain("unavailable");
    expect(out.confidence).toBe(0);
    expect(out.topicType).toBe("narrative");
    expect(out.freshness).toEqual([]);
  });
});
