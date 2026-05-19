import { logger } from "../logger";
import { cacheGet, cacheSet } from "./cache";
import { wrap, type WithFreshness } from "./freshness";

export interface FetchOpts {
  source: string;
  timeoutMs?: number;
  cacheKey?: string;
  ttlMs?: number;
  headers?: Record<string, string>;
  init?: RequestInit;
}

export async function fetchJson<T>(
  url: string,
  opts: FetchOpts,
): Promise<WithFreshness<T> | null> {
  const timeout = opts.timeoutMs ?? 4000;

  if (opts.cacheKey) {
    const hit = cacheGet<T>(opts.cacheKey);
    if (hit !== null) {
      logger.debug("data.cache_hit", { source: opts.source, key: opts.cacheKey });
      return wrap(hit, opts.source, url, true);
    }
  }

  const start = Date.now();
  try {
    const res = await fetch(url, {
      ...opts.init,
      headers: { Accept: "application/json", ...(opts.headers ?? {}) },
      signal: AbortSignal.timeout(timeout),
    });
    const ms = Date.now() - start;

    if (!res.ok) {
      logger.warn("data.fetch_non_ok", {
        source: opts.source,
        status: res.status,
        ms,
      });
      return null;
    }

    const data = (await res.json()) as T;

    if (opts.cacheKey && opts.ttlMs) {
      cacheSet(opts.cacheKey, data, opts.ttlMs, opts.source);
    }

    logger.debug("data.fetch_ok", { source: opts.source, ms });
    return wrap(data, opts.source, url, false);
  } catch (err) {
    logger.warn("data.fetch_error", {
      source: opts.source,
      err: String(err),
      ms: Date.now() - start,
    });
    return null;
  }
}
