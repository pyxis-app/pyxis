import Link from "next/link";
import { LandingNav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/footer";

type Group = { label: string; items: string[] };
type Release = {
  version: string;
  date: string;
  codename?: string;
  highlight?: string;
  groups: Group[];
};

const RELEASES: Release[] = [
  {
    version: "v3.0.0",
    date: "2026-05-20",
    codename: "terminal redesign",
    highlight:
      "Full visual rebuild + pipeline overhaul. Briefings are now data-rich for every topic type — narratives and comparisons get topic decomposition, protocol/chain paths pull native-token data, and confidence theater is gone in favor of explicit Data Gaps.",
    groups: [
      {
        label: "added",
        items: [
          "v5 hybrid terminal UI across landing, research workspace, history, settings",
          "PYXIS ANSI pixel-shadow wordmark (cyan→deep-blue gradient + breathing glow)",
          "Read Mode toggle for briefings — wide measure, 1.75 line-height, agent sub-blocks collapse (default ON for new users)",
          "Topic decomposition: narrative & comparison topics auto-fan-out into 3–5 concrete sub-asset dossiers (e.g. \"memecoin szn?\" → DOGE/SHIB/PEPE/WIF/BONK)",
          "Animated 5-phase pipeline visualization in /#method — probe-color pulse + per-phase caption",
          "Cycling natural-language prompt placeholder + categorized example chips (// tokens · // chains · // protocols · // narratives)",
          "Scrollable briefing container with custom cyan-gradient scrollbar (kept landing height consistent regardless of briefing length)",
          "Protocol path probe enrichment — token via CoinGecko + DexScreener pairs + Etherscan contract meta + project-filtered yields",
          "Chain path native L1 token lookup (Solana → SOL coin snapshot, Berachain → BERA, etc.)",
          "Lenis smooth scroll for landing momentum + anchor jumps",
          "SSH commit signing — every push to main now arrives with Verified badge",
          "Gitlawb auto-mirror workflow live — push once, mirror to gitlawb decentralized network automatically",
          "Sticky workspace statusline with pyxis://research/<slug> breadcrumb + ⌘K commands + ? help",
        ],
      },
      {
        label: "changed",
        items: [
          "Section markers § (silcrow magazine) → // (code-comment style) across all surfaces",
          "Brand mark in nav/footer/sidebar now uses real logo image (was P› text prefix)",
          "P› gradient text prefix kept only for prompt-style status lines (terminal grammar)",
          "Synthesizer prompt no longer requires a Confidence Assessment section — readers judge from explicit Data Gaps + Data Freshness table + inline citations",
          "Fear & Greed Index fetched once per research run (was 2 duplicate calls — analyst at limit=14, sentinel at limit=7)",
          "Section header copy reflects new transparency: \"freshness timestamps, explicit gap notes — no confidence theater, just data you can verify.\"",
        ],
      },
      {
        label: "removed",
        items: [
          "Numeric confidence scores (0-100) — were LLM-stochastic ±10pt and biased against briefings with more honest data caveats",
          "Fraunces serif editorial typography (magazine-spread aesthetic)",
          "Star-field constellation background animation (replaced with breathing hairline grid)",
          "Dead components: star-field.tsx, flow-graph.tsx, findings-card.tsx, report-drawer.tsx (legacy editorial-era components no longer imported)",
        ],
      },
      {
        label: "fixed",
        items: [
          "SIWE wallet-sign popup state stuck forever at \"awaiting wallet signature…\" — useEffect dependency self-retrigger bug zeroed the cancelled flag before the wallet promise resolved. Replaced with useRef in-flight guard + mountedRef lifecycle. Added skip/retry escape buttons for stuck popups.",
          "402 Payment Required on first research after wallet connect — NEXT_PUBLIC_X402_FREE_MODE env var was unset, defaulting to paid mode without x402 wired",
          "Box-drawing characters (╔╗╚╝═║) rendering broken in PYXIS wordmark — next/font/google subsets to Latin only, stripping U+2500-U+257F glyphs. Switched to raw <link> Google Fonts CSS endpoint (serves multi-range woff2 with box drawing intact)",
          "EtherFi protocol briefing had only 2 $-value mentions despite being a top-3 LRT protocol — protocol path was missing token + DEX pair lookups. Now hits CG /coins/ether-fi + DexScreener ETHFI search + project-filtered yields. Backtest shows 7× more hard data per briefing.",
          "Narrative briefings (memecoin szn?, AI agents, DePIN) returned 0 dollar-values — narrative path only had sector-level aggregates. Decomposition now spawns 3-5 sub-asset dossiers in parallel. Backtest shows 25 sources fired (vs 9 previously) and 11-13 $-values per briefing.",
        ],
      },
    ],
  },
  {
    version: "v2.0.0",
    date: "2026-05-19",
    codename: "gitlawb migration",
    highlight:
      "LLM provider migrated from OpenRouter (gpt-4o-mini) to gitlawb's Opengateway (mimo-v2.5-pro). Repo now mirrored on gitlawb's federated network on every push. Paid mode paused — free during beta. Same five agents over 13 live APIs; cleaner stack underneath.",
    groups: [
      {
        label: "changed",
        items: [
          "LLM provider: OpenRouter (openai/gpt-4o-mini) → gitlawb Opengateway (mimo-v2.5-pro)",
          "Opengateway base URL → https://opengateway.gitlawb.com/v1 (OpenAI-compatible)",
          "Auth flow: API key + UCAN-scoped delegation tied to gitlawb DID did:key:z6MkpbZk… (UCAN renewal 2026-06-18)",
        ],
      },
      {
        label: "added",
        items: [
          "Auto-mirror workflow: every push to GitHub main also mirrors to gitlawb's federated network (DHT peer replication)",
          "NEXT_PUBLIC_X402_FREE_MODE flag — bypasses x402 micropayment paywall during beta (sends X-PAYER-ADDRESS header instead of signed authorization)",
          "Profile presence at gitlawb.com/z6MkpbZk (contributor trust level, peer-mirror visible)",
        ],
      },
      {
        label: "paused",
        items: [
          "x402 micropayment-per-research flow — code paths kept, gated behind NEXT_PUBLIC_X402_FREE_MODE=false. Resume planned at GA exit.",
        ],
      },
      {
        label: "unchanged",
        items: [
          "All 5 agents (Commander → Scout → Analyst → Sentinel → Synthesizer) and all 13 data sources",
          "Briefing markdown shape + freshness table + SIWE wallet auth + research session persistence",
        ],
      },
    ],
  },
  {
    version: "v1.0.0",
    date: "2026-05-19",
    codename: "initial public beta",
    highlight:
      "Pyxis went public on usepyxis.com with editorial-celestial design language. Free beta active. 5-agent pipeline (Commander → Scout → Analyst → Sentinel → Synthesizer) wired up against 13 live data sources. Repo migrated from pyxis-boop/app → pyxis-app/pyxis and flipped public.",
    groups: [
      {
        label: "shipped",
        items: [
          "5-agent research pipeline orchestrated via lib/probes/pipeline.ts (sequential probe execution: Commander emits queries → Scout/Analyst/Sentinel fetch data → Synthesizer merges)",
          "13 live data sources: CoinGecko, CoinMarketCap, DefiLlama, DexScreener, GeckoTerminal, Binance, Etherscan, Solscan, GetXAPI (Twitter), Reddit, Snapshot, Tavily, Fear & Greed Index",
          "x402 micropayment paywall on Base (USDC, settles ~6 seconds, paused during beta)",
          "SIWE (Sign-In With Ethereum) wallet auth + JWT session + Postgres research session persistence",
          "Magazine-spread landing with Fraunces serif typography, star-field constellation animation, magazine-style demo briefings",
          "Brand identity locked: Mariner's Compass constellation theme, cyan-blue logo, @pyxisbase X handle (Blue Verified), AGPL-3.0 license, usepyxis.com domain",
          "Repo migrated pyxis-boop/app → pyxis-app/pyxis (fresh public push, no hackathon-era PR history carried over)",
        ],
      },
    ],
  },
];

export default function ChangelogPage() {
  return (
    <main className="relative term-grid-bg min-h-screen">
      <LandingNav />

      <section className="max-w-[920px] mx-auto px-6 lg:px-8 pt-10 lg:pt-14 pb-16">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3 reveal reveal-1">
          <span className="term-section-tag">// changelog</span>
          <span className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-[0.18em]">
            what changed · by release
          </span>
        </div>
        <h1 className="font-mono text-[26px] lg:text-[32px] tracking-[-0.005em] font-semibold text-[var(--foreground)] lowercase reveal reveal-2">
          changelog
        </h1>
        <p className="mt-3 font-mono text-[14px] text-[var(--muted)] max-w-[64ch] leading-[1.6] reveal reveal-2">
          Every release documented. Code lives at{" "}
          <a
            href="https://github.com/pyxis-app/pyxis"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent)] hover:text-[var(--scout)] underline underline-offset-2"
          >
            github.com/pyxis-app/pyxis
          </a>{" "}
          (AGPL-3.0). Mirrored to{" "}
          <a
            href="https://gitlawb.com/z6MkpbZk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent)] hover:text-[var(--scout)] underline underline-offset-2"
          >
            gitlawb.com/z6MkpbZk
          </a>{" "}
          via auto-mirror workflow on every push.
        </p>

        {/* Releases */}
        <div className="mt-10 space-y-6 reveal reveal-3">
          {RELEASES.map((r, i) => (
            <div key={r.version} className={`term-block ${i === 0 ? "active" : ""}`}>
              {/* Block head */}
              <div className="term-block-head">
                <span>
                  <span className="dim">╭─</span> release · <b>{r.version}</b>
                  {r.codename && (
                    <span className="text-[var(--muted)]">
                      {" "}
                      · {r.codename}
                    </span>
                  )}{" "}
                  <span className="dim">────────</span>
                </span>
                <span className="text-[var(--muted)] font-mono text-[12px]">
                  {r.date}
                </span>
              </div>

              {/* Highlight summary */}
              {r.highlight && (
                <p className="mt-1 mb-4 font-mono text-[13.5px] leading-[1.65] text-[var(--foreground)] opacity-90 max-w-[68ch]">
                  {r.highlight}
                </p>
              )}

              {/* Grouped change lists */}
              {r.groups.map((g) => {
                const colorClass =
                  g.label === "added"
                    ? "scout"
                    : g.label === "changed"
                    ? "analyst"
                    : g.label === "removed"
                    ? "sentinel"
                    : g.label === "fixed"
                    ? ""
                    : "";
                return (
                  <div key={g.label} className={`term-sub ${colorClass}`}>
                    <div className="term-sub-head">
                      <span className={`term-tag ${colorClass}`}>
                        [{g.label}]
                      </span>
                      <span className="text-[var(--muted)]">
                        {g.items.length} {g.items.length === 1 ? "entry" : "entries"}
                      </span>
                    </div>
                    <ul className="mt-2 space-y-2 font-mono text-[13.5px] leading-[1.65]">
                      {g.items.map((item, idx) => (
                        <li
                          key={idx}
                          className="pl-4 relative text-[var(--foreground)] opacity-92"
                        >
                          <span className="absolute left-0 text-[var(--muted)]">
                            ▸
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Outro */}
        <div className="mt-10 font-mono text-[12px] text-[var(--muted)] flex flex-wrap justify-between gap-3 reveal reveal-4">
          <span>
            following{" "}
            <a
              href="https://keepachangelog.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:text-[var(--scout)] underline underline-offset-2"
            >
              keepachangelog.com
            </a>{" "}
            conventions
          </span>
          <Link
            href="/"
            className="text-[var(--accent)] hover:text-[var(--scout)] underline underline-offset-2"
          >
            ← back to landing
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
