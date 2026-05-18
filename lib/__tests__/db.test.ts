import { describe, it, expect, beforeEach } from "vitest";
import fs from "node:fs";
import path from "node:path";

const TMP = path.join("/tmp", `pyxis-test-${process.pid}.db`);
process.env.SQLITE_PATH = TMP;

describe("db", () => {
  beforeEach(async () => {
    const { closeDb } = await import("../db");
    closeDb();
    if (fs.existsSync(TMP)) fs.unlinkSync(TMP);
  });

  it("opens DB and applies migration 001", async () => {
    const { getDb } = await import("../db");
    const db = getDb();
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all() as { name: string }[];
    const names = tables.map((t) => t.name).sort();
    expect(names).toContain("research_sessions");
    expect(names).toContain("auth_nonces");
    expect(names).toContain("payment_nonces");
    expect(names).toContain("_migrations");
  });

  it("does not re-apply migration on second open", async () => {
    const { getDb } = await import("../db");
    const db1 = getDb();
    db1.exec("INSERT INTO auth_nonces (nonce, issued_at) VALUES ('n1', 1)");
    const db2 = getDb();
    const rows = db2.prepare("SELECT * FROM auth_nonces").all();
    expect(rows.length).toBe(1);
  });
});
