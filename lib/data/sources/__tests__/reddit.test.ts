import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";

const TMP = path.join("/tmp", `pyxis-reddit-test-${process.pid}.db`);
process.env.SQLITE_PATH = TMP;

describe("data/sources/reddit", () => {
  beforeEach(async () => {
    const { closeDb } = await import("../../../db");
    const { resetCacheStmts } = await import("../../cache");
    closeDb();
    resetCacheStmts();
    if (fs.existsSync(TMP)) fs.unlinkSync(TMP);
  });

  afterEach(() => vi.restoreAllMocks());

  it("getSubredditMeta parses about.json", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            display_name: "solana",
            subscribers: 250_000,
            active_user_count: 1_200,
            public_description: "Solana subreddit",
            created_utc: 1530000000,
          },
        }),
        { status: 200 },
      ),
    );
    const { getSubredditMeta } = await import("../reddit");
    const r = await getSubredditMeta("solana");
    expect(r?.data?.name).toBe("solana");
    expect(r?.data?.subscribers).toBe(250_000);
    expect(r?.data?.activeUsers).toBe(1_200);
  });

  it("getSubredditNewPosts parses listing", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            children: [
              {
                data: {
                  title: "FireDancer update",
                  author: "user1",
                  score: 142,
                  num_comments: 38,
                  url: "https://reddit.com/r/solana/x",
                  permalink: "/r/solana/comments/x/firedancer",
                  selftext: "long post body...",
                  created_utc: 1716000000,
                },
              },
              {
                data: {
                  title: "JTO airdrop chatter",
                  author: "user2",
                  score: 88,
                  num_comments: 12,
                  url: "https://reddit.com/r/solana/y",
                  permalink: "/r/solana/comments/y/jto",
                  selftext: "",
                  created_utc: 1716010000,
                },
              },
            ],
          },
        }),
        { status: 200 },
      ),
    );
    const { getSubredditNewPosts } = await import("../reddit");
    const r = await getSubredditNewPosts("solana", 5);
    expect(r?.data).toHaveLength(2);
    expect(r?.data[0].title).toBe("FireDancer update");
    expect(r?.data[0].permalink).toContain("reddit.com");
  });
});
