# Pyxis — Web3 Intelligence Swarm

A five-agent research pipeline that turns any Web3 topic into a sourced, structured briefing. **Free during beta** — wallet-gated workspace, no paywall.

Integrated with the gitlawb stack at two levels:
- **Runtime:** all LLM inference routes through [gitlawb's Opengateway](https://gitlawb.com/opengateway) (`mimo-v2.5-pro` by default).
- **Infrastructure:** source code auto-mirrors to gitlawb's federated network on every push — UCAN-delegated, DID-addressed at [`gitlawb.com/z6MkpbZk`](https://gitlawb.com/z6MkpbZk).

x402 micropayment code paths (Base mainnet, $0.10 USDC/session) are kept gated behind `NEXT_PUBLIC_X402_FREE_MODE=false` and will resume at GA exit.

Live at **[usepyxis.com](https://www.usepyxis.com)** · Changelog at **[usepyxis.com/changelog](https://www.usepyxis.com/changelog)**

## Stack

Next.js 16 · TypeScript · Tailwind v4 · wagmi v2 + RainbowKit · viem · x402-next + x402-fetch · siwe · postgres · openai SDK pointed at **Opengateway** (gitlawb's OpenAI-compatible gateway, default `mimo-v2.5-pro`) · framer-motion · Lenis · Vitest.

### Data layer

13 free crypto APIs composed via dossier pattern at `lib/data/`:

- **Markets:** CoinGecko, CoinMarketCap (fallback), DexScreener, GeckoTerminal, Binance public, Alternative.me Fear & Greed
- **DeFi:** DefiLlama protocols / yields / stablecoins / chains
- **On-chain:** Etherscan V2 (multi-chain: ETH / Base / Arbitrum / Polygon / Optimism / BSC) and Solscan
- **Social / governance:** GetXAPI Twitter, Reddit JSON, Snapshot GraphQL
- **News / narrative:** cached Tavily

Each source returns `WithFreshness<T> | null` (silent fail, never throws). Per-source TTLs tuned to data nature; `## Data Freshness` table auto-appended to every briefing.

## Local development

```bash
cp .env.example .env
# Required for basic dev:
#   OPENGATEWAY_API_KEY, TAVILY_API_KEY, X402_PAY_TO, SIWE_JWT_SECRET, NEXT_PUBLIC_WALLETCONNECT_ID
# Optional (enable richer briefings; data layer falls back gracefully if unset):
#   CMC_API_KEY, ETHERSCAN_API_KEY, SOLSCAN_API_KEY, GETXAPI_API_KEY, PYXIS_GETXAPI_MAX_CALLS
npm install
npm run dev
# open http://localhost:3000
```

## Tests

```bash
npm test          # one-shot
npm run test:watch
```

## Deploy

Production runs on **Vercel** with **Neon Postgres** for session persistence. Pushes to `main` auto-deploy via Vercel's GitHub integration; pushes also mirror to gitlawb's federated network via [`.github/workflows/mirror-gitlawb.yml`](.github/workflows/mirror-gitlawb.yml).

Required Vercel environment variables:

- `OPENGATEWAY_API_KEY` — LLM inference
- `TAVILY_API_KEY` — news/narrative search
- `DATABASE_URL` — Neon Postgres connection string
- `SIWE_JWT_SECRET` — session cookie signing
- `NEXT_PUBLIC_WALLETCONNECT_ID` — RainbowKit project ID
- `NEXT_PUBLIC_X402_FREE_MODE=true` — beta flag (set to `false` at GA exit)

Optional (enrich briefings, fail silently if unset): `CMC_API_KEY`, `ETHERSCAN_API_KEY`, `SOLSCAN_API_KEY`, `GETXAPI_API_KEY`, `PYXIS_GETXAPI_MAX_CALLS`.

## Network configuration

x402 paywall code defaults to **Base mainnet** at $0.10 USDC per research, but is currently bypassed by `NEXT_PUBLIC_X402_FREE_MODE=true` during beta. To exercise the paid flow against Base Sepolia for local testing without real USDC:

```env
NEXT_PUBLIC_X402_FREE_MODE=false
X402_NETWORK=base-sepolia
X402_USDC_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e
NEXT_PUBLIC_CHAIN=base-sepolia
```

Mainnet remains the default in `lib/env.ts` and `.env.example`.

## Repo layout

```
app/                # Next.js routes (landing + (app) group)
components/         # landing/, app/, shared/
lib/                # llm, probes/, data/{sources,dossiers}, x402, siwe, db, repos, ...
lib/migrations/     # Postgres schema migrations (applied at boot)
public/             # logo, icons, og
docs/               # internal specs (gitignored from public mirror)
.github/workflows/  # gitlawb auto-mirror
```

See [AGENTS.md](./AGENTS.md) for the 5-agent pipeline architecture.

## License

Copyright (C) 2026 Pyxis Authors

Pyxis is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License, version 3, as published by the Free Software Foundation. See [LICENSE](./LICENSE) for the full text.

This program is distributed **without warranty** — see the AGPL for details.

The AGPL's network-use clause (Section 13) is load-bearing here: if you host a modified version of Pyxis as a service accessible to others over a network, you must make the modified source code available to those users.

For commercial licensing inquiries (e.g. proprietary derivative work, alternate terms), contact [admin@usepyxis.com](mailto:admin@usepyxis.com).
