const POINTS = [
  {
    n: "01",
    title: "Source-stamped",
    body: "Every metric tagged with the API endpoint and sample timestamp. Cache hits disclosed inline. You see exactly when each number was pulled, never silently stale.",
  },
  {
    n: "02",
    title: "Pre-listing coverage",
    body: "When CoinGecko hasn't listed a token yet, DexScreener picks it up the moment liquidity hits. Day-1 pair data, plus contract verification on Ethereum, Base, Arbitrum, and Solana.",
  },
  {
    n: "03",
    title: "Honest gaps",
    body: "When an API can't be reached, you see it listed. Numbers are never fabricated; missing data lowers the confidence score, not the briefing's integrity.",
  },
];

export function TrustGrid() {
  return (
    <section className="hairline-bottom">
      <div className="max-w-[1280px] mx-auto px-8 py-24 lg:py-32">
        <div className="mb-16 max-w-2xl">
          <div className="eyebrow mb-5">Principles · §04</div>
          <h2 className="font-display text-[44px] sm:text-[60px] lg:text-[72px] leading-[1.02] tracking-[-0.02em]">
            Built for researchers who{" "}
            <span className="italic" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144' }}>
              read past the headline
            </span>.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 hairline-top">
          {POINTS.map((p, i) => (
            <div
              key={p.n}
              className={`py-12 px-2 md:px-8 ${i < POINTS.length - 1 ? "md:border-r border-[var(--hair)]" : ""} ${i > 0 ? "border-t md:border-t-0 border-[var(--hair)]" : ""}`}
            >
              <div className="font-mono text-[11px] tracking-[0.22em] text-[var(--gold-soft)] mb-4">
                № {p.n}
              </div>
              <h3 className="font-display text-[30px] leading-tight mb-4">{p.title}</h3>
              <p className="text-[14px] leading-relaxed text-[var(--muted)] max-w-xs">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
