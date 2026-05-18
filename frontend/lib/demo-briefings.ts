/**
 * Static demo briefings rendered on the landing page (`/`).
 *
 * These are plausibility-shaped mocks — structurally identical to real Pyxis
 * output, with realistic 2026-era context. They are NOT live data and should
 * never be presented as such. Regenerate from a real research session against
 * the production pipeline before going to mainnet (see spec § 14, success
 * criteria item 1).
 */

export interface DemoBriefing {
  id: string;
  topic: string;
  briefing: string; // full markdown, matches Synthesizer output shape
  confidence: number; // 0-100
  sources: number; // total cited URLs
  createdAt: string; // ISO 8601
  partial: boolean; // true if any probe failed in the original run
}

export const SOLANA_DEMO: DemoBriefing = {
  id: "demo-solana",
  topic: "Solana ecosystem state",
  confidence: 87,
  sources: 11,
  createdAt: "2026-05-15T09:42:18Z",
  partial: false,
  briefing: `## Executive Summary

Solana enters mid-2026 with the FireDancer validator client running on
roughly a third of mainnet stake, liquid staking concentrated in Jito,
and DeFi TVL holding near $12B after a Q1 drawdown. Network performance
has improved materially since the 2024 outage era — block production
latency is stable and the network has gone over fourteen months without
a halt. Regulatory clarity in the United States has unblocked
institutional staking products, contributing to renewed validator
diversification. Validator decentralization and MEV concentration remain
the most-discussed risks.

## Key Findings

### Information (Scout)
- **FireDancer rolled out on mainnet** in late 2025 and now serves a
  meaningful share of stake, materially reducing software-monoculture
  risk on the validator set (Source: https://jumpcrypto.com/firedancer-status)
- **Solana Pay merchant integrations expanded** to a major payments
  processor in Q1 2026, bringing on-chain settlement to point-of-sale
  rails in the US and Brazil (Source: https://solanapay.com/case-studies)
- **Saga 2 sold out at launch** but device-attached crypto revenue
  remains a sub-1% contributor to the broader ecosystem
  (Source: https://solanamobile.com/saga)

### Data & Metrics (Analyst)
- **SOL price**: $214.30 | Trend: stable | 30d change: +4.2%
  (Source: https://www.coingecko.com/en/coins/solana)
- **Market cap**: $103B (Source: CoinGecko)
- **Total Value Locked**: $12.1B across 142 protocols
  (Source: https://defillama.com/chain/Solana)
- **Liquid staking dominance**: Jito ~58% of staked SOL,
  Marinade ~22%, MarginFi/Solayer remaining 20%
- **Daily active addresses**: ~1.1M (60d average)
- **Validator count**: 1,847 — slight increase QoQ but
  Nakamoto coefficient still ~22

### Community Sentiment (Sentinel)
**Overall Sentiment: positive**

- Developer activity up 38% YoY based on commit and new-program data
- Bullish takes center on FireDancer reliability and Solana Pay
  merchant adoption
- Concerns persist around validator hardware requirements pricing
  out smaller operators
- MEV concentration through Jito's auction continues to be a
  controversial topic in core developer channels

## Risk Assessment
- **Validator centralization**: Nakamoto coefficient ~22 leaves
  the network vulnerable to coordinated halts; smaller validators
  cite operating cost as the primary barrier
- **MEV capture concentration**: a single auction provider
  intermediates a majority of MEV revenue, creating systemic
  dependency risk
- **Liquid staking concentration**: Jito's >50% share of liquid
  staked SOL is itself a centralization concern, separate from
  validator-level decentralization
- **Regulatory tail risk**: SEC posture toward LSTs as securities
  remains unresolved, though the current administration is
  perceived as friendlier than the prior one

## Opportunities
- **Payments-rail integration**: on-chain settlement for point-of-sale
  is a category Solana is uniquely positioned to win on cost and
  finality
- **Institutional staking products**: regulatory clarity has unlocked
  ETP-wrapped staking products that may absorb significant inflows
- **RWA tokenization on Solana**: a handful of T-bill and money-market
  products have crossed $500M each, suggesting product-market fit
  for high-throughput RWA settlement

## Confidence Assessment
- **Overall confidence**: 87/100
- **Data quality**: high (price and TVL from canonical APIs;
  ecosystem activity from on-chain sources)
- **Information gaps**: precise MEV revenue split is partially
  obscured; some validator metrics are 30 days old
`,
};

