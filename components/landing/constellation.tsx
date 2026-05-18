"use client";

// 24 stars arranged roughly as the Pyxis constellation. Coordinates are
// percentages of viewport, hand-picked to evoke the Mariner's Compass
// without being astronomically precise.
const STARS: Array<{ x: number; y: number; r: number; delay: number }> = [
  { x: 18, y: 22, r: 1.6, delay: 0.0 },
  { x: 32, y: 14, r: 2.2, delay: 0.4 },
  { x: 45, y: 28, r: 1.4, delay: 0.8 },
  { x: 58, y: 10, r: 2.6, delay: 1.2 },
  { x: 70, y: 24, r: 1.6, delay: 1.6 },
  { x: 82, y: 16, r: 1.8, delay: 2.0 },
  { x: 12, y: 48, r: 1.2, delay: 0.6 },
  { x: 28, y: 60, r: 1.9, delay: 1.0 },
  { x: 40, y: 72, r: 2.3, delay: 1.4 },
  { x: 55, y: 78, r: 1.5, delay: 1.8 },
  { x: 66, y: 64, r: 2.0, delay: 2.2 },
  { x: 79, y: 56, r: 1.6, delay: 0.2 },
  { x: 90, y: 70, r: 1.3, delay: 1.5 },
  { x: 8, y: 80, r: 1.0, delay: 0.9 },
  { x: 22, y: 88, r: 1.4, delay: 1.3 },
  { x: 50, y: 50, r: 2.8, delay: 0.0 }, // bright center
  { x: 35, y: 40, r: 1.3, delay: 0.7 },
  { x: 65, y: 42, r: 1.5, delay: 1.1 },
  { x: 48, y: 22, r: 1.2, delay: 1.7 },
  { x: 52, y: 80, r: 1.4, delay: 0.3 },
  { x: 15, y: 35, r: 1.1, delay: 2.1 },
  { x: 85, y: 30, r: 1.1, delay: 0.5 },
  { x: 38, y: 56, r: 1.0, delay: 1.9 },
  { x: 62, y: 84, r: 1.0, delay: 2.3 },
];

// Lines for the compass-shape connections (between selected star indices).
const LINES: Array<[number, number]> = [
  [1, 3], [3, 5], [5, 11], [11, 12], [12, 14], [14, 13],
  [13, 8], [8, 7], [7, 6], [6, 0], [0, 1],
  [15, 2], [15, 16], [15, 17], [15, 18], [15, 19],
];

export function Constellation() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <g stroke="rgba(148, 163, 184, 0.15)" strokeWidth="0.08">
        {LINES.map(([a, b], i) => (
          <line
            key={i}
            x1={STARS[a].x}
            y1={STARS[a].y}
            x2={STARS[b].x}
            y2={STARS[b].y}
          />
        ))}
      </g>
      <g fill="white">
        {STARS.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r / 8}
            className="star"
            style={{ animationDelay: `${s.delay}s` }}
          />
        ))}
      </g>
    </svg>
  );
}
