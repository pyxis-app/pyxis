import Link from "next/link";
import { FlowGraph } from "./flow-graph";

const TICKER_ITEMS = [
  "01 · Modular DA layers in 2026",
  "02 · Liquid restaking risks",
  "03 · Solana payments adoption",
  "04 · Bitcoin L2 thesis",
  "05 · MEV redistribution post-PBS",
  "06 · ETH ETF flow analysis",
  "07 · Real-world asset tokenization",
  "08 · Account abstraction adoption",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden hairline-bottom">
      <div className="max-w-[1280px] mx-auto px-8 pt-20 pb-10 lg:pt-32 lg:pb-20">
        {/* Top eyebrow row */}
        <div className="reveal reveal-1 flex items-center justify-between mb-16 lg:mb-24">
          <div className="eyebrow flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]" />
            Volume I &nbsp;·&nbsp; Issue 01 &nbsp;·&nbsp; Live on Base Sepolia
          </div>
          <div className="eyebrow opacity-70 hidden md:block">
            $0.25 USDC / Briefing
          </div>
        </div>

        {/* Two-column hero */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-20 items-center">
          {/* LEFT — copy */}
          <div className="reveal reveal-2 max-w-[640px]">
            <h1 className="font-display text-[56px] sm:text-[80px] lg:text-[104px] leading-[0.95] tracking-[-0.025em] text-[var(--foreground)]">
              Navigate Web3 <br />
              with a research{" "}
              <span className="italic" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144' }}>
                swarm
              </span>.
            </h1>

            <p className="mt-10 max-w-[460px] text-[16px] leading-relaxed text-[var(--muted)]">
              Five autonomous agents decompose your topic, sweep the open web,
              cross-reference live market data, and return a sourced briefing
              — settled on-chain, per request.
            </p>

            <div className="mt-12 flex flex-wrap items-center gap-8">
              <Link
                href="/research"
                className="group inline-flex items-baseline gap-3 px-7 py-4 bg-[var(--foreground)] text-[var(--background)] font-mono uppercase text-[12px] tracking-[0.22em] hover:bg-[var(--gold)] transition-colors duration-300"
              >
                Open the app
                <span className="font-display text-[18px] leading-none translate-y-[2px] group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>
              <a
                href="#briefing"
                className="eyebrow text-[var(--gold-soft)] hover:text-[var(--gold)] editorial-link"
              >
                See a sample briefing ↓
              </a>
            </div>

            {/* Meta footnotes */}
            <div className="mt-16 flex items-start gap-10 text-[11px] font-mono text-[var(--muted)]">
              <div>
                <div className="text-[var(--gold-soft)] uppercase tracking-[0.18em] mb-1.5">
                  Pipeline
                </div>
                <div className="text-[var(--foreground)] tabular">5 agents</div>
              </div>
              <div>
                <div className="text-[var(--gold-soft)] uppercase tracking-[0.18em] mb-1.5">
                  Settlement
                </div>
                <div className="text-[var(--foreground)] tabular">~6 seconds</div>
              </div>
              <div>
                <div className="text-[var(--gold-soft)] uppercase tracking-[0.18em] mb-1.5">
                  Protocol
                </div>
                <div className="text-[var(--foreground)]">x402 · USDC</div>
              </div>
            </div>
          </div>

          {/* RIGHT — constellation */}
          <div className="reveal reveal-3 relative aspect-[3/4] w-full max-w-[540px] mx-auto lg:max-w-none">
            <FlowGraph />
          </div>
        </div>
      </div>

      {/* Marquee at hero bottom */}
      <div className="hairline-top hairline-bottom overflow-hidden">
        <div className="marquee py-4 text-[12px] font-mono uppercase tracking-[0.18em] text-[var(--gold-soft)]">
          {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
            <span key={i} className="px-8 whitespace-nowrap">
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
