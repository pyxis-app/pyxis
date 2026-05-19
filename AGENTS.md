# Pyxis Agents

A research run is **5 LLM calls** orchestrated sequentially by [`lib/probes/pipeline.ts`](lib/probes/pipeline.ts). Each role is a different OpenRouter `gpt-4o-mini` prompt.

## Pipeline

```
Commander → Scout → Analyst → Sentinel → Synthesizer
```

| Role | What it does | Data it consumes |
|---|---|---|
| **Commander** | Decomposes the user topic into 3 probe-specific queries and classifies the topic. Emits strict JSON: `{ scout, analyst, sentinel, topicType, chainHint, temporalMode, hints }`. `hints` carries `symbol`, `binanceSymbol`, `geckoNetwork`, `defillamaSlug`, `contractAddress`, `twitterHandle`, `subreddit`, `snapshotSpace`. | Topic string only |
| **Scout** | Information & narrative — news, announcements, contract verification flags. | `scout-dossier` (cached Tavily + Etherscan contract meta + CoinGecko trending) |
| **Analyst** | Quantitative readout — price, TVL, liquidity, supply, yields, holder concentration. **No Tavily.** Pure structured data. | `analyst-dossier` (CG / CMC / DefiLlama / DexScreener / GeckoTerminal / Binance / F&G / Etherscan / Solscan, routed per `topicType`) |
| **Sentinel** | Social pulse & sentiment. Twitter analytics, Reddit, governance, macro overlay. | `sentinel-dossier` (F&G + GetXAPI + Reddit JSON + Snapshot GraphQL + cached Tavily) |
| **Synthesizer** | Merges three probe findings into a briefing with **adaptive sections** (manifest varies per `topicType` — token / chain / protocol / narrative). Auto-appends `## Data Freshness` table. | Three `ProbeFinding`s + `topicType` + collected `FreshnessMeta[]` |

## Data dossier pattern

Probes do **not** call APIs directly. Each probe has a dossier composer at [`lib/data/dossiers/`](lib/data/dossiers/) that fans out to source modules at [`lib/data/sources/`](lib/data/sources/) via `Promise.allSettled` with per-source timeout (3–4 s).

- Sources return `WithFreshness<T> | null` — they never throw, silent on rate-limit / 4xx-5xx / network errors.
- The dossier renders a structured markdown block with `[live]` or `[cached]` markers per source, plus a `_Sources unavailable: ..._` line when any source returned null.
- All `FreshnessMeta` (source name, sampledAt ISO, endpoint URL, cached flag) propagates end-to-end to the briefing footer.

## Caching

SQLite-backed `api_cache` table with per-source TTLs (60s for prices, 5min for TVL, 1h for yields, 30d for verified contract code, etc.). See [`lib/data/cache.ts`](lib/data/cache.ts) and [`lib/migrations/002_api_cache.sql`](lib/migrations/002_api_cache.sql).

## GetXAPI budget

`PYXIS_GETXAPI_MAX_CALLS=5` env var hard-caps Twitter API spend per Sentinel run ($0.005 max at $0.001/call). Sentinel falls back to Tavily + Reddit + F&G if `GETXAPI_API_KEY` is unset.

## Sentiment scoring

**Lexicon-based in code, not LLM.** Positive/negative word + emoji sets in [`lib/data/sources/getxapi.ts`](lib/data/sources/getxapi.ts). LLM Sentinel *interprets* the breakdown but never quotes raw percentages without disclaiming the methodology.

## Terminology

- **Internal code, file paths, types, logs:** "probes" (Commander/Scout/Analyst/Sentinel/Synthesizer fit the Pyxis constellation metaphor).
- **User-facing copy:** "agents".

Don't rename internals to "agents". Don't surface "probes" in UI copy.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
