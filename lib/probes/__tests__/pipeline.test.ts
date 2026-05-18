import { describe, it, expect, vi } from "vitest";

vi.mock("../commander", () => ({ runCommander: vi.fn() }));
vi.mock("../scout", () => ({ runScout: vi.fn() }));
vi.mock("../analyst", () => ({ runAnalyst: vi.fn() }));
vi.mock("../sentinel", () => ({ runSentinel: vi.fn() }));
vi.mock("../synthesizer", () => ({ runSynthesizer: vi.fn() }));

import { runPipeline } from "../pipeline";

describe("runPipeline", () => {
  it("happy path: all probes succeed, returns briefing with sources count", async () => {
    const { runCommander } = await import("../commander");
    const { runScout } = await import("../scout");
    const { runAnalyst } = await import("../analyst");
    const { runSentinel } = await import("../sentinel");
    const { runSynthesizer } = await import("../synthesizer");

    (runCommander as any).mockResolvedValue({ scout: "qs", analyst: "qa", sentinel: "qse" });
    (runScout as any).mockResolvedValue({ probeType: "scout", query: "qs", findings: "f", sources: ["https://a", "https://b"], failed: false });
    (runAnalyst as any).mockResolvedValue({ probeType: "analyst", query: "qa", findings: "f", sources: ["https://c"], failed: false });
    (runSentinel as any).mockResolvedValue({ probeType: "sentinel", query: "qse", findings: "f", sources: ["https://d"], failed: false });
    (runSynthesizer as any).mockResolvedValue({ briefing: "## ok", confidence: 90, partial: false });

    const out = await runPipeline("Solana");
    expect(out.topic).toBe("Solana");
    expect(out.briefing).toContain("ok");
    expect(out.confidence).toBe(90);
    expect(out.partial).toBe(false);
    expect(out.sources).toBe(4);
    expect(out.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("partial: one probe fails → synthesizer still runs, partial=true", async () => {
    const { runCommander } = await import("../commander");
    const { runScout } = await import("../scout");
    const { runAnalyst } = await import("../analyst");
    const { runSentinel } = await import("../sentinel");
    const { runSynthesizer } = await import("../synthesizer");

    (runCommander as any).mockResolvedValue({ scout: "qs", analyst: "qa", sentinel: "qse" });
    (runScout as any).mockResolvedValue({ probeType: "scout", query: "qs", findings: "f", sources: [], failed: false });
    (runAnalyst as any).mockResolvedValue({ probeType: "analyst", query: "qa", findings: "", sources: [], failed: true });
    (runSentinel as any).mockResolvedValue({ probeType: "sentinel", query: "qse", findings: "f", sources: [], failed: false });
    (runSynthesizer as any).mockResolvedValue({ briefing: "## partial", confidence: 70, partial: true });

    const out = await runPipeline("Solana");
    expect(out.partial).toBe(true);
  });

  it("commander fails → returns fallback briefing without throwing", async () => {
    const { runCommander } = await import("../commander");
    (runCommander as any).mockRejectedValue(new Error("commander down"));

    const out = await runPipeline("Solana");
    expect(out.partial).toBe(true);
    expect(out.briefing).toContain("unavailable");
    expect(out.confidence).toBe(0);
  });
});
