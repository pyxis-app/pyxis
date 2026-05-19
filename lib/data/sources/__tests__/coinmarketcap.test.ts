import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";

const TMP = path.join("/tmp", `pyxis-cmc-test-${process.pid}.db`);
process.env.SQLITE_PATH = TMP;

describe("data/sources/coinmarketcap", () => {
  beforeEach(async () => {
    const { closeDb } = await import("../../../db");
    const { resetCacheStmts } = await import("../../cache");
    closeDb();
    resetCacheStmts();
    if (fs.existsSync(TMP)) fs.unlinkSync(TMP);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.CMC_API_KEY;
  });

  it("returns null when CMC_API_KEY not set", async () => {
    const fetchMock = vi.spyOn(global, "fetch");
    const { getCmcQuote } = await import("../coinmarketcap");
    const r = await getCmcQuote("BTC");
    expect(r).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("parses quote when key present (entry as array)", async () => {
    process.env.CMC_API_KEY = "test-key";
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          status: { error_code: 0 },
          data: {
            BTC: [
              {
                symbol: "BTC",
                name: "Bitcoin",
                cmc_rank: 1,
                circulating_supply: 19_700_000,
                total_supply: 19_700_000,
                max_supply: 21_000_000,
                quote: {
                  USD: {
                    price: 68_000,
                    market_cap: 1.34e12,
                    volume_24h: 30e9,
                    percent_change_24h: 1.2,
                    percent_change_7d: -2.4,
                    percent_change_30d: 5.0,
                  },
                },
              },
            ],
          },
        }),
        { status: 200 },
      ),
    );
    const { getCmcQuote } = await import("../coinmarketcap");
    const r = await getCmcQuote("btc");
    expect(r?.data?.symbol).toBe("BTC");
    expect(r?.data?.priceUsd).toBe(68_000);
    expect(r?.data?.cmcRank).toBe(1);
    // Verify the key header was sent
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const h = init.headers as Record<string, string>;
    expect(h["X-CMC_PRO_API_KEY"]).toBe("test-key");
  });
});
