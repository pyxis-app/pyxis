/**
 * Ambient star field behind the entire landing page.
 *
 * 140 stars on a deterministic seeded layout (so SSR === CSR — no hydration
 * mismatch), staggered twinkle delays, three magnitude tiers (most dim, some
 * bright cream, a few warm gold). Fixed full-viewport with a slow page-wide
 * drift so it never feels truly static. Purely decorative; pointer-events
 * disabled and aria-hidden.
 */

type Star = {
  x: number;          // 0-100 (percent of viewport)
  y: number;          // 0-100
  size: number;       // pixel diameter
  delay: number;      // seconds
  duration: number;   // seconds
  tier: "dim" | "bright" | "gold";
};

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function buildStars(count: number): Star[] {
  const rand = seeded(1729);
  const out: Star[] = [];
  for (let i = 0; i < count; i++) {
    const roll = rand();
    const tier: Star["tier"] = roll < 0.78 ? "dim" : roll < 0.95 ? "bright" : "gold";
    const size =
      tier === "dim" ? 1 + rand() * 1.4 :
      tier === "bright" ? 2 + rand() * 1.6 :
      2.5 + rand() * 2;
    out.push({
      x: rand() * 100,
      y: rand() * 100,
      size,
      delay: rand() * 8,
      duration: 4 + rand() * 5,
      tier,
    });
  }
  return out;
}

const STARS = buildStars(140);

export function StarField() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
    >
      {/* Base background + soft ambient gradients */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(91, 143, 255, 0.06) 0%, transparent 60%), radial-gradient(ellipse 70% 50% at 80% 85%, rgba(45, 82, 196, 0.05) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 15% 70%, rgba(167, 139, 250, 0.025) 0%, transparent 70%), var(--background)",
        }}
      />

      {/* Star field — drifts subtly over 40s */}
      <div className="absolute inset-0" style={{ animation: "drift 40s ease-in-out infinite" }}>
        {STARS.map((s, i) => (
          <span
            key={i}
            className={`star-dot star-${s.tier}`}
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
