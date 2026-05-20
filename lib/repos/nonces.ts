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
  // Atomic compare-and-swap: flip used→true only if currently unused and
  // within the 10-min window, in a single statement. A separate SELECT-then-
  // UPDATE leaves a TOCTOU window where two concurrent /verify calls both pass
  // the `used === false` check and both succeed (nonce replay). RETURNING tells
  // us whether THIS call won the row.
  const cutoff = Date.now() - 10 * 60 * 1000;
  const rows = (await sql<Array<{ nonce: string }>>`
    UPDATE auth_nonces
    SET used = true
    WHERE nonce = ${nonce} AND used = false AND issued_at > ${cutoff}
    RETURNING nonce
  `) as unknown as Array<{ nonce: string }>;
  return rows.length > 0;
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
