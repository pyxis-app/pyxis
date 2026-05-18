"use client";

import { useState } from "react";
import { DEMOS } from "@/lib/demo-briefings";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";

export function DemoBriefings() {
  const [active, setActive] = useState(0);
  const briefing = DEMOS[active];
  return (
    <section id="demo" className="max-w-4xl mx-auto px-6 py-32">
      <h2 className="text-2xl font-semibold mb-2 text-center">
        What a briefing looks like
      </h2>
      <p className="text-sm text-[var(--muted)] text-center mb-8">
        Static demo. Run your own below.
      </p>
      <div className="flex justify-center gap-2 mb-6">
        {DEMOS.map((d, i) => (
          <button
            key={d.id}
            onClick={() => setActive(i)}
            className={`px-4 py-2 text-sm rounded-md border ${
              i === active
                ? "border-[var(--accent)] text-[var(--accent)] glow-accent"
                : "border-[var(--card-border)] text-[var(--muted)] hover:text-white"
            }`}
          >
            {d.topic.split(" ")[0]}
          </button>
        ))}
      </div>
      <div className="glass-card p-8">
        <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-4">
          <span>{briefing.topic}</span>
          <span>
            Confidence {briefing.confidence}/100 · {briefing.sources} sources
          </span>
        </div>
        <MarkdownRenderer content={briefing.briefing} />
      </div>
    </section>
  );
}
