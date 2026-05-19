# Pyxis — Web3 Intelligence Swarm

A five-agent research pipeline that turns any Web3 topic into a sourced, structured briefing. Pay $0.10 USDC per session via the x402 protocol on Base mainnet (early adopter pricing).

## Stack

Next.js 16 · TypeScript · Tailwind v4 · wagmi v2 + RainbowKit · viem · x402-next + x402-fetch · siwe · better-sqlite3 · openai SDK pointed at OpenRouter (`openai/gpt-4o-mini`, locked) · framer-motion · Lenis · Vitest · Docker.

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
#   OPENROUTER_API_KEY, TAVILY_API_KEY, X402_PAY_TO, SIWE_JWT_SECRET, NEXT_PUBLIC_WALLETCONNECT_ID
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

Build runs on GitHub Actions, image pushed to GHCR, VPS pulls via Docker Compose. Required GitHub secrets:

- `VPS_HOST`
- `VPS_USER`
- `VPS_SSH_KEY`

On the VPS:
```bash
cd /opt/pyxis
cp .env.example .env  # fill in
docker compose up -d
```

### Backup smoke test

After at least one `docker compose up -d`, wait until 03:00 UTC or manually trigger:

```bash
docker compose exec backup sh -c "sqlite3 /data/probe.db '.backup /backups/probe-$(date +%Y%m%d).db' && ls /backups/"
```

Expected: a `probe-YYYYMMDD.db` file appears in `./backups/` on the host. The cron schedule keeps seven days of snapshots and deletes anything older.

## Network configuration

The pipeline is **on Base mainnet** at launch with $0.10 USDC per research as the early-adopter price. To run against Base Sepolia for local testing without spending real USDC, flip these env vars:

```env
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
public/             # logo, icons, og
data/               # SQLite (Docker volume)
backups/            # nightly snapshots (Docker volume)
```

See [AGENTS.md](./AGENTS.md) for the 5-agent pipeline architecture.

## License

MIT.
