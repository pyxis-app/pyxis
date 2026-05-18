import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "node:fs";
import path from "node:path";

const TMP = path.join("/tmp", `pyxis-rsearch-${process.pid}.db`);
process.env.SQLITE_PATH = TMP;
process.env.SIWE_JWT_SECRET = "test-secret-32-bytes-test-test-test";

vi.mock("@/lib/probes/pipeline", () => ({
  runPipeline: vi.fn(async (topic: string) => ({
    id: "fake-id",
    topic,
    briefing: "## ok",
    confidence: 88,
    sources: 5,
    partial: false,
    createdAt: new Date().toISOString(),
  })),
}));

describe("POST /api/research", () => {
  beforeEach(() => {
    if (fs.existsSync(TMP)) fs.unlinkSync(TMP);
  });

  it("runs the pipeline when payment header is present (simulated)", async () => {
    const { closeDb } = await import("@/lib/db");
    closeDb();
    const { POST } = await import("@/app/api/research/route");

    const req = new Request("http://localhost/api/research", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-PAYER-ADDRESS": "0xCafe000000000000000000000000000000000001",
        "X-PAYMENT-TX": "0xtx",
        "X-PAYMENT-NONCE": "nonce-abc",
      },
      body: JSON.stringify({ topic: "Solana" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.briefing).toContain("ok");
    expect(body.id).toBe("fake-id");
  });
});
