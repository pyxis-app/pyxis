import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";

const TMP = path.join("/tmp", `pyxis-tavily-test-${process.pid}.db`);
process.env.SQLITE_PATH = TMP;

describe("data/sources/tavily (cached)", () => {
  beforeEach(async () => {
    const { closeDb } = await import("../../../db");
    const { resetCacheStmts } = await import("../../cache");
    closeDb();
    resetCacheStmts();
    if (fs.existsSync(TMP)) fs.unlinkSync(TMP);
    process.env.TAVILY_API_KEY = "test-key";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.TAVILY_API_KEY;
  });

  it("returns null when no API key", async () => {
    delete process.env.TAVILY_API_KEY;
    const fetchMock = vi.spyOn(global, "fetch");
    const { searchTavily } = await import("../tavily");
    const r = await searchTavily("query");
    expect(r).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts query, parses results, returns with freshness meta", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          results: [
            { title: "T1", url: "https://t1.com", content: "C1" },
            { title: "T2", url: "https://t2.com", content: "C2" },
          ],
        }),
        { status: 200 },
      ),
    );
    const { searchTavily } = await import("../tavily");
    const r = await searchTavily("Solana", 2);
    expect(fetchMock).toHaveBeenCalled();
    expect(r?.data).toHaveLength(2);
    expect(r?.data[0].url).toBe("https://t1.com");
    expect(r?.meta.source).toBe("tavily");
    expect(r?.meta.cached).toBe(false);
  });

  it("returns null on non-2xx (no throw)", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response("err", { status: 500 }),
    );
    const { searchTavily } = await import("../tavily");
    const r = await searchTavily("x");
    expect(r).toBeNull();
  });

  it("second call within TTL hits cache", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            results: [{ title: "T1", url: "https://t1.com", content: "C1" }],
          }),
          { status: 200 },
        ),
      ),
    );
    const { searchTavily } = await import("../tavily");
    const a = await searchTavily("Solana", 2);
    const b = await searchTavily("Solana", 2);
    expect(a?.meta.cached).toBe(false);
    expect(b?.meta.cached).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
