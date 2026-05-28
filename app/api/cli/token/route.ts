import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import jwt from "jsonwebtoken";
import { verifyJwt } from "@/lib/siwe";

interface PendingEntry {
  jwt: string;
  wallet: string;
  exp: number;
  createdAt: number;
}

const PENDING_TTL_MS = 5 * 60 * 1000;
const MAX_PENDING = 100;
const pendingTokens = new Map<string, PendingEntry>();

function isValidChallenge(s: unknown): s is string {
  return typeof s === "string" && /^[A-Za-z0-9_-]{43}$/.test(s);
}

function isValidVerifier(s: unknown): s is string {
  return typeof s === "string" && /^[A-Za-z0-9_-]{43,86}$/.test(s);
}

function parseCookie(req: Request, name: string): string | null {
  const c = req.headers.get("cookie");
  if (!c) return null;
  for (const part of c.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

function prunePending(now = Date.now()) {
  for (const [k, v] of pendingTokens) {
    if (now - v.createdAt > PENDING_TTL_MS) pendingTokens.delete(k);
  }
  if (pendingTokens.size > MAX_PENDING) {
    const keys = Array.from(pendingTokens.keys());
    for (let i = 0; i < pendingTokens.size - MAX_PENDING; i++) {
      pendingTokens.delete(keys[i]);
    }
  }
}

export async function POST(req: Request) {
  let body: { challenge?: unknown };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "invalid json" }, { status: 400 }); }

  if (!isValidChallenge(body.challenge)) {
    return NextResponse.json({ error: "invalid challenge" }, { status: 400 });
  }

  const sessionJwt = parseCookie(req, "pyxis_session");
  const wallet = sessionJwt ? verifyJwt(sessionJwt) : null;
  if (!wallet || !sessionJwt) {
    return NextResponse.json({ error: "sign in required" }, { status: 401 });
  }

  const decoded = jwt.decode(sessionJwt) as { exp?: number } | null;
  if (!decoded?.exp) {
    return NextResponse.json({ error: "invalid session" }, { status: 401 });
  }

  prunePending();
  pendingTokens.set(body.challenge, {
    jwt: sessionJwt,
    wallet,
    exp: decoded.exp,
    createdAt: Date.now(),
  });
  return NextResponse.json({ wallet, exp: decoded.exp });
}

export async function PUT(req: Request) {
  let body: { code?: unknown; verifier?: unknown };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "invalid json" }, { status: 400 }); }

  if (!isValidChallenge(body.code) || !isValidVerifier(body.verifier)) {
    return NextResponse.json({ error: "invalid params" }, { status: 400 });
  }

  const expected = createHash("sha256").update(body.verifier).digest("base64url");
  if (expected !== body.code) {
    return NextResponse.json({ error: "challenge mismatch" }, { status: 401 });
  }

  prunePending();
  const entry = pendingTokens.get(body.code);
  if (!entry) {
    return NextResponse.json({ error: "unknown or expired challenge" }, { status: 401 });
  }
  pendingTokens.delete(body.code);
  return NextResponse.json({ token: entry.jwt, wallet: entry.wallet, exp: entry.exp });
}

// Test-only helper.
export function __resetPendingForTests() { pendingTokens.clear(); }
