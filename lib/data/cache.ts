import { getSql, ensureMigrations } from "../db";

function dbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!dbConfigured()) return null;
  await ensureMigrations();
  const sql = getSql();
  const rows = (await sql<Array<{ value_json: T }>>`
    SELECT value_json FROM api_cache
    WHERE key = ${key} AND expires_at > ${Date.now()}
    LIMIT 1
  `) as unknown as Array<{ value_json: T }>;
  if (rows.length === 0) return null;
  return rows[0].value_json;
}

export async function cacheSet<T>(
  key: string,
  value: T,
  ttlMs: number,
  source: string,
): Promise<void> {
  if (!dbConfigured()) return;
  await ensureMigrations();
  const sql = getSql();
  const now = Date.now();
  await sql`
    INSERT INTO api_cache (key, value_json, source, expires_at, created_at)
    VALUES (${key}, ${JSON.stringify(value)}::jsonb, ${source}, ${now + ttlMs}, ${now})
    ON CONFLICT (key) DO UPDATE SET
      value_json = EXCLUDED.value_json,
      source     = EXCLUDED.source,
      expires_at = EXCLUDED.expires_at,
      created_at = EXCLUDED.created_at
  `;
}

export async function cachePurgeExpired(): Promise<number> {
  if (!dbConfigured()) return 0;
  await ensureMigrations();
  const sql = getSql();
  const result = (await sql`DELETE FROM api_cache WHERE expires_at <= ${Date.now()}`) as unknown as {
    count?: number;
  };
  return result.count ?? 0;
}

export function cacheKey(parts: Array<string | number>): string {
  return parts.map(String).join(":");
}

/**
 * Reset internal state (used by tests to clear connection pool between cases).
 * No-op in production paths.
 */
export function resetCacheStmts(): void {
  // postgres library doesn't need prepared statement reset; kept for test parity.
}
