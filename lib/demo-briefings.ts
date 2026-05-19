/**
 * Static demo briefings rendered on the landing page (`/`).
 *
 * Dated 17 May 2026 — the day before the site's notional "today". Numbers
 * are realistic mid-2026 projections (growth from late-2024 baselines)
 * rather than aspirational fiction. Structure mirrors the live Synthesizer
 * output for `topicType: "chain"`, including the auto-appended Data
 * Freshness table. Regenerate from a real research session against the
 * production pipeline before going live.
 */

export const SAMPLE_LABEL = "Sample · Run live for current data";

export type DemoTopicType = "token" | "chain" | "protocol" | "narrative";

export interface DemoBriefing {
  id: string;
  topic: string;
  topicType: DemoTopicType;
  coverTitle: string;     // formatted for cover-style headline (line-broken)
  briefing: string;       // full markdown, matches Synthesizer output shape
  confidence: number;     // 0-100
  sources: number;        // total cited URLs
  createdAt: string;      // ISO 8601
  partial: boolean;       // true if any probe failed in the original run
  // Editorial extras — extracted from briefing for magazine layout
  featuredStats: Array<{ value: string; label: string }>;
  pullQuote: string;
  sourceList: Array<{ url: string; host: string }>;
}

export const SOLANA_DEMO: DemoBriefing = {
  id: "demo-solana",
  topic: "Solana ecosystem state",
  topicType: "chain",
  coverTitle: "Solana\nEcosystem State",
  confidence: 84,
  sources: 11,
  createdAt: "2026-05-17T09:42:18Z",
  partial: false,
  featuredStats: [
    { value: "$84",   label: "SOL price"  },
    { value: "$48.7B", label: "Market cap" },
    { value: "$8.1B",  label: "DeFi TVL"   },
    { value: "1,452",  label: "Validators" },
    { value: "84",     label: "Confidence" },
  ],
  pullQuote:
    "Despite an extended drawdown, on-chain activity has held — daily active addresses are stable and developer commit volume is still climbing through the cycle.",
  sourceList: [
    { url: "https://jumpcrypto.com/firedancer",             host: "jumpcrypto.com"   },
    { url: "https://solanapay.com",                         host: "solanapay.com"    },
    { url: "https://solanamobile.com/seeker",               host: "solanamobile.com" },
    { url: "https://www.coingecko.com/en/coins/solana",     host: "coingecko.com"    },
    { url: "https://defillama.com/chain/Solana",            host: "defillama.com"    },
  ],
  briefing: `## Executive Summary

Solana enters mid-2026 in an extended risk-off cycle — SOL trades near
$84 after a multi-quarter drawdown that's also weighed on DeFi TVL,
holding near $8B. Underneath the price action, structural progress is
intact: FireDancer is running on a meaningful share of mainnet stake,
network uptime is stable, and on-chain activity (daily active addresses,
developer commits) has held through the cycle. Liquid staking remains
concentrated in Jito; validator decentralization and MEV concentration
are the most-discussed structural risks.

## Market Snapshot
- **SOL spot**: $84.26 USD · 24h −2.6% · 30d −2.9% (CoinGecko, live)
- **Market cap**: $48.70B · FDV $52.80B
- **Volume 24h**: $1.40B across CEX + DEX
- **Macro overlay**: Fear & Greed Index 42 (Fear), 7-day trend deteriorating
  (Alternative.me, live)

## Tokenomics & Supply
- **Circulating supply**: 578M SOL
- **Inflation**: ~5% annualised, decaying ~15% per epoch year
- **Liquid staking dominance**: Jito ~55% of staked SOL, Marinade ~21%,
  Sanctum and others rounding out the remainder
- **Validator stake distribution**: top 30 validators hold ~33% of stake
  (Nakamoto coefficient ~21)

## On-Chain Health
- **Validator count**: 1,452 active mainnet validators
- **Client diversity**: FireDancer (Jump Crypto) now serves a meaningful
  share of stake; the previous Solana-Labs validator monoculture risk has
  materially eased (Source: https://jumpcrypto.com/firedancer)
- **Mainnet uptime**: 14+ months since last halt
- **Block production latency**: stable post-Dencun-era throughput work

## Network / Protocol Activity
- **DeFi TVL**: $8.10B across 130+ protocols
  (Source: https://defillama.com/chain/Solana)
- **Daily active addresses**: ~1.0M (60d average) — stable through drawdown
- **Top DEX pools** (GeckoTerminal, live): SOL/USDC on Raydium dominates
  reserves; mSOL/SOL on Orca anchors LST liquidity; BONK/SOL and WIF/USDC
  show sustained memecoin retail flow
- **Top yields** (DefiLlama, live): 18.32% APY on SOL via Marinade ($420M
  TVL), 14.85% APY on USDC via Kamino, 12.40% APY on mSOL via MarginFi

## Social Pulse
**Overall Sentiment: cautiously constructive**

- Developer activity remains elevated despite price drawdown — commit
  volume and new program deployments continue at healthy weekly pace
- Bullish structural takes center on FireDancer reliability and the
  Solana Pay merchant pipeline
- Bearish takes center on broader macro and the SOL/ETH ratio
  underperforming Q2-2025 expectations
- MEV concentration via Jito's auction continues to be a controversial
  topic in core developer channels

_Lexicon-based mention sentiment is indicative only and not used as a
primary signal in this assessment._

## News & Catalysts
- **FireDancer in production**, materially reducing software-monoculture
  risk on the validator set (Source: https://jumpcrypto.com/firedancer)
- **Solana Pay** merchant integrations through major payment processors
  and Shopify; on-chain settlement at point-of-sale is now a measurable
  share of crypto-native commerce (Source: https://solanapay.com)
- **Seeker (Saga 2)** shipped to pre-orders; device-attached crypto
  remains a sub-1% contributor but builder mindshare is steady
  (Source: https://solanamobile.com/seeker)
- **Institutional staking products**: recent regulatory clarity has
  unblocked ETP-wrapped staking, potentially absorbing inflows
- **RWA tokenization**: tokenized money-market products on Solana have
  crossed multi-hundred-million-dollar thresholds

## Competitive Landscape
- Solana DeFi TVL ($8.1B) ≈ 14% of Ethereum L1+L2 combined TVL
- LST yield stack (~18% Marinade) sits well above Ethereum-side
  equivalents (Lido 4–7%), reflecting higher inflation rather than
  superior cash flows
- Memecoin retail volume remains strongest among major L1s; competing
  L1s (Base, Sui) have closed some of the gap but Solana retains
  liquidity depth

## Risks
- **Validator centralization**: Nakamoto coefficient ~21 leaves the
  network vulnerable to coordinated halts; smaller validators cite
  operating cost as the primary barrier
- **MEV capture concentration**: a single auction provider intermediates
  a majority of MEV revenue, creating systemic dependency risk
- **Liquid staking concentration**: Jito's >50% share of liquid staked
  SOL is itself a centralization concern, separate from validator-level
  decentralization
- **Regulatory tail risk**: SEC posture toward LSTs and staking products
  remains administration-sensitive

## Confidence Assessment
- **Overall confidence**: 84/100
- **Data quality**: high — price, TVL, validator metrics, and yields
  all sampled live from canonical APIs
- **Information gaps**: precise MEV revenue split is partially obscured;
  some validator metrics are 30 days old; macro context could shift
  narrative weight

## Data Freshness

| Source | Endpoint | Sampled | Cache |
| --- | --- | --- | --- |
| coingecko | https://api.coingecko.com/api/v3/coins/solana | 2026-05-17T09:42:18Z | live |
| defillama | https://api.llama.fi/v2/chains | 2026-05-17T09:42:18Z | live |
| defillama | https://yields.llama.fi/pools | 2026-05-17T09:42:18Z | live |
| binance | https://api.binance.com/api/v3/ticker/24hr?symbol=SOLUSDT | 2026-05-17T09:42:19Z | live |
| geckoterminal | https://api.geckoterminal.com/api/v2/networks/solana/trending_pools | 2026-05-17T09:42:19Z | live |
| alternativeme | https://api.alternative.me/fng/?limit=7 | 2026-05-17T03:00:00Z | cached |
| reddit | https://www.reddit.com/r/solana/new.json | 2026-05-17T09:38:42Z | live |
| tavily | https://api.tavily.com/search | 2026-05-17T09:42:20Z | live |
`,
};

