import type { NextRequest } from "next/server";
import { insertCspViolation, type CspViolationInput } from "@/lib/repos/csp-violations";
import { clientIp } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";

type RawReport = Record<string, unknown>;

function coerceString(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 ? v : null;
}
function coerceInt(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? Math.floor(v) : null;
}

function extractReports(body: unknown): RawReport[] {
  // Reporting API (new): array of { type, body, ... }
  if (Array.isArray(body)) {
    return body
      .map((entry: unknown) => {
        if (entry && typeof entry === "object") {
          const e = entry as RawReport;
          const inner = e["body"];
          if (inner && typeof inner === "object") return inner as RawReport;
          return e;
        }
        return null;
      })
      .filter((r): r is RawReport => r !== null);
  }
  // Old format: { "csp-report": {...} }
  if (body && typeof body === "object") {
    const wrapped = (body as RawReport)["csp-report"];
    if (wrapped && typeof wrapped === "object") return [wrapped as RawReport];
    return [body as RawReport];
  }
  return [];
}

function toViolation(r: RawReport, ua: string | null, ip: string | null): CspViolationInput {
  return {
    documentUri: coerceString(r["document-uri"] ?? r["documentURL"]),
    violatedDirective:
      coerceString(r["violated-directive"] ?? r["effectiveDirective"]) ?? "unknown",
    effectiveDirective: coerceString(r["effective-directive"] ?? r["effectiveDirective"]),
    blockedUri: coerceString(r["blocked-uri"] ?? r["blockedURL"]),
    sourceFile: coerceString(r["source-file"] ?? r["sourceFile"]),
    lineNumber: coerceInt(r["line-number"] ?? r["lineNumber"]),
    columnNumber: coerceInt(r["column-number"] ?? r["columnNumber"]),
    statusCode: coerceInt(r["status-code"] ?? r["statusCode"]),
    userAgent: ua,
    clientIp: ip,
    raw: r,
  };
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(null, { status: 204 });
  }

  const reports = extractReports(body);
  if (reports.length === 0) return new Response(null, { status: 204 });

  const ua = req.headers.get("user-agent");
  const ip = clientIp(req as unknown as NextRequest);

  for (const r of reports) {
    try {
      await insertCspViolation(toViolation(r, ua, ip));
    } catch (err) {
      logger.warn("csp.report.insert_failed", { err: String(err) });
    }
  }

  return new Response(null, { status: 204 });
}