export const ETHEREUM_DEMO: DemoBriefing = {
  id: "demo-ethereum",
  topic: "Ethereum and L2 ecosystem",
  confidence: 91,
  sources: 13,
  createdAt: "2026-05-16T14:20:05Z",
  partial: false,
  briefing: `## Executive Summary

Ethereum sits in mid-2026 with the Pectra upgrade fully active, Verkle
trees on the testing path for the next hard fork, and L2 throughput
dominating the user-facing transaction landscape. Restaking through
EigenLayer and its derivatives represents a significant share of
staked ETH. Blob fees remain near zero by historical standards,
pushing the long-running L1-versus-L2 value capture debate to the
front of governance discussion. Institutional ETF flows have been
steady but unspectacular; the more interesting flow is into ETH-native
restaking and AVSs.

## Key Findings

### Information (Scout)
- **Pectra upgrade** activated in early 2025 with EIP-7702 account
  abstraction, lifted validator effective balance cap to 2,048 ETH,
  and improved blob throughput; next major hard fork targets Verkle
  trees and broader stateless client work
  (Source: https://blog.ethereum.org/pectra-recap)
- **L2 transaction share crossed 90%** of total Ethereum activity
  measured in user transactions per second, led by Base, Arbitrum,
  and Optimism (Source: https://l2beat.com)
- **Account abstraction adoption** reached ~17% of new wallet
  installations across major wallet providers
  (Source: https://walletbeach.com/aa-tracker)
- **Restaking AVSs in production**: oracles, bridges, and several
  data-availability layers depend on restaked ETH for cryptoeconomic
  security (Source: https://eigenlayer.xyz/dashboard)

### Data & Metrics (Analyst)
- **ETH price**: $5,830 | Trend: stable | 30d change: +1.1%
  (Source: https://www.coingecko.com/en/coins/ethereum)
- **Market cap**: $702B
- **Total Value Locked**: $94B across L1 + major L2s
  (Source: https://defillama.com/chain/Ethereum)
- **Staked ETH**: 41.2M ETH (~33% of supply)
- **Restaked ETH (EigenLayer)**: ~22B USD notional
- **Average L1 gas (base fee, 30d)**: 8.4 gwei
- **Average blob fee (30d)**: <0.001 gwei — effectively floor
- **L2 weekly active addresses**: 7.2M (Base leads, ~38% share)

### Community Sentiment (Sentinel)
**Overall Sentiment: cautiously positive**

- Builders broadly support the Verkle/stateless-client roadmap
  but timeline expectations are conservative
- The "L1 value capture" debate is louder than it has been at
  any point since the Merge — both research papers and governance
  forums are full of proposals
- Restaking pulls divergent reactions: applauded as Ethereum's
  security export, criticized as systemic risk reintroduction
- ETF flow narrative has cooled relative to 2024 expectations

## Risk Assessment
- **Restaking systemic risk**: large notional restaked ETH securing
  many AVSs simultaneously creates correlated slashing pathways
- **L2 value capture vs L1**: if blob fees stay near floor and L2
  sequencer revenue continues to dominate, native ETH value accrual
  is structurally weaker than pre-Dencun assumptions
- **Sequencer centralization**: most major L2s still run
  centralized sequencers despite published decentralization roadmaps
- **MEV redistribution open questions**: PBS rollout is uneven;
  builder concentration risk persists
- **Verkle trees execution risk**: a complex upgrade requiring
  client coordination on top of an already large compatibility surface

## Opportunities
- **Account abstraction UX wave**: gas sponsorship and session keys
  are enabling consumer-grade product flows that were impossible
  on traditional EOAs
- **AVS ecosystem buildout**: every infrastructure category
  (oracles, bridges, DA, coprocessors) now has a credible
  ETH-secured alternative
- **Institutional restaking products**: ETF wrappers for restaked
  ETH are in early registration and could absorb meaningful flow
- **RWA on L2s**: lower-fee L2s are quietly capturing tokenized
  money-market funds and short-duration Treasuries

## Confidence Assessment
- **Overall confidence**: 91/100
- **Data quality**: high (L2Beat, DefiLlama, EigenLayer, and
  CoinGecko all canonical sources with current data)
- **Information gaps**: precise breakdown of AVS-by-AVS restaking
  is partial; L2 sequencer revenue is reported inconsistently
`,
};

export const DEMOS: DemoBriefing[] = [SOLANA_DEMO, ETHEREUM_DEMO];
