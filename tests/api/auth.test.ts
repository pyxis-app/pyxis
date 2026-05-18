import { describe, it, expect, beforeEach } from "vitest";
import fs from "node:fs";
import path from "node:path";

const TMP = path.join("/tmp", `pyxis-auth-${process.pid}.db`);
process.env.SQLITE_PATH = TMP;
process.env.SIWE_JWT_SECRET = "test-secret-32-bytes-test-test-test";

describe("auth API", () => {
  beforeEach(async () => {
    const { closeDb } = await import("@/lib/db");
    closeDb();
    if (fs.existsSync(TMP)) fs.unlinkSync(TMP);
  });

  it("GET /api/auth/nonce returns a string", async () => {
    const { closeDb } = await import("@/lib/db");
    closeDb();
    const { GET } = await import("@/app/api/auth/nonce/route");
    const res = await GET();
    const body = await res.json();
    expect(typeof body.nonce).toBe("string");
    expect(body.nonce.length).toBeGreaterThan(16);
  });

  it("POST /api/auth/verify rejects garbage", async () => {
    const { closeDb } = await import("@/lib/db");
    closeDb();
    const { POST } = await import("@/app/api/auth/verify/route");
    const req = new Request("http://localhost/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "not a real siwe message",
        signature: "0x00",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
