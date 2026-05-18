import crypto from "node:crypto";
import { getDb } from "../db";

export function issueAuthNonce(): string {
  const nonce = crypto.randomBytes(16).toString("hex");
  getDb()
    .prepare("INSERT INTO auth_nonces (nonce, issued_at) VALUES (?, ?)")
    .run(nonce, Date.now());
  return nonce;
}

export function consumeAuthNonce(nonce: string): boolean {
  const db = getDb();
  const row = db
    .prepare("SELECT used, issued_at FROM auth_nonces WHERE nonce = ?")
    .get(nonce) as { used: number; issued_at: number } | undefined;
  if (!row) return false;
  if (row.used) return false;
  if (Date.now() - row.issued_at > 10 * 60 * 1000) return false; // 10 min expiry
  db.prepare("UPDATE auth_nonces SET used = 1 WHERE nonce = ?").run(nonce);
  return true;
}

export function recordPaymentNonce(nonce: string, wallet: string): boolean {
  try {
    getDb()
      .prepare(
        "INSERT INTO payment_nonces (nonce, wallet_address, seen_at) VALUES (?, ?, ?)",
      )
      .run(nonce, wallet.toLowerCase(), Date.now());
    return true;
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    if (code && String(code).includes("CONSTRAINT")) return false;
    throw e;
  }
}
