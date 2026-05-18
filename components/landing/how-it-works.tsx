"use client";

import { Fragment, useState } from "react";
import { ProbeGraphModal } from "./probe-graph-modal";

interface Agent { greek: string; name: string; }
interface Step {
  roman: string;
  title: string;
  body: string;
  agents: Agent[];
}

const STEPS: Step[] = [
  {
    roman: "I",
    title: "Decompose",
    body: "The Commander reads your topic and splits it into three focused queries — one for facts, one for metrics, one for sentiment.",
    agents: [{ greek: "α", name: "Commander" }],
  },
  {
    roman: "II",
    title: "Investigate",
    body: "Scout, Analyst, and Sentinel each run targeted web searches in parallel. Live price and TVL data inject directly into the Analyst's context.",
    agents: [
      { greek: "β", name: "Scout" },
      { greek: "γ", name: "Analyst" },
      { greek: "δ", name: "Sentinel" },
    ],
  },
  {
    roman: "III",
    title: "Synthesize",
    body: "Findings merge into a single structured briefing with cited sources, a confidence score, and explicit gap notes.",
    agents: [{ greek: "ε", name: "Synthesizer" }],
  },
];

export function HowItWorks() {
  const [open, setOpen] = useState(false);
  return (
    <section id="method" className="relative hairline-bottom">
      <div className="max-w-[1280px] mx-auto px-8 py-24 lg:py-32">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-20">
          <div className="max-w-2xl">
            <div className="eyebrow mb-5">Method · §01</div>
            <h2 className="font-display text-[44px] sm:text-[60px] lg:text-[72px] leading-[1.02] tracking-[-0.02em]">
              How the swarm{" "}
              <span className="italic" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144' }}>
                works
              </span>.
            </h2>
          </div>
          <p className="max-w-sm text-[15px] text-[var(--muted)]">
            Three named phases, one orchestrator, six seconds.
            Designed so every finding traces back to a URL you can audit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 hairline-top">
          {STEPS.map((step, i) => (
            <article
              key={step.roman}
              className={`relative py-12 ${i < STEPS.length - 1 ? "md:border-r border-[var(--hair)]" : ""} ${i > 0 ? "border-t md:border-t-0 border-[var(--hair)]" : ""}`}
            >
              <div className="px-2 md:px-8">
                <div className="flex items-start justify-between mb-8 gap-3">
                  <span
                    className="font-display text-[68px] leading-none italic text-[var(--gold)] opacity-70"
                    style={{ fontVariationSettings: '"WONK" 1, "opsz" 144' }}
                  >
                    {step.roman}
                  </span>
                  <div className="flex flex-wrap items-baseline justify-end gap-x-3 gap-y-2 text-right pt-3">
                    {step.agents.map((agent, idx) => (
                      <Fragment key={idx}>
                        {idx > 0 && (
                          <span className="text-[var(--gold-soft)] opacity-50">·</span>
                        )}
                        <span className="inline-flex items-baseline gap-2 whitespace-nowrap">
                          <span className="font-display italic text-[17px] leading-none text-[var(--gold)]">
                            {agent.greek}
                          </span>
                          <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[var(--gold-soft)]">
                            {agent.name}
                          </span>
                        </span>
                      </Fragment>
                    ))}
                  </div>
                </div>
                <h3 className="font-display text-[32px] leading-tight mb-4">{step.title}</h3>
                <p className="text-[14px] leading-relaxed text-[var(--muted)] max-w-xs">
                  {step.body}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => setOpen(true)}
            className="font-mono text-[11px] tracking-[0.22em] uppercase text-[var(--gold-soft)] hover:text-[var(--gold)] editorial-link"
          >
            See the swarm animate ↗
          </button>
        </div>
      </div>

      {open && <ProbeGraphModal onClose={() => setOpen(false)} />}
    </section>
  );
}
