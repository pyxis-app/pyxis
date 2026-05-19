import type { Statement } from "better-sqlite3";
import { getDb } from "../db";

let _stmts: {
  get: Statement;
  set: Statement;
  purge: Statement;
} | null = null;

function stmts() {
  if (_stmts) return _stmts;
  const db = getDb();
  _stmts = {
    get: db.prepare(
      "SELECT value_json FROM api_cache WHERE key = ? AND expires_at > ?",
    ),
    set: db.prepare(
      "INSERT OR REPLACE INTO api_cache (key, value_json, source, expires_at, created_at) VALUES (?, ?, ?, ?, ?)",
    ),
    purge: db.prepare("DELETE FROM api_cache WHERE expires_at <= ?"),
  };
  return _stmts;
}

export function cacheGet<T>(key: string): T | null {
  const row = stmts().get.get(key, Date.now()) as
    | { value_json: string }
    | undefined;
  if (!row) return null;
  try {
    return JSON.parse(row.value_json) as T;
  } catch {
    return null;
  }
}

export function cacheSet<T>(
  key: string,
  value: T,
  ttlMs: number,
  source: string,
): void {
  const now = Date.now();
  stmts().set.run(key, JSON.stringify(value), source, now + ttlMs, now);
}

export function cachePurgeExpired(): number {
  const result = stmts().purge.run(Date.now());
  return result.changes;
}

export function cacheKey(parts: Array<string | number>): string {
  return parts.map(String).join(":");
}

export function resetCacheStmts(): void {
  _stmts = null;
}
