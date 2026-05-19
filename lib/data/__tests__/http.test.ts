import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";

const TMP = path.join("/tmp", `pyxis-http-test-${process.pid}.db`);
process.env.SQLITE_PATH = TMP;

describe("data/http fetchJson", () => {
  beforeEach(async () => {
    const { closeDb } = await import("../../db");
    const { resetCacheStmts } = await import("../cache");
    closeDb();
    resetCacheStmts();
    if (fs.existsSync(TMP)) fs.unlinkSync(TMP);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns parsed JSON wrapped with freshness on 2xx", async () => {
    const { fetchJson } = await import("../http");
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true, value: 7 }), { status: 200 }),
    );
    const res = await fetchJson<{ ok: boolean; value: number }>(
      "https://example.test/api",
      { source: "test" },
    );
    expect(res).not.toBeNull();
    expect(res!.data).toEqual({ ok: true, value: 7 });
    expect(res!.meta.source).toBe("test");
    expect(res!.meta.endpoint).toBe("https://example.test/api");
    expect(res!.meta.cached).toBe(false);
    expect(typeof res!.meta.sampledAt).toBe("string");
  });

  it("returns null on non-2xx (no throw)", async () => {
    const { fetchJson } = await import("../http");
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response("nope", { status: 500 }),
    );
    const res = await fetchJson("https://example.test/api", { source: "test" });
    expect(res).toBeNull();
  });

  it("returns null when fetch throws (network/timeout)", async () => {
    const { fetchJson } = await import("../http");
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("boom"));
    const res = await fetchJson("https://example.test/api", { source: "test" });
    expect(res).toBeNull();
  });

  it("caches on success and returns cached value on second call", async () => {
    const { fetchJson } = await import("../http");
    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ v: 1 }), { status: 200 }),
      );

    const a = await fetchJson<{ v: number }>("https://example.test/api", {
      source: "test",
      cacheKey: "test:k1",
      ttlMs: 60_000,
    });
    expect(a?.data.v).toBe(1);
    expect(a?.meta.cached).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const b = await fetchJson<{ v: number }>("https://example.test/api", {
      source: "test",
      cacheKey: "test:k1",
      ttlMs: 60_000,
    });
    expect(b?.data.v).toBe(1);
    expect(b?.meta.cached).toBe(true);
    // No additional fetch
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not cache when ttlMs not provided", async () => {
    const { fetchJson } = await import("../http");
    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockImplementation(() =>
        Promise.resolve(
          new Response(JSON.stringify({ v: 1 }), { status: 200 }),
        ),
      );
    await fetchJson("https://example.test/api", {
      source: "test",
      cacheKey: "test:k2",
    });
    await fetchJson("https://example.test/api", {
      source: "test",
      cacheKey: "test:k2",
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("passes custom headers", async () => {
    const { fetchJson } = await import("../http");
    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({}), { status: 200 }),
      );
    await fetchJson("https://example.test/api", {
      source: "test",
      headers: { "X-Custom": "v1" },
    });
    const callArgs = fetchMock.mock.calls[0][1] as RequestInit;
    const h = callArgs.headers as Record<string, string>;
    expect(h["X-Custom"]).toBe("v1");
    expect(h["Accept"]).toBe("application/json");
  });
});
