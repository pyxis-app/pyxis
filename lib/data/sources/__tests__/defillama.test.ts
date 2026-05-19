import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";

const TMP = path.join("/tmp", `pyxis-dl-test-${process.pid}.db`);
process.env.SQLITE_PATH = TMP;

describe("data/sources/defillama", () => {
  beforeEach(async () => {
    const { closeDb } = await import("../../../db");
    const { resetCacheStmts } = await import("../../cache");
    closeDb();
    resetCacheStmts();
    if (fs.existsSync(TMP)) fs.unlinkSync(TMP);
  });

  afterEach(() => vi.restoreAllMocks());

  it("getProtocol parses tvl as number", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          name: "Aave",
          slug: "aave",
          category: "Lending",
          tvl: 12_345_678_900,
          change_1d: 0.5,
          change_7d: -1.2,
          chains: ["Ethereum", "Polygon"],
        }),
        { status: 200 },
      ),
    );
    const { getProtocol } = await import("../defillama");
    const r = await getProtocol("aave");
    expect(r?.data?.name).toBe("Aave");
    expect(r?.data?.tvlUsd).toBe(12_345_678_900);
    expect(r?.data?.chains).toEqual(["Ethereum", "Polygon"]);
  });

  it("getProtocol returns data:null when name missing", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200 }),
    );
    const { getProtocol } = await import("../defillama");
    const r = await getProtocol("unknown");
    expect(r?.data).toBeNull();
  });

  it("getChainTvl returns matching chain", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify([
          { name: "Ethereum", tvl: 50e9 },
          { name: "Solana", tvl: 8.1e9 },
        ]),
        { status: 200 },
      ),
    );
    const { getChainTvl } = await import("../defillama");
    const r = await getChainTvl("Solana");
    expect(r?.data).toEqual({ chain: "Solana", tvlUsd: 8.1e9 });
  });

  it("getTopYields filters by TVL and sorts by APY", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            { pool: "a", project: "x", symbol: "USDC", chain: "Ethereum", apy: 5, tvlUsd: 5_000_000 },
            { pool: "b", project: "y", symbol: "ETH", chain: "Ethereum", apy: 12, tvlUsd: 2_000_000 },
            { pool: "c", project: "z", symbol: "DAI", chain: "Ethereum", apy: 100, tvlUsd: 1000 },
            { pool: "d", project: "w", symbol: "USDT", chain: "Polygon", apy: 30, tvlUsd: 50_000_000 },
          ],
        }),
        { status: 200 },
      ),
    );
    const { getTopYields } = await import("../defillama");
    const r = await getTopYields({ chain: "Ethereum", minTvlUsd: 1_000_000, limit: 2 });
    expect(r?.data).toHaveLength(2);
    expect(r?.data[0].pool).toBe("b");
    expect(r?.data[0].apy).toBe(12);
  });
});
