import { describe, it, expect, beforeEach } from "vitest";
import fs from "node:fs";
import path from "node:path";

const TMP = path.join("/tmp", `pyxis-rs-${process.pid}.db`);
process.env.SQLITE_PATH = TMP;

describe("research sessions repo", () => {
  beforeEach(async () => {
    const { closeDb } = await import("../../db");
    closeDb();
    if (fs.existsSync(TMP)) fs.unlinkSync(TMP);
  });

  it("inserts and reads back by wallet", async () => {
    const { closeDb } = await import("../../db");
    closeDb();
    const repo = await import("../research-sessions");

    repo.insertSession({
      id: "s1",
      walletAddress: "0xabc",
      topic: "Solana",
      briefing: {
        briefing: "## hi",
        confidence: 90,
        sources: 3,
        partial: false,
      },
      paymentTx: "0xtx",
    });

    const rows = repo.listByWallet("0xabc", 10);
    expect(rows).toHaveLength(1);
    expect(rows[0].topic).toBe("Solana");
    expect(rows[0].briefing.confidence).toBe(90);
  });

  it("idempotency: returns existing within 60s for same wallet+topic", async () => {
    const { closeDb } = await import("../../db");
    closeDb();
    const repo = await import("../research-sessions");

    repo.insertSession({
      id: "s1",
      walletAddress: "0xabc",
      topic: "Solana",
      briefing: { briefing: "first", confidence: 1, sources: 0, partial: false },
      paymentTx: "tx1",
    });
    const dupe = repo.findRecentDuplicate("0xabc", "Solana", 60_000);
    expect(dupe?.id).toBe("s1");
    expect(dupe?.briefing.briefing).toBe("first");
  });

  it("idempotency: returns null after window", async () => {
    const { closeDb } = await import("../../db");
    closeDb();
    const repo = await import("../research-sessions");

    repo.insertSession({
      id: "s1",
      walletAddress: "0xabc",
      topic: "Solana",
      briefing: { briefing: "old", confidence: 1, sources: 0, partial: false },
      paymentTx: "tx1",
    });
    const old = repo.findRecentDuplicate("0xabc", "Solana", 0);
    expect(old).toBeNull();
  });
});
