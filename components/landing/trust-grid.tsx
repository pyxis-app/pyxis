const POINTS = [
  {
    n: "01",
    tag: "transparency",
    title: "source-stamped",
    body: "Every metric tagged with the API endpoint and sample timestamp. Cache hits disclosed inline. You see exactly when each number was pulled, never silently stale.",
  },
  {
    n: "02",
    tag: "coverage",
    title: "pre-listing coverage",
    body: "When CoinGecko hasn't listed a token yet, DexScreener picks it up the moment liquidity hits. Day-1 pair data, contract verification on EVM chains (Ethereum, Base, Arbitrum, Polygon), and on-chain metadata + holder distribution on Solana.",
  },
  {
    n: "03",
    tag: "integrity",
    title: "honest gaps",
    body: "When an API can't be reached, you see it listed in the Data Freshness table. Numbers are never fabricated; gaps are explicitly called out so you know exactly what's missing.",
  },
];

export function TrustGrid() {
  return (
    <section className="relative">
      <div className="max-w-[1080px] mx-auto px-6 lg:px-8 py-20 lg:py-24">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <span className="term-section-tag">// principles</span>
          <span className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-[0.18em]">
            principles · 04
          </span>
        </div>
        <h2 className="font-mono text-[26px] lg:text-[32px] tracking-[-0.005em] font-semibold text-[var(--foreground)] lowercase max-w-[40ch]">
          built for researchers who read past the headline
        </h2>

        {/* Main block */}
        <div className="mt-8 term-block">
          <div className="term-block-head">
            <span>
              <span className="dim">╭─</span> <b>principles</b>{" "}
              <span className="dim">────────────</span>
            </span>
            <span className="live-pill">[ three commitments ]</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
            {POINTS.map((p) => (
              <div key={p.n} className="term-sub">
                <div className="term-sub-head">
                  <span className="text-[var(--muted)]">№ {p.n}</span>
                  <span className="text-[var(--accent)] uppercase tracking-[0.22em] text-[10px]">
                    [{p.tag}]
                  </span>
                </div>
                <h3 className="font-mono text-[18px] font-semibold text-[var(--foreground)] mt-1 mb-2">
                  {p.title}
                </h3>
                <p className="font-mono text-[14px] leading-[1.7] text-[var(--muted)]">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
