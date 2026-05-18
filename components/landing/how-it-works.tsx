"use client";

import { useState } from "react";
import { ProbeGraphModal } from "./probe-graph-modal";

const STEPS = [
  {
    num: "1",
    title: "Decompose",
    body: "Commander splits the topic into three focused queries.",
  },
  {
    num: "2",
    title: "Probe",
    body: "Three specialist probes run web search and market data in parallel.",
  },
  {
    num: "3",
    title: "Synthesize",
    body: "Findings merged into a structured briefing with confidence and sources.",
  },
];

export function HowItWorks() {
  const [open, setOpen] = useState(false);
  return (
    <section id="how" className="max-w-6xl mx-auto px-6 py-32">
      <h2 className="text-2xl font-semibold mb-12 text-center">How it works</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STEPS.map((s) => (
          <div key={s.num} className="glass-card p-6">
            <div className="text-xs uppercase tracking-wider text-[var(--muted)]">
              {s.num}
            </div>
            <div className="text-lg font-semibold mt-2 mb-3">{s.title}</div>
            <p className="text-sm text-[var(--muted)]">{s.body}</p>
          </div>
        ))}
      </div>
      <div className="text-center mt-10">
        <button
          onClick={() => setOpen(true)}
          className="text-sm text-[var(--accent)] hover:underline"
        >
          See the swarm graph ↗
        </button>
      </div>
      {open && <ProbeGraphModal onClose={() => setOpen(false)} />}
    </section>
  );
}
