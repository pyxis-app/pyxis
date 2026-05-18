import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { searchTavily } from "../tavily";

describe("searchTavily", () => {
  beforeEach(() => {
    process.env.TAVILY_API_KEY = "test-key";
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("posts query to Tavily and returns parsed results", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          results: [
            { title: "T1", url: "https://t1.com", content: "C1" },
            { title: "T2", url: "https://t2.com", content: "C2" },
          ],
        }),
        { status: 200 },
      ),
    );

    const res = await searchTavily("Solana", 2);
    expect(fetchMock).toHaveBeenCalled();
    const body = JSON.parse(
      (fetchMock.mock.calls[0][1] as RequestInit).body as string,
    );
    expect(body.query).toBe("Solana");
    expect(body.max_results).toBe(2);
    expect(body.api_key).toBe("test-key");
    expect(res).toHaveLength(2);
    expect(res[0].url).toBe("https://t1.com");
  });

  it("throws on non-2xx", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response("err", { status: 500 }),
    );
    await expect(searchTavily("x")).rejects.toThrow(/Tavily/);
  });
});
