import { describe, it, expect, beforeEach } from "vitest";
import fs from "node:fs";
import path from "node:path";

const TMP = path.join("/tmp", `pyxis-history-${process.pid}.db`);
process.env.SQLITE_PATH = TMP;
process.env.SIWE_JWT_SECRET = "test-secret-32-bytes-test-test-test";

describe("GET /api/history", () => {
  beforeEach(() => {
    if (fs.existsSync(TMP)) fs.unlinkSync(TMP);
  });

  it("401 without a valid JWT cookie", async () => {
    const { closeDb } = await import("@/lib/db");
    closeDb();
    const { GET } = await import("@/app/api/history/route");
    const req = new Request("http://localhost/api/history");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns rows scoped to JWT.sub", async () => {
    const { closeDb } = await import("@/lib/db");
    closeDb();
    const { issueJwt } = await import("@/lib/siwe");
    const { insertSession } = await import("@/lib/repos/research-sessions");
    insertSession({
      id: "s1",
      walletAddress: "0xABC",
      topic: "T1",
      briefing: { briefing: "b", confidence: 1, sources: 0, partial: false },
      paymentTx: null,
    });
    insertSession({
      id: "s2",
      walletAddress: "0xDEF",
      topic: "T2",
      briefing: { briefing: "b", confidence: 1, sources: 0, partial: false },
      paymentTx: null,
    });

    const jwt = issueJwt("0xABC");
    const req = new Request("http://localhost/api/history", {
      headers: { cookie: `pyxis_session=${jwt}` },
    });
    const { GET } = await import("@/app/api/history/route");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.sessions).toHaveLength(1);
    expect(body.sessions[0].topic).toBe("T1");
  });
});
