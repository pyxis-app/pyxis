import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";

const TMP = path.join("/tmp", `pyxis-fng-test-${process.pid}.db`);
process.env.SQLITE_PATH = TMP;

describe("data/sources/alternativeme", () => {
  beforeEach(async () => {
    const { closeDb } = await import("../../../db");
    const { resetCacheStmts } = await import("../../cache");
    closeDb();
    resetCacheStmts();
    if (fs.existsSync(TMP)) fs.unlinkSync(TMP);
  });

  afterEach(() => vi.restoreAllMocks());

  it("getFearGreed parses and orders current first", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            { value: "42", value_classification: "Fear", timestamp: "1715990400" },
            { value: "55", value_classification: "Greed", timestamp: "1715904000" },
            { value: "60", value_classification: "Greed", timestamp: "1715817600" },
          ],
        }),
        { status: 200 },
      ),
    );
    const { getFearGreed } = await import("../alternativeme");
    const r = await getFearGreed(3);
    expect(r?.data?.current.value).toBe(42);
    expect(r?.data?.current.classification).toBe("Fear");
    expect(r?.data?.history).toHaveLength(3);
  });

  it("returns data:null on empty payload", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ data: [] }), { status: 200 }),
    );
    const { getFearGreed } = await import("../alternativeme");
    const r = await getFearGreed();
    expect(r?.data).toBeNull();
  });
});
