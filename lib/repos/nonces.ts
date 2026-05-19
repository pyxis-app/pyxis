import crypto from "node:crypto";
import { getSql, ensureMigrations } from "../db";

export async function issueAuthNonce(): Promise<string> {
  await ensureMigrations();
  const nonce = crypto.randomBytes(16).toString("hex");
  const sql = getSql();
  await sql`
    INSERT INTO auth_nonces (nonce, issued_at)
    VALUES (${nonce}, ${Date.now()})
  `;
  return nonce;
}

export async function consumeAuthNonce(nonce: string): Promise<boolean> {
  await ensureMigrations();
  const sql = getSql();
  const rows = (await sql<
    Array<{ used: boolean; issued_at: string | number }>
  >`SELECT used, issued_at FROM auth_nonces WHERE nonce = ${nonce}`) as unknown as Array<{
    used: boolean;
    issued_at: string | number;
  }>;
  if (rows.length === 0) return false;
  const row = rows[0];
  if (row.used) return false;
  if (Date.now() - Number(row.issued_at) > 10 * 60 * 1000) return false; // 10 min expiry
  await sql`UPDATE auth_nonces SET used = true WHERE nonce = ${nonce}`;
  return true;
}

export async function recordPaymentNonce(
  nonce: string,
  wallet: string,
): Promise<boolean> {
  await ensureMigrations();
  const sql = getSql();
  try {
    await sql`
      INSERT INTO payment_nonces (nonce, wallet_address, seen_at)
      VALUES (${nonce}, ${wallet.toLowerCase()}, ${Date.now()})
    `;
    return true;
  } catch (e: unknown) {
    // Postgres unique violation = SQLSTATE 23505
    const code = (e as { code?: string })?.code;
    if (code === "23505") return false;
    throw e;
  }
}
