import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { env } from "@/lib/env";

// Always run fresh — a cached health check is useless to an uptime monitor.
export const dynamic = "force-dynamic";

// Generous enough that a Neon free-tier cold-resume (it suspends when idle)
// doesn't trip a false "down", but short enough to stay a snappy health probe.
const DB_TIMEOUT_MS = 5000;

async function checkDb(): Promise<{ ok: boolean; latencyMs: number }> {
  const started = Date.now();
  try {
    const sql = getSql();
    // Race the trivial round-trip against a timeout so a hung/cold Neon
    // connection can't make the health endpoint itself hang.
    await Promise.race([
      sql`SELECT 1`,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("db-timeout")), DB_TIMEOUT_MS),
      ),
    ]);
    return { ok: true, latencyMs: Date.now() - started };
  } catch {
    // Never surface the underlying error (could leak the connection string /
    // host) — the monitor only needs up/down.
    return { ok: false, latencyMs: Date.now() - started };
  }
}

export async function GET() {
  const db = await checkDb();
  const ok = db.ok;
  return NextResponse.json(
    {
      status: ok ? "ok" : "degraded",
      db: db.ok ? "up" : "down",
      dbLatencyMs: db.latencyMs,
      freeMode: env.X402_FREE_MODE(),
      time: new Date().toISOString(),
    },
    {
      status: ok ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
