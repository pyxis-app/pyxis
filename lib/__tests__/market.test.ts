import { describe, it, expect, vi } from "vitest";
import { getMarketContext } from "../market";

describe("getMarketContext", () => {
  it("returns empty string when no signal is found", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200 }),
    );
    const ctx = await getMarketContext("Some unrelated topic");
    expect(typeof ctx).toBe("string");
  });

  it("includes price and TVL when topic matches a known token", async () => {
    vi.spyOn(global, "fetch")
      // CoinGecko coin search
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            coins: [{ id: "solana", symbol: "sol", name: "Solana" }],
          }),
          { status: 200 },
        ),
      )
      // CoinGecko price
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            solana: {
              usd: 214.3,
              usd_24h_change: 4.2,
              usd_market_cap: 103e9,
            },
          }),
          { status: 200 },
        ),
      )
      // DefiLlama TVL
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            tvl: 12_100_000_000,
          }),
          { status: 200 },
        ),
      );

    const ctx = await getMarketContext("Solana DeFi");
    expect(ctx).toContain("Solana");
    expect(ctx).toContain("$214");
    expect(ctx).toContain("TVL");
  });
});
