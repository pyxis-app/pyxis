import { describe, it, expect, vi } from "vitest";
import { runAnalyst } from "../analyst";

vi.mock("../../llm", () => ({ complete: vi.fn().mockResolvedValue("**Metric**: Price $200") }));
vi.mock("../../tavily", () => ({ searchTavily: vi.fn().mockResolvedValue([]) }));
vi.mock("../../market", () => ({ getMarketContext: vi.fn().mockResolvedValue("## Solana\n- Price: $200") }));

describe("runAnalyst", () => {
  it("injects market context into prompt", async () => {
    const out = await runAnalyst("solana price metrics");
    expect(out.probeType).toBe("analyst");
    expect(out.findings).toContain("$200");
    const { complete } = await import("../../llm");
    const call = (complete as any).mock.calls[0][0];
    expect(call.user).toContain("Solana");
    expect(call.user).toContain("$200");
  });
});
