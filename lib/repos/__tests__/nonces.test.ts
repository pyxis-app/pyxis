import { describe, it, expect, beforeEach } from "vitest";
import fs from "node:fs";
import path from "node:path";

const TMP = path.join("/tmp", `pyxis-n-${process.pid}.db`);
process.env.SQLITE_PATH = TMP;

describe("nonces repo", () => {
  beforeEach(async () => {
    const { closeDb } = await import("../../db");
    closeDb();
    if (fs.existsSync(TMP)) fs.unlinkSync(TMP);
  });

  it("auth: issue + consume once", async () => {
    const { closeDb } = await import("../../db");
    closeDb();
    const { issueAuthNonce, consumeAuthNonce } = await import("../nonces");

    const n = issueAuthNonce();
    expect(typeof n).toBe("string");
    expect(consumeAuthNonce(n)).toBe(true);
    expect(consumeAuthNonce(n)).toBe(false); // already used
  });

  it("payment: insertIfNew rejects duplicates", async () => {
    const { closeDb } = await import("../../db");
    closeDb();
    const { recordPaymentNonce } = await import("../nonces");

    expect(recordPaymentNonce("nonce-1", "0xabc")).toBe(true);
    expect(recordPaymentNonce("nonce-1", "0xabc")).toBe(false);
  });
});
