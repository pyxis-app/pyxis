import { logger } from "./logger";

interface CoinGeckoSearch {
  coins?: Array<{ id: string; symbol: string; name: string }>;
}

async function fetchJson<T>(
  url: string,
  timeoutMs = 8000,
): Promise<T | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch (e) {
    logger.warn("market.fetch_failed", { url, err: String(e) });
    return null;
  }
}

export async function getMarketContext(topic: string): Promise<string> {
  // 1. Search CoinGecko for a matching coin by name in topic
  const search = await fetchJson<CoinGeckoSearch>(
    `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(topic)}`,
  );
  const coin = search?.coins?.[0];
  if (!coin) return "";

  // 2. Pull price + market cap
  const priceJson = await fetchJson<
    Record<
      string,
      { usd: number; usd_24h_change: number; usd_market_cap: number }
    >
  >(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coin.id}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`,
  );
  const price = priceJson?.[coin.id];

  // 3. Try DefiLlama TVL by coin name (best-effort)
  const tvlJson = await fetchJson<{ tvl?: number }>(
    `https://api.llama.fi/v2/historicalChainTvl/${encodeURIComponent(coin.name)}`,
  );

  const lines: string[] = [];
  lines.push(`## Live market context for ${coin.name} (${coin.symbol.toUpperCase()})`);
  if (price) {
    lines.push(
      `- Price: $${price.usd.toLocaleString()} (24h: ${price.usd_24h_change.toFixed(2)}%)`,
    );
    lines.push(`- Market cap: $${(price.usd_market_cap / 1e9).toFixed(2)}B`);
  }
  if (typeof tvlJson?.tvl === "number") {
    lines.push(
      `- DeFi TVL: $${(tvlJson.tvl / 1e9).toFixed(2)}B (DefiLlama)`,
    );
  }
  lines.push(
    `- Sources: https://www.coingecko.com/en/coins/${coin.id}, https://defillama.com`,
  );
  return lines.join("\n");
}
