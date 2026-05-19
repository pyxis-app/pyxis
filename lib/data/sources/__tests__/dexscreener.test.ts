import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";

const TMP = path.join("/tmp", `pyxis-dex-test-${process.pid}.db`);
process.env.SQLITE_PATH = TMP;

describe("data/sources/dexscreener", () => {
  beforeEach(async () => {
    const { closeDb } = await import("../../../db");
    const { resetCacheStmts } = await import("../../cache");
    closeDb();
    resetCacheStmts();
    if (fs.existsSync(TMP)) fs.unlinkSync(TMP);
  });

  afterEach(() => vi.restoreAllMocks());

  it("searchPairs sorts by liquidity and normalizes shape", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          pairs: [
            {
              chainId: "ethereum",
              dexId: "uniswap",
              pairAddress: "0xabc",
              baseToken: { symbol: "WETH" },
              quoteToken: { symbol: "USDC" },
              priceUsd: "2400.5",
              liquidity: { usd: 1_000_000 },
              volume: { h24: 5_000_000 },
              priceChange: { h24: 2.1 },
              fdv: 2_400_000_000,
              pairCreatedAt: 1_700_000_000_000,
            },
            {
              chainId: "ethereum",
              dexId: "sushiswap",
              pairAddress: "0xdef",
              baseToken: { symbol: "WETH" },
              quoteToken: { symbol: "DAI" },
              priceUsd: "2398.1",
              liquidity: { usd: 5_000_000 },
              volume: { h24: 8_000_000 },
              priceChange: { h24: 1.8 },
              fdv: 2_400_000_000,
              pairCreatedAt: 1_700_000_000_000,
            },
          ],
        }),
        { status: 200 },
      ),
    );
    const { searchPairs } = await import("../dexscreener");
    const r = await searchPairs("WETH", 5);
    expect(r?.data).toHaveLength(2);
    expect(r?.data[0].liquidityUsd).toBe(5_000_000); // sorted desc
    expect(r?.data[0].dex).toBe("sushiswap");
    expect(r?.data[0].priceUsd).toBe(2398.1);
  });

  it("returns null on upstream error", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response("err", { status: 500 }),
    );
    const { searchPairs } = await import("../dexscreener");
    const r = await searchPairs("x");
    expect(r).toBeNull();
  });
});
