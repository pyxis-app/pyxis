const POINTS = [
  {
    n: "01",
    title: "Source-cited",
    body: "Every finding includes the URL it came from. No black-box claims; you can audit the trail in seconds.",
  },
  {
    n: "02",
    title: "Multi-angle",
    body: "Three specialist probes for facts, metrics, and sentiment. The Synthesizer cross-references them before writing a word.",
  },
  {
    n: "03",
    title: "Pay per use",
    body: "x402 native. No subscriptions, no quotas, no signups. One payment per research, settled on-chain.",
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