export const ETHEREUM_DEMO: DemoBriefing = {
  id: "demo-ethereum",
  topic: "Ethereum and L2 ecosystem",
  topicType: "chain",
  coverTitle: "Ethereum\n& L2 Ecosystem",
  confidence: 86,
  sources: 13,
  createdAt: "2026-05-17T14:20:05Z",
  partial: false,
  featuredStats: [
    { value: "$2,097", label: "ETH price"      },
    { value: "$253B",  label: "Market cap"     },
    { value: "$58B",   label: "TVL · L1 + L2"  },
    { value: "34.5M",  label: "Staked ETH"     },
    { value: "86",     label: "Confidence"     },
  ],
  pullQuote:
    "EIP-7702 has matured into a real account-abstraction layer — gas sponsorship and session keys now feel like consumer-grade UX rather than a research demo.",
  sourceList: [
    { url: "https://blog.ethereum.org",                     host: "ethereum.org"    },
    { url: "https://l2beat.com",                            host: "l2beat.com"      },
    { url: "https://dune.com/queries/aa-adoption",          host: "dune.com"        },
    { url: "https://eigenlayer.xyz",                        host: "eigenlayer.xyz"  },
    { url: "https://www.coingecko.com/en/coins/ethereum",   host: "coingecko.com"   },
    { url: "https://defillama.com/chain/Ethereum",          host: "defillama.com"   },
  ],
  briefing: `## Executive Summary

Ethereum sits in mid-2026 in an extended drawdown — ETH near $2,100 after
multi-month declines, with the market cap retraced to ~$253B. Underneath
the price action, the protocol itself is in a constructive state: Pectra
has been live since 2025 with EIP-7702 account abstraction at the EOA
layer, Verkle-trees work consolidates on testnets ahead of the next hard
fork, and L2 throughput dominates user-facing activity. Restaking through
EigenLayer carries a real cryptoeconomic role at ~$13B notional. Blob
fees remain near floor levels post-Dencun, sharpening the L1-versus-L2
value capture debate. Institutional spot ETF flows have cooled.

## Market Snapshot
- **ETH spot**: $2,096.69 USD · 24h −4.0% · 30d −11.3% (CoinGecko, live)
- **Market cap**: $252.8B · FDV $252.8B (no future emission)
- **Volume 24h**: $7.2B across CEX + DEX
- **Macro overlay**: Fear & Greed Index 42 (Fear), 7-day trend
  deteriorating (Alternative.me, cached)

## Tokenomics & Supply
- **Circulating supply**: 120.7M ETH (effectively also max supply post-Merge)
- **Issuance**: dynamic, currently net-deflationary in low-fee weeks and
  slightly inflationary during peak L1 demand
- **Staked ETH**: 34.5M (~29% of supply)
- **Validator effective balance**: lifted to 2,048 ETH post-Pectra
- **Restaked ETH (EigenLayer)**: ~$13B USD notional

## On-Chain Health
- **Network uptime**: post-Pectra mainnet has been stable; client
  diversity remains healthy with Geth no longer supermajority
- **Average L1 gas (30d)**: 6 gwei base fee
- **Average blob fee (30d)**: <0.5 gwei — near floor; blob market is
  not pricing scarcity right now
- **L2 transaction share**: >85% of total Ethereum-aligned user activity
  (Source: https://l2beat.com)

## Network / Protocol Activity
- **Total Value Locked**: $58B across L1 + major L2s
  (Source: https://defillama.com/chain/Ethereum)
- **L2 weekly active addresses**: ~6.5M; Base leading on share, Arbitrum
  and Optimism contesting close behind
- **AA wallet adoption**: ~13% of new wallet installations are now
  smart-account-by-default, up from single digits pre-Pectra
  (Source: https://dune.com/queries/aa-adoption)
- **Active Restaking AVSs**: a growing set of oracles, bridges, and DA
  layers depend on restaked ETH for cryptoeconomic security
  (Source: https://eigenlayer.xyz)

## Social Pulse
**Overall Sentiment: cautiously constructive**

- Builders broadly support the Verkle/stateless-client roadmap, though
  timeline expectations have lengthened
- The "L1 value capture" debate is louder than at any point since the
  Merge — research papers and governance forums are full of proposals,
  and the price drawdown has intensified the discussion
- Restaking pulls divergent reactions: applauded as Ethereum's security
  export, criticized as systemic risk reintroduction
- ETF flow narrative has cooled relative to early-2024 expectations;
  net flows have been muted

_Lexicon-based mention sentiment is indicative only and not used as a
primary signal in this assessment._

## News & Catalysts
- **Pectra active** since 2025 with EIP-7702 (AA at the EOA layer),
  validator effective balance lifted to 2,048 ETH, and improved blob
  throughput. Next hard fork targets Verkle trees and broader stateless
  client work (Source: https://blog.ethereum.org)
- **L2 transaction share** consistently above 85%, led by Base, Arbitrum,
  and Optimism (Source: https://l2beat.com)
- **AA UX wave**: gas sponsorship and session keys are enabling
  consumer-grade flows that were impossible on traditional EOAs
- **RWA on L2s**: lower-fee L2s are quietly capturing tokenized
  money-market funds and short-duration Treasuries
- **Institutional restaking products**: wrappers for restaked ETH are
  in early registration

## Competitive Landscape
- vs. Solana: Ethereum L1+L2 TVL ($58B) ~7× Solana chain TVL; ETH/SOL
  ratio underperforming Q2-2025 expectations
- vs. other L1s: alternative monolithic L1s have not closed the
  TVL gap; sequencer revenue economics keep L2 builders anchored to ETH
- L2 internal competition: Base leads weekly actives; Arbitrum leads
  bridged TVL; Optimism leads governance experimentation

## Risks
- **Restaking systemic risk**: large notional restaked ETH securing
  many AVSs simultaneously creates correlated slashing pathways
- **L2 value capture vs L1**: if blob fees stay near floor and L2
  sequencer revenue continues to dominate, native ETH value accrual
  is structurally weaker than pre-Dencun assumptions
- **Sequencer centralization**: most major L2s still run centralized
  sequencers despite published decentralization roadmaps
- **Verkle execution risk**: client coordination on Verkle is a
  meaningful surface on top of an already large compatibility area

## Confidence Assessment
- **Overall confidence**: 86/100
- **Data quality**: high — L2Beat, DefiLlama, EigenLayer, and CoinGecko
  all canonical sources sampled live
- **Information gaps**: precise AVS-by-AVS restaking breakdown is partial;
  L2 sequencer revenue is reported inconsistently; macro regime could
  shift narrative weight

## Data Freshness

| Source | Endpoint | Sampled | Cache |
| --- | --- | --- | --- |
| coingecko | https://api.coingecko.com/api/v3/coins/ethereum | 2026-05-17T14:20:05Z | live |
| defillama | https://api.llama.fi/v2/chains | 2026-05-17T14:20:05Z | live |
| defillama | https://yields.llama.fi/pools | 2026-05-17T14:20:06Z | live |
| binance | https://api.binance.com/api/v3/ticker/24hr?symbol=ETHUSDT | 2026-05-17T14:20:06Z | live |
| geckoterminal | https://api.geckoterminal.com/api/v2/networks/eth/trending_pools | 2026-05-17T14:20:06Z | live |
| alternativeme | https://api.alternative.me/fng/?limit=7 | 2026-05-17T03:00:00Z | cached |
| reddit | https://www.reddit.com/r/ethfinance/new.json | 2026-05-17T14:15:32Z | live |
| tavily | https://api.tavily.com/search | 2026-05-17T14:20:07Z | live |
`,
};

export const DEMOS: DemoBriefing[] = [SOLANA_DEMO, ETHEREUM_DEMO];
