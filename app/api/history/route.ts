import { NextResponse } from "next/server";
import { listByWallet } from "@/lib/repos/research-sessions";
import { verifyJwt } from "@/lib/siwe";

function parseCookie(req: Request, name: string): string | null {
  const c = req.headers.get("cookie");
  if (!c) return null;
  for (const part of c.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

export async function GET(req: Request) {
  const jwt = parseCookie(req, "pyxis_session");
  const wallet = jwt ? verifyJwt(jwt) : null;
  if (!wallet)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const rows = await listByWallet(wallet, 100);
  return NextResponse.json({
    sessions: rows.map((r) => ({
      id: r.id,
      topic: r.topic,
      briefing: r.briefing.briefing,
      confidence: r.briefing.confidence,
      sources: r.briefing.sources,
      partial: r.briefing.partial,
      topicType: r.briefing.topicType ?? null,
      freshness: r.briefing.freshness ?? [],
      createdAt: new Date(r.createdAt).toISOString(),
    })),
  });
}
