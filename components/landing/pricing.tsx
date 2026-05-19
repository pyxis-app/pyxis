import Link from "next/link";

export function Pricing() {
  return (
    <section id="pricing" className="relative">
      <div className="max-w-[1080px] mx-auto px-6 lg:px-8 py-20 lg:py-24">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <span className="term-section-tag">// pricing</span>
          <span className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-[0.18em]">
            cover price · 03
          </span>
        </div>
        <h2 className="font-mono text-[26px] lg:text-[32px] tracking-[-0.005em] font-semibold text-[var(--foreground)] lowercase">
          pricing
        </h2>

        {/* Main pricing block */}
        <div className="mt-8 term-block active">
          {/* Block-head */}
          <div className="term-block-head">
            <span>
              <span className="dim">╭─</span> <b>free beta</b>{" "}
              <span className="dim">─────────────</span>
            </span>
            <span className="live-pill">[ active · paid resumes at GA ]</span>
          </div>

          {/* Price treatment */}
          <div className="mt-4 flex flex-wrap items-baseline gap-x-5 gap-y-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">
              [s]
            </span>
            <span
              className="font-mono text-[34px] lg:text-[42px] text-[var(--muted)] line-through tabular-nums"
              style={{
                textDecorationColor: "var(--accent)",
                textDecorationThickness: "2px",
              }}
            >
              $0.10
            </span>
            <span className="font-mono text-[18px] text-[var(--muted)]">→</span>
            <span className="font-mono text-[64px] lg:text-[88px] font-semibold text-[var(--accent)] leading-none tracking-tighter">
              free
            </span>
          </div>
          <p className="mt-4 font-mono text-[14px] text-[var(--muted)]">
            during beta. paid mode resumes at GA.
          </p>

          {/* Metadata sub-block */}
          <div className="term-sub mt-6">
            <div className="term-sub-head">
              <span className="text-[var(--foreground)]">[ specs ]</span>
              <span className="text-[var(--muted)]">x402 · base · usdc</span>
            </div>
            <ul className="mt-2 space-y-1.5 font-mono text-[13px]">
              <li className="flex items-baseline gap-3">
                <span className="text-[var(--accent)]">▸</span>
                <span className="text-[var(--muted)] w-[120px] shrink-0">network</span>
                <span className="text-[var(--foreground)]">base</span>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="text-[var(--accent)]">▸</span>
                <span className="text-[var(--muted)] w-[120px] shrink-0">protocol</span>
                <span className="text-[var(--foreground)]">x402</span>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="text-[var(--accent)]">▸</span>
                <span className="text-[var(--muted)] w-[120px] shrink-0">settlement</span>
                <span className="text-[var(--foreground)] tabular-nums">~6 seconds</span>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="text-[var(--accent)]">▸</span>
                <span className="text-[var(--muted)] w-[120px] shrink-0">subscription</span>
                <span className="text-[var(--foreground)]">none</span>
              </li>
            </ul>
          </div>

          {/* CTA row */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/research" className="term-cta">
              connect wallet
              <span className="text-[16px] leading-none translate-y-[-1px]">›</span>
            </Link>
            <p className="font-mono text-[11px] text-[var(--muted)] max-w-md leading-[1.6]">
              no payment required during beta. bring a wallet to access the workspace; paid mode (x402 on Base) returns at GA.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
