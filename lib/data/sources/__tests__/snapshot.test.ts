import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";

const TMP = path.join("/tmp", `pyxis-snap-test-${process.pid}.db`);
process.env.SQLITE_PATH = TMP;

describe("data/sources/snapshot", () => {
  beforeEach(async () => {
    const { closeDb } = await import("../../../db");
    const { resetCacheStmts } = await import("../../cache");
    closeDb();
    resetCacheStmts();
    if (fs.existsSync(TMP)) fs.unlinkSync(TMP);
  });

  afterEach(() => vi.restoreAllMocks());

  it("getActiveProposals parses + builds links", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            proposals: [
              {
                id: "0xprop1",
                title: "Raise debt ceiling to $1B",
                state: "active",
                scores_total: 1234.5,
                scores: [800, 434.5],
                choices: ["For", "Against"],
                start: 1716000000,
                end: 1716800000,
                space: { id: "aave.eth" },
              },
            ],
          },
        }),
        { status: 200 },
      ),
    );
    const { getActiveProposals } = await import("../snapshot");
    const r = await getActiveProposals("aave.eth", 5);
    expect(r?.data).toHaveLength(1);
    expect(r?.data[0].title).toContain("debt ceiling");
    expect(r?.data[0].link).toBe(
      "https://snapshot.org/#/aave.eth/proposal/0xprop1",
    );
  });

  it("returns empty array when proposals missing", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ data: { proposals: [] } }), {
        status: 200,
      }),
    );
    const { getActiveProposals } = await import("../snapshot");
    const r = await getActiveProposals("nonexistent.eth", 5);
    expect(r?.data).toEqual([]);
  });
});
