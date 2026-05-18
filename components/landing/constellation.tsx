"use client";

/**
 * The Pyxis constellation rendered as a functional map of the agent swarm.
 *
 * Five named stars correspond to the five agents (Commander, Scout, Analyst,
 * Sentinel, Synthesizer); a field of dim companion stars completes the night
 * sky. Lines connect the named stars in the order data flows through the
 * pipeline. Twinkle is on a 6-second loop, staggered to avoid synchrony.
 */

type Star = {
  x: number;
  y: number;
  r: number;
  delay: number;
  label?: string;
};

const NAMED: Star[] = [
  { x: 50, y: 18,  r: 2.4, delay: 0.0, label: "α  Commander"   },
  { x: 22, y: 56,  r: 2.0, delay: 1.1, label: "β  Scout"       },
  { x: 50, y: 64,  r: 2.2, delay: 2.2, label: "γ  Analyst"     },
  { x: 78, y: 56,  r: 2.0, delay: 0.6, label: "δ  Sentinel"    },
  { x: 50, y: 112, r: 2.6, delay: 3.3, label: "ε  Synthesizer" },
];

const FIELD: Star[] = [
  { x:  8, y:  9,  r: 0.7, delay: 0.4 },
  { x: 36, y: 12,  r: 0.6, delay: 1.8 },
  { x: 71, y: 11,  r: 0.8, delay: 2.5 },
  { x: 92, y: 18,  r: 0.6, delay: 3.0 },
  { x: 14, y: 28,  r: 0.7, delay: 0.9 },
  { x: 84, y: 30,  r: 0.7, delay: 2.0 },
  { x: 30, y: 44,  r: 0.6, delay: 1.4 },
  { x: 66, y: 42,  r: 0.6, delay: 2.9 },
  { x:  6, y: 70,  r: 0.7, delay: 0.2 },
  { x: 95, y: 72,  r: 0.7, delay: 1.6 },
  { x: 18, y: 80,  r: 0.6, delay: 2.4 },
  { x: 82, y: 82,  r: 0.8, delay: 0.7 },
  { x: 34, y: 92,  r: 0.6, delay: 1.9 },
  { x: 66, y: 92,  r: 0.6, delay: 3.1 },
  { x: 10, y: 108, r: 0.7, delay: 0.5 },
  { x: 90, y: 108, r: 0.7, delay: 2.3 },
  { x: 24, y: 124, r: 0.6, delay: 1.2 },
  { x: 50, y: 132, r: 0.7, delay: 2.7 },
  { x: 76, y: 124, r: 0.6, delay: 0.3 },
];

// Pipeline: Commander → Scout/Analyst/Sentinel → Synthesizer
const LINES: Array<[number, number]> = [
  [0, 1], [0, 2], [0, 3],
  [1, 4], [2, 4], [3, 4],
];

export function Constellation() {
  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-[8%] celestial-glow rounded-full" aria-hidden />

      <svg
        viewBox="0 0 100 150"
        className="relative w-full h-full drift"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Pipeline connecting lines (subtle) */}
        <g stroke="rgba(127, 170, 255, 0.30)" strokeWidth="0.12" strokeLinecap="round">
          {LINES.map(([a, b], i) => (
            <line
              key={`l-${i}`}
              x1={NAMED[a].x}
              y1={NAMED[a].y}
              x2={NAMED[b].x}
              y2={NAMED[b].y}
            />
          ))}
        </g>

        {/* Field stars (dim) */}
        <g fill="rgba(229, 233, 240, 0.55)">
          {FIELD.map((s, i) => (
            <circle
              key={`f-${i}`}
              cx={s.x}
              cy={s.y}
              r={s.r / 4}
              className="star"
              style={{ animationDelay: `${s.delay}s` }}
            />
          ))}
        </g>

        {/* Named stars (bright, gold halo) */}
        <g>
          {NAMED.map((s, i) => (
            <g key={`n-${i}`} className="star" style={{ animationDelay: `${s.delay}s` }}>
              <circle cx={s.x} cy={s.y} r={s.r * 1.4} fill="rgba(91, 143, 255, 0.12)" />
              <circle cx={s.x} cy={s.y} r={s.r * 0.9} fill="rgba(127, 170, 255, 0.28)" />
              <circle cx={s.x} cy={s.y} r={s.r * 0.45} fill="rgba(240, 245, 255, 0.95)" />
            </g>
          ))}
        </g>

        {/* Labels */}
        <g
          fontFamily="var(--font-geist-mono), monospace"
          fontSize="2.4"
          letterSpacing="0.05em"
          fill="rgba(127, 170, 255, 0.85)"
        >
          {NAMED.map((s, i) => {
            const right = s.x >= 50;
            const labelX = right ? s.x + 3.5 : s.x - 3.5;
            const anchor = right ? "start" : "end";
            return (
              <text key={`t-${i}`} x={labelX} y={s.y + 0.8} textAnchor={anchor}>
                {s.label}
              </text>
            );
          })}
        </g>

        {/* Constellation name plate */}
        <text
          x="50"
          y="148"
          textAnchor="middle"
          fontFamily="var(--font-fraunces), serif"
          fontSize="3.2"
          fontStyle="italic"
          fill="rgba(229, 233, 240, 0.5)"
        >
          Pyxis — the Mariner&apos;s Compass
        </text>
      </svg>
    </div>
  );
}
