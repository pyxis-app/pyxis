const POINTS = [
  {
    title: "Source-cited",
    body: "Every finding includes its source URL on record.",
  },
  {
    title: "Multi-angle",
    body: "Three probes for facts, metrics, and sentiment. Never one perspective.",
  },
  {
    title: "Pay only for use",
    body: "x402 native — zero subscriptions, no quota gymnastics.",
  },
];

export function TrustGrid() {
  return (
    <section id="trust" className="max-w-6xl mx-auto px-6 py-32">
      <h2 className="text-2xl font-semibold mb-12 text-center">
        Built for researchers
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {POINTS.map((p) => (
          <div key={p.title} className="glass-card p-6">
            <div className="text-lg font-semibold mb-2">{p.title}</div>
            <p className="text-sm text-[var(--muted)]">{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
