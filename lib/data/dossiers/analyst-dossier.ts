import type { FreshnessMeta, WithFreshness } from "../freshness";
import { collectMeta } from "../freshness";
import type { CommanderHints, TopicType } from "../../probes/types";
import { searchCoin, getCoinSnapshot, type CoinSnapshot } from "../sources/coingecko";
import { getCmcQuote, type CmcQuote } from "../sources/coinmarketcap";
import {
  getProtocol,
  getChainTvl,
  getTopYields,
  getStablecoinOverview,
  type ProtocolSummary,
  type ChainTvl,
  type YieldPool,
  type StablecoinAgg,
} from "../sources/defillama";
import { searchPairs, type PairSummary } from "../sources/dexscreener";
import { getTrendingPools, type TrendingPool } from "../sources/geckoterminal";
import { getSpotTicker, type SpotTicker } from "../sources/binance";
import { getFearGreed, type FearGreedSeries } from "../sources/alternativeme";
import {
  getContractMeta,
  getTokenSupply,
  type ContractMeta,
  type TokenSupply,
} from "../sources/etherscan";
import {
  getSolTokenMeta,
  getSolTopHolders,
  type SolTokenMeta,
  type SolHolder,
} from "../sources/solscan";

export interface AnalystDossier {
  query: string;
  topicType: TopicType;
  chainHint?: string;
  markdown: string;
  freshness: FreshnessMeta[];
  failedSources: string[];
  endpointSources: string[];
}

function fmtUsd(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "n/a";
  if (Math.abs(n) >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}

function fmtPct(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "n/a";
  return `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;
}

function fmtSupply(n: number | null | undefined): string {
  if (n === null || n === undefined) return "n/a";
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function renderCoinSnapshot(s: CoinSnapshot, meta: FreshnessMeta): string {
  const lines = [
    `### ${s.name} (${s.symbol.toUpperCase()}) — CoinGecko snapshot ${meta.cached ? "[cached]" : "[live]"}`,
    `- Price: ${fmtUsd(s.priceUsd)} USD`,
    `- Change: 24h ${fmtPct(s.change24h)} · 7d ${fmtPct(s.change7d)} · 30d ${fmtPct(s.change30d)}`,
    `- Market cap: ${fmtUsd(s.marketCapUsd)} · Volume 24h: ${fmtUsd(s.volume24hUsd)}`,
    s.athUsd !== null
      ? `- ATH: ${fmtUsd(s.athUsd)} (${(s.athDate ?? "").slice(0, 10)}) · ATL: ${fmtUsd(s.atlUsd)} (${(s.atlDate ?? "").slice(0, 10)})`
      : "",
    `- Supply: ${fmtSupply(s.circulatingSupply)} circulating${
      s.maxSupply !== null ? ` / ${fmtSupply(s.maxSupply)} max` : s.totalSupply !== null ? ` / ${fmtSupply(s.totalSupply)} total` : ""
    }`,
    s.categories.length > 0 ? `- Categories: ${s.categories.slice(0, 4).join(", ")}` : "",
  ].filter(Boolean);
  return lines.join("\n");
}

function renderCmcFallback(q: CmcQuote, meta: FreshnessMeta): string {
  return [
    `### ${q.name} (${q.symbol}) — CoinMarketCap cross-check ${meta.cached ? "[cached]" : "[live]"}`,
    `- Price: ${fmtUsd(q.priceUsd)} · 24h ${fmtPct(q.change24h)} · 7d ${fmtPct(q.change7d)}`,
    `- Market cap: ${fmtUsd(q.marketCapUsd)} · Vol 24h: ${fmtUsd(q.volume24hUsd)} · Rank: #${q.cmcRank ?? "n/a"}`,
  ].join("\n");
}

function renderChainTvl(t: ChainTvl, meta: FreshnessMeta): string {
  return `### Chain TVL — DefiLlama ${meta.cached ? "[cached]" : "[live]"}\n- ${t.chain}: ${fmtUsd(t.tvlUsd)}`;
}

