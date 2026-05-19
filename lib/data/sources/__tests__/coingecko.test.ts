import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";

const TMP = path.join("/tmp", `pyxis-cg-test-${process.pid}.db`);
process.env.SQLITE_PATH = TMP;

describe("data/sources/coingecko", () => {
  beforeEach(async () => {
    const { closeDb } = await import("../../../db");
    const { resetCacheStmts } = await import("../../cache");
    closeDb();
    resetCacheStmts();
    if (fs.existsSync(TMP)) fs.unlinkSync(TMP);
  });

  afterEach(() => vi.restoreAllMocks());

  it("searchCoin returns first hit", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          coins: [
            { id: "solana", symbol: "sol", name: "Solana" },
            { id: "solana-meta", symbol: "smeta", name: "Solana Meta" },
          ],
        }),
        { status: 200 },
      ),
    );
    const { searchCoin } = await import("../coingecko");
    const r = await searchCoin("Solana");
    expect(r?.data).toEqual({ id: "solana", symbol: "sol", name: "Solana" });
    expect(r?.meta.source).toBe("coingecko");
  });

  it("searchCoin returns data:null when no coins match", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ coins: [] }), { status: 200 }),
    );
    const { searchCoin } = await import("../coingecko");
    const r = await searchCoin("not-a-real-coin");
    expect(r?.data).toBeNull();
  });

  it("getCoinSnapshot extracts fields", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "solana",
          symbol: "sol",
          name: "Solana",
          categories: ["Layer 1 (L1)"],
          market_data: {
            current_price: { usd: 84.2 },
            market_cap: { usd: 48_700_000_000 },
            total_volume: { usd: 2_300_000_000 },
            price_change_percentage_24h: -1.4,
            price_change_percentage_7d: -5.2,
            price_change_percentage_30d: -12.8,
            ath: { usd: 259.96 },
            ath_date: { usd: "2021-11-06T00:00:00Z" },
            atl: { usd: 0.5 },
            atl_date: { usd: "2020-05-11T00:00:00Z" },
            circulating_supply: 480_000_000,
            total_supply: 600_000_000,
            max_supply: null,
          },
        }),
        { status: 200 },
      ),
    );
    const { getCoinSnapshot } = await import("../coingecko");
    const r = await getCoinSnapshot("solana");
    expect(r?.data.priceUsd).toBe(84.2);
    expect(r?.data.marketCapUsd).toBe(48_700_000_000);
    expect(r?.data.change30d).toBe(-12.8);
    expect(r?.data.athUsd).toBe(259.96);
    expect(r?.data.categories).toEqual(["Layer 1 (L1)"]);
    expect(r?.data.maxSupply).toBeNull();
  });

  it("returns null on upstream error", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response("err", { status: 500 }),
    );
    const { getCoinSnapshot } = await import("../coingecko");
    const r = await getCoinSnapshot("solana");
    expect(r).toBeNull();
  });
});
