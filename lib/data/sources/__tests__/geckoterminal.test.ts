import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";

const TMP = path.join("/tmp", `pyxis-gt-test-${process.pid}.db`);
process.env.SQLITE_PATH = TMP;

describe("data/sources/geckoterminal", () => {
  beforeEach(async () => {
    const { closeDb } = await import("../../../db");
    const { resetCacheStmts } = await import("../../cache");
    closeDb();
    resetCacheStmts();
    if (fs.existsSync(TMP)) fs.unlinkSync(TMP);
  });

  afterEach(() => vi.restoreAllMocks());

  it("getTrendingPools parses pool attributes", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            {
              id: "eth_0xabc",
              type: "pool",
              attributes: {
                name: "WETH / USDC",
                address: "0xabc",
                base_token_price_usd: "2400.50",
                volume_usd: { h24: "12000000" },
                reserve_in_usd: "5000000",
                price_change_percentage: { h24: "1.5" },
              },
              relationships: {
                dex: { data: { id: "uniswap_v3" } },
                network: { data: { id: "eth" } },
              },
            },
          ],
        }),
        { status: 200 },
      ),
    );
    const { getTrendingPools } = await import("../geckoterminal");
    const r = await getTrendingPools("eth", 5);
    expect(r?.data).toHaveLength(1);
    expect(r?.data[0].priceUsd).toBe(2400.5);
    expect(r?.data[0].dex).toBe("uniswap_v3");
    expect(r?.data[0].volume24hUsd).toBe(12_000_000);
  });
});
