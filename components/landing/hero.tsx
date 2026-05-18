import Link from "next/link";
import { FlowGraph } from "./flow-graph";

export function Hero() {
  return (
    <section className="relative overflow-hidden hairline-bottom">
      <div className="max-w-[1280px] mx-auto px-8 pt-12 pb-20 lg:pt-20 lg:pb-24">
        {/* Two-column hero */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-20 items-start">
          {/* LEFT — copy */}
          <div className="reveal reveal-2 max-w-[640px]">
            <h1 className="font-display text-[52px] sm:text-[76px] lg:text-[96px] leading-[0.95] tracking-[-0.025em] text-[var(--foreground)]">
              A research <br />
              <span className="italic" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144' }}>
                swarm
              </span>.
            </h1>

            <p className="mt-10 max-w-[480px] text-[16px] leading-relaxed text-[var(--muted)]">
              Five autonomous agents pull live market data and the latest
              news across the open web. Every briefing returns sourced,
              scored, and verifiable. Settled on-chain, per request.
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
                <div className="text-[var(--foreground)] font-display italic" style={{ fontVariationSettings: '"opsz" 9' }}>
                  α → β γ δ → ε
                </div>
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

          {/* RIGHT — animated FlowGraph */}
          <div className="reveal reveal-3 relative aspect-[3/4] w-full max-w-[540px] mx-auto lg:max-w-none">
            <FlowGraph />
          </div>
        </div>
      </div>
    </section>
  );
}
