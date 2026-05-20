import crypto from "node:crypto";
import { getSql, ensureMigrations } from "../db";
import type { FreshnessMeta } from "../data/freshness";
import type { TopicType } from "../probes/types";

export interface StoredBriefing {
  briefing: string;
  confidence: number;
  sources: number;
  partial: boolean;
  topicType?: TopicType;
  freshness?: FreshnessMeta[];
}

export interface SessionRow {
  id: string;
  walletAddress: string;
  topic: string;
  briefing: StoredBriefing;
  paymentTx: string | null;
  createdAt: number;
}

function hashTopic(t: string): string {
  return crypto.createHash("sha256").update(t.trim().toLowerCase()).digest("hex");
}

export async function insertSession(input: {
  id: string;
  walletAddress: string;
  topic: string;
  briefing: StoredBriefing;
  paymentTx?: string | null;
}): Promise<void> {
  await ensureMigrations();
  const sql = getSql();
  await sql`
    INSERT INTO research_sessions
      (id, wallet_address, topic, topic_hash, briefing_json, payment_tx, partial, created_at)
    VALUES (
      ${input.id},
      ${input.walletAddress.toLowerCase()},
      ${input.topic},
      ${hashTopic(input.topic)},
      ${JSON.stringify(input.briefing)}::jsonb,
      ${input.paymentTx ?? null},
      ${input.briefing.partial},
      ${Date.now()}
    )
  `;
}

interface RawRow {
  id: string;
  wallet_address: string;
  topic: string;
  topic_hash: string;
  briefing_json: StoredBriefing;
  payment_tx: string | null;
  partial: boolean;
  created_at: string | number; // BIGINT may come as string
}

function rowToSession(r: RawRow): SessionRow {
  return {
    id: r.id,
    walletAddress: r.wallet_address,
    topic: r.topic,
    briefing: r.briefing_json,
    paymentTx: r.payment_tx,
    createdAt: Number(r.created_at),
  };
}

export async function listByWallet(
  wallet: string,
  limit = 50,
): Promise<SessionRow[]> {
  await ensureMigrations();
  const sql = getSql();
  const rows = (await sql<RawRow[]>`
    SELECT * FROM research_sessions
    WHERE wallet_address = ${wallet.toLowerCase()}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `) as unknown as RawRow[];
  return rows.map(rowToSession);
}

/**
 * Fetch a single session by id, no wallet filter. Used by the PUBLIC briefing
 * view (`/b/[id]`) — ids are unguessable UUIDs and briefings are research
 * output, not secrets, so this is intentionally not auth-gated.
 */
export async function getById(id: string): Promise<SessionRow | null> {
  await ensureMigrations();
  const sql = getSql();
  const rows = (await sql<RawRow[]>`
    SELECT * FROM research_sessions WHERE id = ${id} LIMIT 1
  `) as unknown as RawRow[];
  return rows.length > 0 ? rowToSession(rows[0]) : null;
}

/**
 * Delete a session, scoped to its owner wallet so one wallet can't delete
 * another's rows. Returns true if a row was actually removed.
 */
export async function deleteByIdForWallet(
  id: string,
  wallet: string,
): Promise<boolean> {
  await ensureMigrations();
  const sql = getSql();
  const rows = (await sql<Array<{ id: string }>>`
    DELETE FROM research_sessions
    WHERE id = ${id} AND wallet_address = ${wallet.toLowerCase()}
    RETURNING id
  `) as unknown as Array<{ id: string }>;
  return rows.length > 0;
}

export async function findRecentDuplicate(
  wallet: string,
  topic: string,
  windowMs: number,
): Promise<SessionRow | null> {
  await ensureMigrations();
  const sql = getSql();
  const cutoff = Date.now() - windowMs;
  const rows = (await sql<RawRow[]>`
    SELECT * FROM research_sessions
    WHERE wallet_address = ${wallet.toLowerCase()}
      AND topic_hash = ${hashTopic(topic)}
      AND created_at > ${cutoff}
    ORDER BY created_at DESC
    LIMIT 1
  `) as unknown as RawRow[];
  return rows.length > 0 ? rowToSession(rows[0]) : null;
}
