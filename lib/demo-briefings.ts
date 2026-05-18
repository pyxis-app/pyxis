/**
 * Static demo briefings rendered on the landing page (`/`).
 *
 * Dated 17 May 2026 — the day before the site's notional "today". Numbers
 * are realistic mid-2026 projections (growth from late-2024 baselines)
 * rather than aspirational fiction. Regenerate from a real research
 * session against the production pipeline before going live.
 */

export interface DemoBriefing {
  id: string;
  topic: string;
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

Solana enters mid-2026 in an extended risk-off cycle — SOL is trading near
$84 after a multi-quarter drawdown that's also weighed on DeFi TVL,
holding near $8B. Underneath the price action, structural progress is
intact: FireDancer is running on a meaningful share of mainnet stake,
network uptime is stable, and on-chain activity (daily active addresses,
developer commits) has held through the cycle. Liquid staking remains
concentrated in Jito; validator decentralization and MEV concentration
are the most-discussed structural risks.

## Key Findings

### Information (Scout)
- **FireDancer in production**, running on a meaningful share of mainnet
  stake. Jump's rollout has materially reduced software-monoculture risk
  on the validator set (Source: https://jumpcrypto.com/firedancer)
- **Solana Pay** merchant integrations continue through major payment
  processors and Shopify; on-chain settlement at point-of-sale is now a
  measurable share of crypto-native commerce
  (Source: https://solanapay.com)
- **Seeker (Saga 2)** shipped to pre-orders in 2024–2025; device-attached
  crypto remains a sub-1% contributor to the broader ecosystem but
  builder mindshare is steady (Source: https://solanamobile.com/seeker)

### Data & Metrics (Analyst)
- **SOL price**: $84.26 | Trend: down | 24h change: −2.6% | 30d: −2.9%
  (Source: https://www.coingecko.com/en/coins/solana)
- **Market cap**: $48.7B (Source: CoinGecko)
- **Total Value Locked**: $8.1B across 130+ protocols
  (Source: https://defillama.com/chain/Solana)
- **Circulating supply**: 578M SOL (fully diluted valuation $52.8B)
- **Liquid staking dominance**: Jito ~55% of staked SOL,
  Marinade ~21%, Sanctum and others rounding out the remainder
- **Daily active addresses**: ~1.0M (60d average) — stable through drawdown
- **Validator count**: 1,452 — Nakamoto coefficient ~21

### Community Sentiment (Sentinel)
**Overall Sentiment: cautiously constructive**

- Developer activity remains elevated despite price drawdown — commit
  volume and new program deployments continue at healthy weekly pace
- Bullish structural takes center on FireDancer reliability and the
  Solana Pay merchant pipeline
- Bearish takes center on broader macro and the SOL/ETH ratio
  underperforming Q2-2025 expectations
- MEV concentration via Jito's auction continues to be a controversial
  topic in core developer channels

## Risk Assessment
- **Validator centralization**: Nakamoto coefficient ~22 leaves
  the network vulnerable to coordinated halts; smaller validators
  cite operating cost as the primary barrier
- **MEV capture concentration**: a single auction provider intermediates
  a majority of MEV revenue, creating systemic dependency risk
- **Liquid staking concentration**: Jito's >50% share of liquid
  staked SOL is itself a centralization concern, separate from
  validator-level decentralization
- **Regulatory tail risk**: the SEC's posture toward LSTs and staking
  products remains administration-sensitive even with recent clarity

## Opportunities
- **Payments-rail integration**: on-chain settlement for point-of-sale
  is a category Solana is well positioned to win on cost and finality
- **Institutional staking products**: regulatory clarity has unlocked
  ETP-wrapped staking products that may absorb significant inflows
- **RWA tokenization**: tokenized money-market and T-bill products on
  Solana have crossed multi-hundred-million-dollar thresholds,
  suggesting product-market fit for high-throughput RWA settlement

## Confidence Assessment
- **Overall confidence**: 84/100
- **Data quality**: high (price and TVL from canonical APIs;
  ecosystem activity from on-chain sources)
- **Information gaps**: precise MEV revenue split is partially
  obscured; some validator metrics are 30 days old; macro
  context could shift narrative weight
`,
};

export const ETHEREUM_DEMO: DemoBriefing = {
  id: "demo-ethereum",
  topic: "Ethereum and L2 ecosystem",
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

## Key Findings

### Information (Scout)
- **Pectra active** since 2025 with EIP-7702 (account abstraction at the
  EOA layer), validator effective balance lifted to 2,048 ETH, and
  improved blob throughput. Next hard fork targets Verkle trees and
  broader stateless client work (Source: https://blog.ethereum.org)
- **L2 transaction share** is well above 85% of total Ethereum user
  activity, led by Base, Arbitrum, and Optimism
  (Source: https://l2beat.com)
- **Account abstraction adoption** reached ~13% of new wallet
  installations across major wallet providers, up from single digits
  pre-Pectra (Source: https://dune.com/queries/aa-adoption)
- **Restaking AVSs in production**: a growing set of oracles, bridges,
  and DA layers depend on restaked ETH for cryptoeconomic security
  (Source: https://eigenlayer.xyz)

### Data & Metrics (Analyst)
- **ETH price**: $2,096.69 | Trend: down | 24h: −4.0% | 30d: −11.3%
  (Source: https://www.coingecko.com/en/coins/ethereum)
- **Market cap**: $252.8B
- **Total Value Locked**: $58B across L1 + major L2s
  (Source: https://defillama.com/chain/Ethereum)
- **Circulating supply**: 120.7M ETH
- **Staked ETH**: 34.5M ETH (~29% of supply)
- **Restaked ETH (EigenLayer)**: ~$13B USD notional
- **Average L1 gas (base fee, 30d)**: 6 gwei
- **Average blob fee (30d)**: <0.5 gwei — near floor
- **L2 weekly active addresses**: ~6.5M, Base leading on share

### Community Sentiment (Sentinel)
**Overall Sentiment: cautiously constructive**

- Builders broadly support the Verkle/stateless-client roadmap, though
  timeline expectations have lengthened
- The "L1 value capture" debate is louder than at any point since the
  Merge — research papers and governance forums are full of proposals,
  and the price drawdown has intensified the discussion
- Restaking pulls divergent reactions: applauded as Ethereum's security
  export, criticized as systemic risk reintroduction
- ETF flow narrative has cooled relative to early-2024 expectations,
  net flows have been muted

## Risk Assessment
- **Restaking systemic risk**: large notional restaked ETH securing
  many AVSs simultaneously creates correlated slashing pathways
- **L2 value capture vs L1**: if blob fees stay near floor and L2
  sequencer revenue continues to dominate, native ETH value accrual
  is structurally weaker than pre-Dencun assumptions
- **Sequencer centralization**: most major L2s still run centralized
  sequencers despite published decentralization roadmaps
- **Verkle execution risk**: client coordination on Verkle is a
  meaningful surface on top of an already large compatibility area

## Opportunities
- **Account abstraction UX wave**: gas sponsorship and session keys
  are enabling consumer-grade product flows that were impossible on
  traditional EOAs
- **AVS ecosystem buildout**: every infrastructure category — oracles,
  bridges, DA, coprocessors — now has a credible ETH-secured alternative
- **Institutional restaking products**: wrappers for restaked ETH are
  in early registration and could absorb meaningful flow
- **RWA on L2s**: lower-fee L2s are quietly capturing tokenized
  money-market funds and short-duration Treasuries

## Confidence Assessment
- **Overall confidence**: 86/100
- **Data quality**: high (L2Beat, DefiLlama, EigenLayer, and
  CoinGecko all canonical sources with current data)
- **Information gaps**: precise AVS-by-AVS restaking breakdown
  is partial; L2 sequencer revenue is reported inconsistently;
  macro regime could shift narrative weight
`,
};

export const DEMOS: DemoBriefing[] = [SOLANA_DEMO, ETHEREUM_DEMO];
