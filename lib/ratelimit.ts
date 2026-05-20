interface Bucket {
  count: number;
  resetAt: number;
}
const buckets = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  if (b.count >= limit)
    return { ok: false, retryAfter: Math.ceil((b.resetAt - now) / 1000) };
  b.count++;
  return { ok: true, retryAfter: 0 };
}

export function clientIp(req: Request): string {
  // Prefer `x-real-ip`: on Vercel the platform sets it to the true client IP
  // and a client cannot forge it. The leftmost `x-forwarded-for` entry is
  // client-controlled (anyone can prepend a fake hop), so keying the limiter on
  // it lets an attacker mint unlimited buckets and bypass the limit. Use XFF
  // only as a fallback, and take the LAST hop (closest to our trusted proxy).
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const hops = fwd.split(",").map((h) => h.trim()).filter(Boolean);
    if (hops.length > 0) return hops[hops.length - 1];
  }
  return "unknown";
}
