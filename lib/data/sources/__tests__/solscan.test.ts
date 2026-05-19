import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";

const TMP = path.join("/tmp", `pyxis-sol-test-${process.pid}.db`);
process.env.SQLITE_PATH = TMP;

describe("data/sources/solscan", () => {
  beforeEach(async () => {
    const { closeDb } = await import("../../../db");
    const { resetCacheStmts } = await import("../../cache");
    closeDb();
    resetCacheStmts();
    if (fs.existsSync(TMP)) fs.unlinkSync(TMP);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.SOLSCAN_API_KEY;
  });

  it("returns null without SOLSCAN_API_KEY", async () => {
    const { getSolTokenMeta } = await import("../solscan");
    expect(await getSolTokenMeta("addr")).toBeNull();
  });

  it("parses token meta when key present", async () => {
    process.env.SOLSCAN_API_KEY = "test-key";
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            address: "So11111111111111111111111111111111111111112",
            name: "Wrapped SOL",
            symbol: "SOL",
            decimals: 9,
            supply: "500000000000000000",
            holder: 234567,
          },
        }),
        { status: 200 },
      ),
    );
    const { getSolTokenMeta } = await import("../solscan");
    const r = await getSolTokenMeta("So11111111111111111111111111111111111111112");
    expect(r?.data?.symbol).toBe("SOL");
    expect(r?.data?.holderCount).toBe(234_567);
  });

  it("parses top holders with percentage", async () => {
    process.env.SOLSCAN_API_KEY = "test-key";
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            total: 2,
            items: [
              { address: "Wallet1", amount: "1000", rank: 1, percentage: 12.5 },
              { address: "Wallet2", amount: "500", rank: 2, percentage: 6.25 },
            ],
          },
        }),
        { status: 200 },
      ),
    );
    const { getSolTopHolders } = await import("../solscan");
    const r = await getSolTopHolders("addr", 10);
    expect(r?.data).toHaveLength(2);
    expect(r?.data[0].percentage).toBe(12.5);
  });
});
