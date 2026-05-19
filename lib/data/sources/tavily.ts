import { cacheKey, cacheGet, cacheSet } from "../cache";
import { wrap, type WithFreshness } from "../freshness";
import { logger } from "../../logger";

const ENDPOINT = "https://api.tavily.com/search";
const SOURCE = "tavily";
const TTL = 30 * 60 * 1000; // 30 min — news evolves but stabilises in minutes
const TIMEOUT = 30_000;

export interface TavilyResult {
  title: string;
  url: string;
  content: string;
  publishedDate?: string;
}

interface RawResponse {
  results?: TavilyResult[];
}

export async function searchTavily(
  query: string,
  maxResults = 2,
): Promise<WithFreshness<TavilyResult[]> | null> {
  const key = process.env.TAVILY_API_KEY;
  if (!key) return null;

  const ck = cacheKey([SOURCE, "search", query.toLowerCase(), maxResults]);
  const hit = await cacheGet<TavilyResult[]>(ck);
  if (hit) {
    logger.debug("data.cache_hit", { source: SOURCE, key: ck });
    return wrap(hit, SOURCE, ENDPOINT, true);
  }

  const start = Date.now();
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: key,
        query,
        max_results: maxResults,
        search_depth: "basic",
        include_answer: false,
      }),
      signal: AbortSignal.timeout(TIMEOUT),
    });
    const ms = Date.now() - start;
    if (!res.ok) {
      logger.warn("data.fetch_non_ok", { source: SOURCE, status: res.status, ms });
      return null;
    }
    const json = (await res.json()) as RawResponse;
    const results = json.results ?? [];
    await cacheSet(ck, results, TTL, SOURCE);
    logger.debug("data.fetch_ok", { source: SOURCE, ms, count: results.length });
    return wrap(results, SOURCE, ENDPOINT, false);
  } catch (err) {
    logger.warn("data.fetch_error", {
      source: SOURCE,
      err: String(err),
      ms: Date.now() - start,
    });
    return null;
  }
}
