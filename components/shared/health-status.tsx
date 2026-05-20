"use client";

import { useEffect, useState } from "react";

type Health = "checking" | "ok" | "degraded" | "down";

const LABEL: Record<Health, string> = {
  checking: "checking…",
  ok: "all systems operational",
  degraded: "degraded",
  down: "offline",
};

const COLOR: Record<Health, string> = {
  checking: "var(--muted)",
  ok: "var(--accent)",
  degraded: "var(--danger)",
  down: "var(--danger)",
};

/**
 * Tiny live system-status pill backed by `GET /api/health`. Polls on mount and
 * every 60s. `ok` only when the endpoint returns 200 + `{status:"ok"}` (i.e.
 * Neon reachable); any non-ok body → degraded; a fetch failure → offline.
 *
 * `compact` drops the text label (dot only) for tight spots like a nav bar.
 */
export function HealthStatus({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const [status, setStatus] = useState<Health>("checking");

  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const res = await fetch("/api/health", { cache: "no-store" });
        const body = (await res.json().catch(() => null)) as
          | { status?: string }
          | null;
        if (cancelled) return;
        setStatus(res.ok && body?.status === "ok" ? "ok" : "degraded");
      } catch {
        if (!cancelled) setStatus("down");
      }
    }
    check();
    const id = setInterval(check, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const color = COLOR[status];
  const label = LABEL[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)] ${className}`}
      title={`system status: ${label}`}
      aria-live="polite"
    >
      <span
        aria-hidden
        className={status === "ok" ? "probe-active" : ""}
        style={{
          width: 6,
          height: 6,
          borderRadius: "9999px",
          background: color,
          boxShadow: status === "ok" ? `0 0 6px ${color}` : "none",
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      {!compact && label}
    </span>
  );
}
