import crypto from "node:crypto";
import { getDb } from "../db";
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

export function insertSession(input: {
  id: string;
  walletAddress: string;
  topic: string;
  briefing: StoredBriefing;
  paymentTx?: string | null;
}) {
  const db = getDb();
  db.prepare(
    `
    INSERT INTO research_sessions
      (id, wallet_address, topic, topic_hash, briefing_json, payment_tx, partial, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `,
  ).run(
    input.id,
    input.walletAddress.toLowerCase(),
    input.topic,
    hashTopic(input.topic),
    JSON.stringify(input.briefing),
    input.paymentTx ?? null,
    input.briefing.partial ? 1 : 0,
    Date.now(),
  );
}

interface RawRow {
  id: string;
  wallet_address: string;
  topic: string;
  topic_hash: string;
  briefing_json: string;
  payment_tx: string | null;
  partial: number;
  created_at: number;
}

function rowToSession(r: RawRow): SessionRow {
  return {
    id: r.id,
    walletAddress: r.wallet_address,
    topic: r.topic,
    briefing: JSON.parse(r.briefing_json) as StoredBriefing,
    paymentTx: r.payment_tx,
    createdAt: r.created_at,
  };
}

export function listByWallet(wallet: string, limit = 50): SessionRow[] {
  const rows = getDb()
    .prepare(
      `
      SELECT * FROM research_sessions
      WHERE wallet_address = ?
      ORDER BY created_at DESC
      LIMIT ?
    `,
    )
    .all(wallet.toLowerCase(), limit) as RawRow[];
  return rows.map(rowToSession);
}

export function findRecentDuplicate(
  wallet: string,
  topic: string,
  windowMs: number,
): SessionRow | null {
  const cutoff = Date.now() - windowMs;
  const row = getDb()
    .prepare(
      `
      SELECT * FROM research_sessions
      WHERE wallet_address = ? AND topic_hash = ? AND created_at > ?
      ORDER BY created_at DESC LIMIT 1
    `,
    )
    .get(wallet.toLowerCase(), hashTopic(topic), cutoff) as RawRow | undefined;
  return row ? rowToSession(row) : null;
}
