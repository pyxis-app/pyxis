import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";

const TMP = path.join("/tmp", `pyxis-gx-test-${process.pid}.db`);
process.env.SQLITE_PATH = TMP;

describe("data/sources/getxapi", () => {
  beforeEach(async () => {
    const { closeDb } = await import("../../../db");
    const { resetCacheStmts } = await import("../../cache");
    closeDb();
    resetCacheStmts();
    if (fs.existsSync(TMP)) fs.unlinkSync(TMP);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.GETXAPI_API_KEY;
    delete process.env.PYXIS_GETXAPI_MAX_CALLS;
  });

  it("newBudget honors PYXIS_GETXAPI_MAX_CALLS env", async () => {
    process.env.PYXIS_GETXAPI_MAX_CALLS = "3";
    const { newBudget } = await import("../getxapi");
    expect(newBudget().remaining).toBe(3);
  });

  it("getUserInfo returns null without key + no fetch call", async () => {
    const fetchMock = vi.spyOn(global, "fetch");
    const { getUserInfo, newBudget } = await import("../getxapi");
    const r = await getUserInfo("solana", newBudget());
    expect(r).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("getUserInfo decrements budget and parses user payload", async () => {
    process.env.GETXAPI_API_KEY = "test-key";
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          status: "ok",
          data: {
            userName: "solana",
            name: "Solana",
            followers: 2_800_000,
            following: 200,
            isVerified: true,
            description: "powered by community",
            createdAt: "2018-04-10T00:00:00Z",
            statusesCount: 14_500,
          },
        }),
        { status: 200 },
      ),
    );
    const { getUserInfo, newBudget } = await import("../getxapi");
    const budget = newBudget();
    const start = budget.remaining;
    const r = await getUserInfo("solana", budget);
    expect(r?.data?.followers).toBe(2_800_000);
    expect(r?.data?.verified).toBe(true);
    expect(budget.remaining).toBe(start - 1);
  });

  it("searchMentions scores sentiment via lexicon", async () => {
    process.env.GETXAPI_API_KEY = "test-key";
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          status: "ok",
          tweets: [
            { id: "1", text: "this is bullish, accumulate 🚀", likeCount: 100, retweetCount: 20, author: { userName: "a", followers: 10000 } },
            { id: "2", text: "looks like a rug to me, sus contract", likeCount: 50, retweetCount: 5, author: { userName: "b", followers: 200 } },
            { id: "3", text: "neutral take, watching for now", likeCount: 10, retweetCount: 1, author: { userName: "c", followers: 50 } },
          ],
        }),
        { status: 200 },
      ),
    );
    const { searchMentions, newBudget } = await import("../getxapi");
    const r = await searchMentions("solana", newBudget());
    expect(r?.data.tweets).toHaveLength(3);
    expect(r?.data.sentiment.positivePct).toBe(33);
    expect(r?.data.sentiment.negativePct).toBe(33);
    expect(r?.data.topByEngagement[0].id).toBe("1");
    expect(r?.data.uniqueAuthors).toBe(3);
  });

  it("respects budget: 0 remaining short-circuits", async () => {
    process.env.GETXAPI_API_KEY = "test-key";
    const fetchMock = vi.spyOn(global, "fetch");
    const { getUserInfo } = await import("../getxapi");
    const r = await getUserInfo("solana", { remaining: 0 });
    expect(r).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
