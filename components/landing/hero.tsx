"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Categorized examples grouped by Pyxis topicType: token | chain | protocol | narrative.
// Each row maps a topic-type label to 3 sample queries that produce that classification.
const EXAMPLE_GROUPS: { label: string; queries: string[] }[] = [
  {
    label: "tokens",
    queries: ["$HYPE", "is $ENA sustainable?", "$VIRTUAL outlook"],
  },
  {
    label: "chains",
    queries: ["Monad mainnet pulse", "Hyperliquid L1 status", "BTC L2s 2026"],
  },
  {
    label: "protocols",
    queries: ["Pendle yield wars", "Polymarket post-election", "Morpho vs Aave v4"],
  },
  {
    label: "narratives",
    queries: ["AI agents narrative", "LRT consolidation", "DePIN tokens 2026"],
  },
];

// Cycling placeholder — richer than just token tickers
const PLACEHOLDER_CYCLE = [
  "is $ENA sustainable?",
  "Monad mainnet pulse",
  "AI agents narrative",
  "Pendle yield wars",
  "$HYPE",
  "Polymarket post-election",
  "LRT consolidation",
  "BTC L2s 2026",
];

export function Hero() {
  const [phIdx, setPhIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setPhIdx((i) => (i + 1) % PLACEHOLDER_CYCLE.length),
      3000,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative">
      <div className="max-w-[920px] mx-auto px-6 lg:px-8 pt-10 lg:pt-14 pb-20 lg:pb-24">
        {/* Section tag */}
        <div className="mb-6 flex items-center gap-3 reveal reveal-1">
          <span className="term-section-tag">// landing</span>
          <span className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-[0.18em]">
            web3 intelligence swarm
          </span>
        </div>

        {/* PYXIS ANSI block-shadow wordmark — JetBrains Mono 700 via
            raw <link> in layout.tsx (next/font subset strips box-drawing) */}
        <div className="term-pyxis-mark-wrap reveal reveal-2 text-center">
          <pre className="term-pyxis-mark" aria-label="PYXIS">
{`██████╗  ██╗   ██╗ ██╗  ██╗ ██╗ ███████╗
██╔══██╗ ╚██╗ ██╔╝ ╚██╗██╔╝ ██║ ██╔════╝
██████╔╝  ╚████╔╝   ╚███╔╝  ██║ ███████╗
██╔═══╝    ╚██╔╝    ██╔██╗  ██║ ╚════██║
██║        ██║     ██╔╝ ██╗ ██║ ███████║
╚═╝        ╚═╝     ╚═╝  ╚═╝ ╚═╝ ╚══════╝`}
          </pre>
        </div>

        {/* Tagline */}
        <h1 className="mt-4 font-mono text-[22px] sm:text-[26px] lg:text-[28px] leading-[1.2] tracking-[-0.005em] text-[var(--foreground)] text-center reveal reveal-3">
          <span className="term-p-prefix">P›</span>
          the research terminal for crypto
        </h1>

        {/* Sub */}
        <p className="mt-5 font-mono text-[14px] text-[var(--muted)] text-center max-w-[58ch] mx-auto leading-[1.6] reveal reveal-3">
          five agents · one prompt · zero tabs open.{" "}
          <span className="text-[var(--foreground)] opacity-80">
            every number stamped with its source and freshness.
          </span>
        </p>

        {/* Prompt input — pinned-feel CTA block */}
        <div className="mt-10 term-block active flex items-center gap-3 px-4 sm:px-5 py-3 reveal reveal-4">
          <span className="term-p-prefix text-[18px] leading-none shrink-0">P›</span>
          <div className="font-mono text-[14px] sm:text-[15px] text-[var(--muted)] flex-1 min-w-0 truncate">
            research{" "}
            <span className="text-[var(--foreground)] opacity-60">
              {PLACEHOLDER_CYCLE[phIdx]}
            </span>
            <span className="term-cursor" />
          </div>
          <Link href="/research" className="term-cta shrink-0">
            start
            <span className="text-[16px] leading-none translate-y-[-1px]">›</span>
          </Link>
        </div>

        {/* Categorized example list — `man pyxis` feel */}
        <div className="mt-6 term-block reveal reveal-4">
          <div className="term-block-head">
            <span>
              <span className="dim">╭─</span> what can pyxis answer? <span className="dim">─────────</span>
            </span>
            <span className="text-[var(--muted)]">[ click any to start ]</span>
          </div>
          <div className="mt-3 space-y-2.5">
            {EXAMPLE_GROUPS.map((group) => (
              <div
                key={group.label}
                className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--muted)] sm:w-[96px] shrink-0 pt-1">
                  // {group.label}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {group.queries.map((q) => (
                    <Link
                      key={q}
                      href={`/research?topic=${encodeURIComponent(q)}`}
                      className="term-chip"
                    >
                      {q}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hint line */}
        <p className="mt-5 text-center font-mono text-[11px] text-[var(--muted)] reveal reveal-4">
          5 runs/day on free beta · no card required · wallet optional · pyxis figures out the right agents
        </p>

        {/* Meta footnotes — port from original hero */}
        <div className="mt-14 lg:mt-16 grid grid-cols-3 gap-6 font-mono text-[11px] reveal reveal-5">
          <MetaCell label="Pipeline" value="α → β γ δ → ε" />
          <MetaCell label="Settlement" value="~6 seconds" mono />
          <MetaCell label="Protocol" value="x402 · USDC" />
        </div>
      </div>
    </section>
  );
}

function MetaCell({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--muted)] mb-1.5">
        {label}
      </div>
      <div
        className={`text-[var(--foreground)] ${mono ? "tabular-nums" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}
