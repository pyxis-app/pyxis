import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";

const TMP = path.join("/tmp", `pyxis-binance-test-${process.pid}.db`);
process.env.SQLITE_PATH = TMP;

describe("data/sources/binance", () => {
  beforeEach(async () => {
    const { closeDb } = await import("../../../db");
    const { resetCacheStmts } = await import("../../cache");
    closeDb();
    resetCacheStmts();
    if (fs.existsSync(TMP)) fs.unlinkSync(TMP);
  });

  afterEach(() => vi.restoreAllMocks());

  it("getSpotTicker parses string fields to numbers", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          symbol: "SOLUSDT",
          lastPrice: "84.20",
          priceChangePercent: "-1.50",
          highPrice: "86.00",
          lowPrice: "83.00",
          volume: "1500000.5",
          quoteVolume: "126000000.0",
        }),
        { status: 200 },
      ),
    );
    const { getSpotTicker } = await import("../binance");
    const r = await getSpotTicker("solusdt");
    expect(r?.data?.symbol).toBe("SOLUSDT");
    expect(r?.data?.lastPrice).toBe(84.2);
    expect(r?.data?.priceChangePercent).toBe(-1.5);
    expect(r?.data?.volumeQuoteUsd).toBe(126_000_000);
  });

  it("returns data:null when symbol missing in response", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200 }),
    );
    const { getSpotTicker } = await import("../binance");
    const r = await getSpotTicker("BTCUSDT");
    expect(r?.data).toBeNull();
  });
});
