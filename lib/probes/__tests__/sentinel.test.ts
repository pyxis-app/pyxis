import { describe, it, expect, vi } from "vitest";
import { runSentinel } from "../sentinel";

vi.mock("../../llm", () => ({ complete: vi.fn().mockResolvedValue("**Overall Sentiment**: positive") }));
vi.mock("../../tavily", () => ({ searchTavily: vi.fn().mockResolvedValue([{ title: "S", url: "https://s.com", content: "good vibes" }]) }));

describe("runSentinel", () => {
  it("returns sentiment finding", async () => {
    const out = await runSentinel("solana community sentiment");
    expect(out.probeType).toBe("sentinel");
    expect(out.findings).toContain("positive");
  });
});
