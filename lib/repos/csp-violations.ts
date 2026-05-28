import { getSql, ensureMigrations } from "../db";

export interface CspViolationInput {
  documentUri: string | null;
  violatedDirective: string;
  effectiveDirective: string | null;
  blockedUri: string | null;
  sourceFile: string | null;
  lineNumber: number | null;
  columnNumber: number | null;
  statusCode: number | null;
  userAgent: string | null;
  clientIp: string | null;
  raw: unknown;
}

export async function insertCspViolation(v: CspViolationInput): Promise<void> {
  await ensureMigrations();
  const sql = getSql();
  await sql`
    INSERT INTO csp_violations (
      reported_at, document_uri, violated_directive, effective_directive,
      blocked_uri, source_file, line_number, column_number, status_code,
      user_agent, client_ip, raw_json
    ) VALUES (
      ${Date.now()}, ${v.documentUri}, ${v.violatedDirective}, ${v.effectiveDirective},
      ${v.blockedUri}, ${v.sourceFile}, ${v.lineNumber}, ${v.columnNumber}, ${v.statusCode},
      ${v.userAgent}, ${v.clientIp}, ${JSON.stringify(v.raw)}
    )
  `;
}

export interface CspViolationGroup {
  violatedDirective: string;
  blockedUri: string | null;
  count: number;
  lastSeenAt: number;
}

export async function groupRecentCspViolations(
  sinceMs: number,
  limit = 50,
): Promise<CspViolationGroup[]> {
  await ensureMigrations();
  const sql = getSql();
  const rows = (await sql<
    Array<{
      violated_directive: string;
      blocked_uri: string | null;
      count: string;
      last_seen_at: string;
    }>
  >`
    SELECT
      violated_directive,
      blocked_uri,
      COUNT(*)        AS count,
      MAX(reported_at) AS last_seen_at
    FROM csp_violations
    WHERE reported_at >= ${sinceMs}
    GROUP BY violated_directive, blocked_uri
    ORDER BY count DESC, last_seen_at DESC
    LIMIT ${limit}
  `) as unknown as Array<{
    violated_directive: string;
    blocked_uri: string | null;
    count: string;
    last_seen_at: string;
  }>;
  return rows.map((r) => ({
    violatedDirective: r.violated_directive,
    blockedUri: r.blocked_uri,
    count: Number(r.count),
    lastSeenAt: Number(r.last_seen_at),
  }));
}