function renderProtocol(p: ProtocolSummary, meta: FreshnessMeta): string {
  return [
    `### Protocol — DefiLlama ${meta.cached ? "[cached]" : "[live]"}`,
    `- ${p.name}${p.category ? ` (${p.category})` : ""}`,
    `- TVL: ${fmtUsd(p.tvlUsd)} · Δ1d ${fmtPct(p.change1d)} · Δ7d ${fmtPct(p.change7d)}`,
    p.chains.length > 0 ? `- Chains: ${p.chains.slice(0, 6).join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function renderDexPairs(pairs: PairSummary[], meta: FreshnessMeta): string {
  if (pairs.length === 0) return "";
  const lines = [`### Top DEX pairs — DexScreener ${meta.cached ? "[cached]" : "[live]"}`];
  for (const p of pairs) {
    lines.push(
      `- ${p.baseSymbol}/${p.quoteSymbol} on ${p.dex} (${p.chain}): ${fmtUsd(p.priceUsd)}, liq ${fmtUsd(p.liquidityUsd)}, vol24h ${fmtUsd(p.volume24hUsd)}, 24h ${fmtPct(p.priceChange24h)}`,
    );
  }
  return lines.join("\n");
}

function renderTrendingPools(pools: TrendingPool[], meta: FreshnessMeta): string {
  if (pools.length === 0) return "";
  const lines = [`### Trending pools — GeckoTerminal ${meta.cached ? "[cached]" : "[live]"}`];
  for (const p of pools.slice(0, 5)) {
    lines.push(
      `- ${p.name} on ${p.dex}: reserve ${fmtUsd(p.reserveUsd)}, vol24h ${fmtUsd(p.volume24hUsd)}, 24h ${fmtPct(p.priceChange24h)}`,
    );
  }
  return lines.join("\n");
}

function renderBinance(t: SpotTicker, meta: FreshnessMeta): string {
  return [
    `### Spot ticker — Binance ${meta.cached ? "[cached]" : "[live]"}`,
    `- ${t.symbol}: ${fmtUsd(t.lastPrice)} (24h ${fmtPct(t.priceChangePercent)})`,
    `- Range 24h: ${fmtUsd(t.lowPrice)} – ${fmtUsd(t.highPrice)} · Quote vol: ${fmtUsd(t.volumeQuoteUsd)}`,
  ].join("\n");
}

function renderYields(pools: YieldPool[], meta: FreshnessMeta): string {
  if (pools.length === 0) return "";
  const lines = [`### Top yields — DefiLlama ${meta.cached ? "[cached]" : "[live]"}`];
  for (const p of pools.slice(0, 5)) {
    lines.push(
      `- ${p.apy.toFixed(2)}% APY: ${p.symbol} on ${p.project} (${p.chain}, ${fmtUsd(p.tvlUsd)} TVL)`,
    );
  }
  return lines.join("\n");
}

function renderStables(s: StablecoinAgg, meta: FreshnessMeta): string {
  const lines = [
    `### Stablecoin context — DefiLlama ${meta.cached ? "[cached]" : "[live]"}`,
    `- Total stablecoin mcap: ${fmtUsd(s.totalMcapUsd)}`,
  ];
  if (s.top.length > 0) {
    lines.push(`- Top: ${s.top.map((t) => `${t.symbol} (${fmtUsd(t.circulatingUsd)})`).join(", ")}`);
  }
  return lines.join("\n");
}

function renderContractMeta(c: ContractMeta, meta: FreshnessMeta): string {
  return [
    `### On-chain contract — Etherscan ${meta.cached ? "[cached]" : "[live]"}`,
    `- Chain: ${c.chain} · Address: ${c.address}`,
    `- Verified source: ${c.verified ? "✅ Yes" : "❌ No"}`,
    c.verified ? `- Proxy upgradeable: ${c.hasProxy ? "yes" : "no"}` : "",
    c.verified ? `- Owner privilege pattern: ${c.hasOwner ? "yes (admin can act)" : "no (renounced/none)"}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function renderTokenSupply(s: TokenSupply, meta: FreshnessMeta): string {
  return [
    `### On-chain supply — Etherscan ${meta.cached ? "[cached]" : "[live]"}`,
    `- Raw total supply (atomic units): ${s.totalSupplyRaw}`,
  ].join("\n");
}

function renderSolMeta(m: SolTokenMeta, meta: FreshnessMeta): string {
  return [
    `### Solana token — Solscan ${meta.cached ? "[cached]" : "[live]"}`,
    `- ${m.name ?? "?"} (${m.symbol ?? "?"})`,
    `- Address: ${m.address}`,
    m.supply ? `- Supply: ${m.supply}` : "",
    m.holderCount !== null ? `- Holder count: ${m.holderCount.toLocaleString()}` : "",
    m.decimals !== null ? `- Decimals: ${m.decimals}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function renderSolHolders(holders: SolHolder[], meta: FreshnessMeta): string {
  if (holders.length === 0) return "";
  const top10Pct = holders.reduce((a, h) => a + (h.percentage ?? 0), 0);
  const lines = [
    `### Solana holder concentration — Solscan ${meta.cached ? "[cached]" : "[live]"}`,
    `- Top ${holders.length} holders combined: ${top10Pct.toFixed(2)}% of supply`,
  ];
  for (const h of holders.slice(0, 5)) {
    lines.push(
      `  - #${h.rank} ${h.owner.slice(0, 8)}...${h.owner.slice(-6)}: ${
        h.percentage !== null ? h.percentage.toFixed(2) + "%" : h.amount
      }`,
    );
  }
  return lines.join("\n");
}

function renderFng(f: FearGreedSeries, meta: FreshnessMeta): string {
  const trend = f.history
    .slice(0, 7)
    .map((p) => p.value)
    .reverse()
    .join(" → ");
  return [
    `### Macro sentiment — Alternative.me Fear & Greed ${meta.cached ? "[cached]" : "[live]"}`,
    `- Current: ${f.current.value} (${f.current.classification})`,
    `- 7-day trend: ${trend}`,
  ].join("\n");
}

const NETWORK_TO_BINANCE_QUOTE: Record<string, string> = {
  ethereum: "ETHUSDT",
  bitcoin: "BTCUSDT",
  solana: "SOLUSDT",
  base: "ETHUSDT", // Base ETH proxy
};

const COIN_TO_GECKO_NETWORK: Record<string, string> = {
  ethereum: "eth",
  bitcoin: "bitcoin",
  solana: "solana",
  base: "base",
  arbitrum: "arbitrum",
  polygon: "polygon_pos",
};

export async function buildAnalystDossier(
  query: string,
  topicType: TopicType,
  chainHint: string | undefined,
  hints: CommanderHints,
): Promise<AnalystDossier> {
  const tasks: Array<{
    name: string;
    run: () => Promise<WithFreshness<unknown> | null>;
  }> = [];

  // Always: macro sentiment
  tasks.push({ name: "fearGreed", run: () => getFearGreed(14) });

  // Token path
  if (topicType === "token") {
    const symbolHint = hints.symbol ?? query;
    tasks.push({
      name: "coingecko",
      run: async () => {
        const hit = await searchCoin(symbolHint);
        if (!hit || !hit.data) return hit ?? null;
        return getCoinSnapshot(hit.data.id);
      },
    });
    if (hints.symbol) {
      tasks.push({ name: "cmc", run: () => getCmcQuote(hints.symbol!) });
    }
    if (hints.binanceSymbol) {
      tasks.push({
        name: "binance",
        run: () => getSpotTicker(hints.binanceSymbol!),
      });
    }
    tasks.push({ name: "dexPairs", run: () => searchPairs(symbolHint, 5) });

    // On-chain: EVM via Etherscan or Solana via Solscan
    if (hints.contractAddress && chainHint) {
      if (chainHint === "solana") {
        tasks.push({
          name: "solMeta",
          run: () => getSolTokenMeta(hints.contractAddress!),
        });
        tasks.push({
          name: "solHolders",
          run: () => getSolTopHolders(hints.contractAddress!, 10),
        });
      } else {
        tasks.push({
          name: "contractMeta",
          run: () => getContractMeta(chainHint, hints.contractAddress!),
        });
        tasks.push({
          name: "tokenSupply",
          run: () => getTokenSupply(chainHint, hints.contractAddress!),
        });
      }
    }
  }

  // Chain path — enriched with native token CoinGecko lookup so we get
  // hard data (price, mcap, supply, ATH) for the chain's L1 token alongside
  // TVL/yields/trending pools. Before: only chainTvl + trendingPools + binance
  // ticker + generic yields. Solana state confidence stuck at 35 due to thin
  // hard data — adding native token CG snapshot gives 8-12 more $ data points.
  if (topicType === "chain") {
    const chainKey = chainHint ?? query;
    tasks.push({ name: "chainTvl", run: () => getChainTvl(chainKey) });

    // Native token lookup — try chain name directly (e.g. "solana" → SOL coin)
    tasks.push({
      name: "coingecko",
      run: async () => {
        const hit = await searchCoin(chainKey);
        if (!hit || !hit.data) return hit ?? null;
        return getCoinSnapshot(hit.data.id);
      },
    });

    const network = hints.geckoNetwork ?? COIN_TO_GECKO_NETWORK[chainKey.toLowerCase()];
    if (network) {
      tasks.push({ name: "trendingPools", run: () => getTrendingPools(network, 10) });
    }
    const binSym = NETWORK_TO_BINANCE_QUOTE[chainKey.toLowerCase()];
    if (binSym) {
      tasks.push({ name: "binance", run: () => getSpotTicker(binSym) });
    }
    tasks.push({ name: "topYields", run: () => getTopYields({ chain: chainKey, limit: 5 }) });
  }

  // Protocol path — backtest 2026-05-19 showed this was the weakest path
  // (EtherFi got 28/100 with only 2 $ values cited). Enriched to fetch
  // protocol-specific TVL + the protocol's native token (price/supply/liquidity)
  // since virtually every modern DeFi protocol has a governance token whose
  // metrics correlate tightly with the protocol's health.
  if (topicType === "protocol") {
    const slug = hints.defillamaSlug ?? query.toLowerCase().replace(/\s+/g, "-");

    // 1. DefiLlama protocol page — TVL, chain breakdown, growth metrics
    tasks.push({ name: "protocol", run: () => getProtocol(slug) });

    // 2. Token data via CoinGecko — almost every protocol has a token
    // (ETHFI for EtherFi, HYPE for Hyperliquid, etc.). Try symbol hint first,
    // fall back to topic name search.
    const tokenQuery = hints.symbol ?? query;
    tasks.push({
      name: "coingecko",
      run: async () => {
        const hit = await searchCoin(tokenQuery);
        if (!hit || !hit.data) return hit ?? null;
        return getCoinSnapshot(hit.data.id);
      },
    });

    // 3. Binance ticker if we have a specific symbol hint (most protocols listed on Binance)
    if (hints.binanceSymbol) {
      tasks.push({
        name: "binance",
        run: () => getSpotTicker(hints.binanceSymbol!),
      });
    } else if (hints.symbol) {
      // Best-effort: try the symbol + USDT
      tasks.push({
        name: "binance",
        run: () => getSpotTicker(`${hints.symbol!.toUpperCase()}USDT`),
      });
    }

    // 4. DEX pair liquidity for the protocol's token
    tasks.push({ name: "dexPairs", run: () => searchPairs(tokenQuery, 3) });

    // 5. Contract verification if address known (EVM)
    if (hints.contractAddress && chainHint && chainHint !== "solana") {
      tasks.push({
        name: "contractMeta",
        run: () => getContractMeta(chainHint, hints.contractAddress!),
      });
      tasks.push({
        name: "tokenSupply",
        run: () => getTokenSupply(chainHint, hints.contractAddress!),
      });
    }

    // 6. Yields filtered to this protocol's project name (DefiLlama uses the same slug)
    tasks.push({ name: "topYields", run: () => getTopYields({ project: slug, limit: 5 }) });
  }

  // Narrative path — was too generic (just stablecoins/yields/eth-trending).
  // Enriched with CoinGecko trending categories + DefiLlama protocols-by-category
  // for sector-specific signal. Also adds DEX pair search if topic suggests a token.
  if (topicType === "narrative") {
    tasks.push({ name: "stablecoins", run: () => getStablecoinOverview(5) });
    tasks.push({ name: "topYields", run: () => getTopYields({ limit: 5 }) });
    // Trending pools on Ethereum mainnet as a baseline for sector activity
    tasks.push({ name: "trendingPools", run: () => getTrendingPools("eth", 5) });
    // Also pull trending on Solana since memecoin/AI narratives skew there
    tasks.push({ name: "trendingPoolsSol", run: () => getTrendingPools("solana", 5) });
    // If the narrative mentions any specific tokens (passed via hints), look them up
    if (hints.symbol) {
      tasks.push({
        name: "coingecko",
        run: async () => {
          const hit = await searchCoin(hints.symbol!);
          if (!hit || !hit.data) return hit ?? null;
          return getCoinSnapshot(hit.data.id);
        },
      });
    }
  }

  // Execute in parallel
  const settled = await Promise.allSettled(tasks.map((t) => t.run()));
  const failedSources: string[] = [];
  const sections: string[] = [];
  const freshnessMetas: FreshnessMeta[] = [];
  const endpointSources: string[] = [];

  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    const r = settled[i];
    if (r.status === "rejected" || r.value === null) {
      failedSources.push(t.name);
      continue;
    }
    const v = r.value;
    if (!v || !v.data) {
      // null data: skip but track meta for transparency
      if (v?.meta) freshnessMetas.push(v.meta);
      continue;
    }
    freshnessMetas.push(v.meta);
    endpointSources.push(v.meta.endpoint);

    // Render per source name
    switch (t.name) {
      case "fearGreed":
        sections.push(renderFng(v.data as FearGreedSeries, v.meta));
        break;
      case "coingecko":
        sections.push(renderCoinSnapshot(v.data as CoinSnapshot, v.meta));
        break;
      case "cmc":
        sections.push(renderCmcFallback(v.data as CmcQuote, v.meta));
        break;
      case "chainTvl":
        sections.push(renderChainTvl(v.data as ChainTvl, v.meta));
        break;
      case "protocol":
        sections.push(renderProtocol(v.data as ProtocolSummary, v.meta));
        break;
      case "dexPairs": {
        const pairs = v.data as PairSummary[];
        if (pairs.length > 0) sections.push(renderDexPairs(pairs, v.meta));
        break;
      }
      case "trendingPools": {
        const pools = v.data as TrendingPool[];
        if (pools.length > 0) sections.push(renderTrendingPools(pools, v.meta));
        break;
      }
      case "binance":
        sections.push(renderBinance(v.data as SpotTicker, v.meta));
        break;
      case "topYields": {
        const ys = v.data as YieldPool[];
        if (ys.length > 0) sections.push(renderYields(ys, v.meta));
        break;
      }
      case "stablecoins":
        sections.push(renderStables(v.data as StablecoinAgg, v.meta));
        break;
      case "contractMeta":
        sections.push(renderContractMeta(v.data as ContractMeta, v.meta));
        break;
      case "tokenSupply":
        sections.push(renderTokenSupply(v.data as TokenSupply, v.meta));
        break;
      case "solMeta":
        sections.push(renderSolMeta(v.data as SolTokenMeta, v.meta));
        break;
      case "solHolders": {
        const holders = v.data as SolHolder[];
        if (holders.length > 0) sections.push(renderSolHolders(holders, v.meta));
        break;
      }
    }
  }

  const failuresLine =
    failedSources.length > 0 ? `\n\n_Sources unavailable: ${failedSources.join(", ")}_` : "";

  const markdown =
    sections.length === 0
      ? `_No live market data could be retrieved for "${query}". Treat findings below as model-knowledge only and lower confidence accordingly._`
      : `## Live Market Dossier\n\n${sections.join("\n\n")}${failuresLine}`;

  return {
    query,
    topicType,
    chainHint,
    markdown,
    freshness: freshnessMetas,
    failedSources,
    endpointSources,
  };
}

export { collectMeta };
