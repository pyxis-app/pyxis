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

// briefing_json was written via `${JSON.stringify(obj)}::jsonb`, which the
// `postgres` driver double-encodes — the column holds a JSONB *scalar string*
// containing the JSON, not a JSONB object. So on read it comes back as a
// string and needs one more parse. Tolerate both shapes (string = legacy
// double-encoded; object = if the write is ever corrected).
function parseBriefing(v: unknown): StoredBriefing {
  if (typeof v === "string") {
    try {
      return JSON.parse(v) as StoredBriefing;
    } catch {
      /* fall through — return as-is below */
    }
  }
  return v as StoredBriefing;
}

function rowToSession(r: RawRow): SessionRow {
  return {
    id: r.id,
    walletAddress: r.wallet_address,
    topic: r.topic,
    briefing: parseBriefing(r.briefing_json),
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

export interface AdminStats {
  total: number;
  wallets: number;
  last24h: number;
  last7d: number;
  partial: number;
}

/** Aggregate counts across ALL wallets. Admin-only — callers must gate. */
export async function getAdminStats(): Promise<AdminStats> {
  await ensureMigrations();
  const sql = getSql();
  const now = Date.now();
  const day = now - 24 * 60 * 60 * 1000;
  const week = now - 7 * 24 * 60 * 60 * 1000;
  const rows = (await sql<Array<Record<string, string>>>`
    SELECT
      count(*)                                     AS total,
      count(DISTINCT wallet_address)               AS wallets,
      count(*) FILTER (WHERE created_at > ${day})  AS last24h,
      count(*) FILTER (WHERE created_at > ${week}) AS last7d,
      count(*) FILTER (WHERE partial)              AS partial
    FROM research_sessions
  `) as unknown as Array<Record<string, string>>;
  const r = rows[0] ?? {};
  return {
    total: Number(r.total ?? 0),
    wallets: Number(r.wallets ?? 0),
    last24h: Number(r.last24h ?? 0),
    last7d: Number(r.last7d ?? 0),
    partial: Number(r.partial ?? 0),
  };
}

export interface AdminRecentRow {
  id: string;
  walletAddress: string;
  topic: string;
  partial: boolean;
  createdAt: number;
}

/** Most recent runs across ALL wallets. Admin-only — callers must gate. */
export async function listRecentAll(limit = 20): Promise<AdminRecentRow[]> {
  await ensureMigrations();
  const sql = getSql();
  const rows = (await sql<
    Array<{
      id: string;
      wallet_address: string;
      topic: string;
      partial: boolean;
      created_at: string | number;
    }>
  >`
    SELECT id, wallet_address, topic, partial, created_at
    FROM research_sessions
    ORDER BY created_at DESC
    LIMIT ${limit}
  `) as unknown as Array<{
    id: string;
    wallet_address: string;
    topic: string;
    partial: boolean;
    created_at: string | number;
  }>;
  return rows.map((r) => ({
    id: r.id,
    walletAddress: r.wallet_address,
    topic: r.topic,
    partial: r.partial,
    createdAt: Number(r.created_at),
  }));
}

export interface AdminWalletCount {
  walletAddress: string;
  count: number;
}

/** Top wallets by run count. Admin-only — callers must gate. */
export async function topWallets(limit = 10): Promise<AdminWalletCount[]> {
  await ensureMigrations();
  const sql = getSql();
  const rows = (await sql<Array<{ wallet_address: string; count: string }>>`
    SELECT wallet_address, count(*) AS count
    FROM research_sessions
    GROUP BY wallet_address
    ORDER BY count DESC
    LIMIT ${limit}
  `) as unknown as Array<{ wallet_address: string; count: string }>;
  return rows.map((r) => ({
    walletAddress: r.wallet_address,
    count: Number(r.count),
  }));
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
