import Link from "next/link";

export function Pricing() {
  return (
    <section id="pricing" className="relative hairline-bottom overflow-hidden">
      {/* Single radial glow far up-left */}
      <div
        className="absolute -top-32 -left-32 w-[600px] h-[600px] celestial-glow rounded-full opacity-60"
        aria-hidden
      />

      <div className="relative max-w-[1280px] mx-auto px-8 py-24 lg:py-40">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-16 items-end">
          {/* LEFT — huge editorial price */}
          <div>
            <div className="eyebrow mb-8">Cover price · §03</div>
            <div className="flex items-start gap-2">
              <span
                className="font-display text-[140px] sm:text-[200px] lg:text-[260px] leading-[0.82] tracking-[-0.045em] text-[var(--foreground)] tabular"
                style={{ fontVariationSettings: '"opsz" 144' }}
              >
                0.25
              </span>
              <span className="font-display text-[42px] sm:text-[60px] lg:text-[80px] leading-none text-[var(--gold)] mt-2">
                $
              </span>
            </div>
            <div className="mt-6 font-display italic text-[28px] lg:text-[36px] text-[var(--muted)]" style={{ fontVariationSettings: '"opsz" 144' }}>
              USDC, per briefing.
            </div>
          </div>

          {/* RIGHT — metadata + CTA */}
          <div className="max-w-xs lg:max-w-sm space-y-8">
            <div className="grid grid-cols-2 gap-x-6 gap-y-5 text-[12px] font-mono">
              <div>
                <div className="eyebrow mb-1">Network</div>
                <div className="text-[var(--foreground)]">Base Sepolia</div>
              </div>
              <div>
                <div className="eyebrow mb-1">Protocol</div>
                <div className="text-[var(--foreground)]">x402</div>
              </div>
              <div>
                <div className="eyebrow mb-1">Settles in</div>
                <div className="text-[var(--foreground)] tabular">~6 sec</div>
              </div>
              <div>
                <div className="eyebrow mb-1">Subscription</div>
                <div className="text-[var(--foreground)]">None</div>
              </div>
            </div>

            <div className="pt-6 hairline-top">
              <Link
                href="/research"
                className="group inline-flex items-baseline gap-3 px-7 py-4 bg-[var(--gold)] text-[var(--background)] font-mono uppercase text-[12px] tracking-[0.22em] hover:bg-[var(--foreground)] transition-colors duration-300"
              >
                Connect wallet
                <span className="font-display text-[18px] leading-none translate-y-[2px] group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>
              <p className="mt-4 text-[11px] text-[var(--muted)] font-mono">
                Mainnet rollout follows Sepolia stabilization. Same price.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
