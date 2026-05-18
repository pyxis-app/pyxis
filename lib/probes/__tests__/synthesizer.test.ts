import { describe, it, expect, vi } from "vitest";
import { runSynthesizer } from "../synthesizer";
import type { ProbeFinding } from "../types";

vi.mock("../../llm", () => ({
  complete: vi.fn().mockResolvedValue(
`## Executive Summary
ok.

## Confidence Assessment
- Overall confidence: 88/100`
  ),
}));

describe("runSynthesizer", () => {
  it("returns briefing markdown + confidence parsed", async () => {
    const findings: ProbeFinding[] = [
      { probeType: "scout", query: "q", findings: "scout text", sources: ["https://a"], failed: false },
      { probeType: "analyst", query: "q", findings: "analyst text", sources: ["https://b"], failed: false },
      { probeType: "sentinel", query: "q", findings: "sentinel text", sources: ["https://c"], failed: false },
    ];
    const out = await runSynthesizer("Solana", findings);
    expect(out.briefing).toContain("Executive Summary");
    expect(out.confidence).toBe(88);
  });

  it("returns lower confidence when partial", async () => {
    const findings: ProbeFinding[] = [
      { probeType: "scout", query: "q", findings: "scout text", sources: [], failed: false },
      { probeType: "analyst", query: "q", findings: "", sources: [], failed: true },
      { probeType: "sentinel", query: "q", findings: "sentinel text", sources: [], failed: false },
    ];
    const out = await runSynthesizer("Solana", findings);
    expect(out.partial).toBe(true);
  });
});
