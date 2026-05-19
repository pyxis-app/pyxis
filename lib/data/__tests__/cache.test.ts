import { describe, it, expect, beforeEach } from "vitest";
import fs from "node:fs";
import path from "node:path";

const TMP = path.join("/tmp", `pyxis-cache-test-${process.pid}.db`);
process.env.SQLITE_PATH = TMP;

describe("data/cache", () => {
  beforeEach(async () => {
    const { closeDb } = await import("../../db");
    const { resetCacheStmts } = await import("../cache");
    closeDb();
    resetCacheStmts();
    if (fs.existsSync(TMP)) fs.unlinkSync(TMP);
  });

  it("returns null on miss", async () => {
    const { cacheGet } = await import("../cache");
    expect(cacheGet("nope")).toBeNull();
  });

  it("round-trips a value within TTL", async () => {
    const { cacheGet, cacheSet } = await import("../cache");
    cacheSet("k1", { hello: "world", n: 42 }, 60_000, "test");
    const v = cacheGet<{ hello: string; n: number }>("k1");
    expect(v).toEqual({ hello: "world", n: 42 });
  });

  it("treats expired entries as miss", async () => {
    const { cacheGet, cacheSet } = await import("../cache");
    cacheSet("k2", { a: 1 }, -1, "test");
    expect(cacheGet("k2")).toBeNull();
  });

  it("overwrites on second set (INSERT OR REPLACE)", async () => {
    const { cacheGet, cacheSet } = await import("../cache");
    cacheSet("k3", { v: 1 }, 60_000, "test");
    cacheSet("k3", { v: 2 }, 60_000, "test");
    expect(cacheGet<{ v: number }>("k3")).toEqual({ v: 2 });
  });

  it("purges expired entries", async () => {
    const { cacheSet, cachePurgeExpired, cacheGet } = await import("../cache");
    cacheSet("alive", { x: 1 }, 60_000, "test");
    cacheSet("dead1", { x: 1 }, -1, "test");
    cacheSet("dead2", { x: 1 }, -1, "test");
    const removed = cachePurgeExpired();
    expect(removed).toBe(2);
    expect(cacheGet("alive")).toEqual({ x: 1 });
    expect(cacheGet("dead1")).toBeNull();
  });

  it("cacheKey joins parts deterministically", async () => {
    const { cacheKey } = await import("../cache");
    expect(cacheKey(["coingecko", "price", "solana"])).toBe(
      "coingecko:price:solana",
    );
    expect(cacheKey(["a", 1, "b"])).toBe("a:1:b");
  });
});
