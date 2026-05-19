"use client";

import { useEffect, useState } from "react";
import { ProbeGraphModal } from "./probe-graph-modal";

interface Agent { greek: string; name: string; color?: "scout" | "analyst" | "sentinel" | "cmd" | "synth"; }
interface Step {
  index: string;
  slug: string;
  title: string;
  body: string;
  agents: Agent[];
  variant?: "scout" | "analyst" | "sentinel" | "default";
}

type ProbeKey = "cmd" | "scout" | "analyst" | "sentinel" | "synth";
type ProbeState = "queued" | "running" | "done";

const PIPELINE_PROBES: { key: ProbeKey; greek: string; name: string }[] = [
  { key: "cmd", greek: "α", name: "commander" },
  { key: "scout", greek: "β", name: "scout" },
  { key: "analyst", greek: "γ", name: "analyst" },
  { key: "sentinel", greek: "δ", name: "sentinel" },
  { key: "synth", greek: "ε", name: "synthesizer" },
];

// 5-phase cycle for the animated flow (~7s total, then restart).
// Phase 0: commander running
// Phase 1: scout/analyst/sentinel running in parallel
// Phase 2: still parallel (1st half done)
// Phase 3: synthesizer running
// Phase 4: complete — brief moment of all-done before restart
const FLOW_PHASES = [
  { caption: "α commander · classifying topic into 3 probe queries" },
  { caption: "β γ δ · scout, analyst, sentinel searching in parallel" },
  { caption: "  …pulling live data from 13 sources" },
  { caption: "ε synthesizer · merging findings + freshness table" },
  { caption: "✓ briefing ready · cited, timestamped, audit-friendly" },
];

function getProbeState(probeKey: ProbeKey, phase: number): ProbeState {
  if (probeKey === "cmd") return phase === 0 ? "running" : "done";
  if (probeKey === "synth") {
    if (phase < 3) return "queued";
    if (phase === 3) return "running";
    return "done";
  }
  // scout / analyst / sentinel
  if (phase === 0) return "queued";
  if (phase === 1 || phase === 2) return "running";
  return "done";
}

const STEPS: Step[] = [
  {
    index: "01",
    slug: "decompose",
    title: "Decompose",
    body: "The Commander reads your topic and splits it into three focused queries — one for facts, one for metrics, one for sentiment.",
    agents: [{ greek: "α", name: "commander", color: "cmd" }],
    variant: "default",
  },
  {
    index: "02",
    slug: "investigate",
    title: "Investigate",
    body: "Scout, Analyst, and Sentinel each run targeted web searches in parallel. Live price and TVL data inject directly into the Analyst's context.",
    agents: [
      { greek: "β", name: "scout", color: "scout" },
      { greek: "γ", name: "analyst", color: "analyst" },
      { greek: "δ", name: "sentinel", color: "sentinel" },
    ],
    variant: "scout",
  },
  {
    index: "03",
    slug: "synthesize",
    title: "Synthesize",
    body: "Findings merge into a single structured briefing with cited sources, freshness timestamps, and explicit gap notes — no confidence theater, just data you can verify.",
    agents: [{ greek: "ε", name: "synthesizer", color: "synth" }],
    variant: "default",
  },
];

export function HowItWorks() {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState(0);

  // Cycle through 5 phases. Durations sum to ~7s, then phase 4 holds slightly
  // longer so the "✓ ready" beat lands before restart.
  useEffect(() => {
    const durations = [1200, 2000, 1400, 1600, 1800]; // ms per phase
    const id = window.setTimeout(
      () => setPhase((p) => (p + 1) % FLOW_PHASES.length),
      durations[phase]
    );
    return () => clearTimeout(id);
  }, [phase]);

  return (
    <section id="method" className="relative">
      <div className="max-w-[1080px] mx-auto px-6 lg:px-8 py-20 lg:py-24">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <span className="term-section-tag">// method</span>
          <span className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-[0.18em]">
            three phases · one orchestrator
          </span>
        </div>
        <h2 className="font-mono text-[26px] lg:text-[32px] tracking-[-0.005em] font-semibold text-[var(--foreground)] lowercase">
          how the swarm works
        </h2>
        <p className="mt-3 font-mono text-[14px] text-[var(--muted)] max-w-[58ch] leading-[1.6]">
          Three named phases, one orchestrator, six seconds. Designed so every finding traces back to a URL you can audit.
        </p>

        {/* Main block */}
        <div className="mt-10 term-block active">
          <div className="term-block-head">
            <span>
              <span className="dim">╭─</span> pipeline/live <span className="dim">────────────────</span>
            </span>
            <span className="live-pill">
              [ <span className="text-[var(--accent)]">live</span> · cycling demo · phase {phase + 1}/5 ]
            </span>
          </div>

          {/* Animated 5-agent flow strip */}
          <div className="term-pipeline term-flow">
            {PIPELINE_PROBES.map((p, i) => {
              const state = getProbeState(p.key, phase);
              return (
                <span key={p.key} className="term-flow-cell">
                  <span className={`term-pipeline-step ${state} ${p.key}`}>
                    <span className="diamond">◆</span>
                    <span className="font-mono text-[10px] text-[var(--muted)] mr-1">
                      {p.greek}
                    </span>
                    {p.name}
                  </span>
                  {i < PIPELINE_PROBES.length - 1 && (
                    <span
                      className={`term-flow-arrow ${
                        state === "done" ? "active" : ""
                      }`}
                      aria-hidden
                    >
                      →
                    </span>
                  )}
                </span>
              );
            })}
          </div>

          {/* Live caption line — height-stable to prevent layout shift */}
          <div className="mt-3 font-mono text-[12px] text-[var(--muted)] text-center min-h-[20px]">
            <span className="opacity-70">›</span>{" "}
            <span
              key={phase}
              className="inline-block animate-[term-fade-in_280ms_ease-out_both]"
            >
              {FLOW_PHASES[phase].caption}
            </span>
          </div>

          {/* 3 step sub-blocks */}
          {STEPS.map((step) => (
            <div
              key={step.index}
              className={`term-sub ${step.variant === "scout" ? "scout" : ""}`}
            >
              <div className="term-sub-head">
                <span className="text-[var(--foreground)]">
                  [{step.index}] {step.slug}
                </span>
                <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1 justify-end">
                  {step.agents.map((agent, idx) => (
                    <span key={idx} className="inline-flex items-baseline gap-1">
                      {idx > 0 && <span className="text-[var(--hair)]">·</span>}
                      <span className={`term-tag ${agent.color ?? ""}`}>
                        {agent.greek} {agent.name}
                      </span>
                    </span>
                  ))}
                </span>
              </div>
              <div className="font-mono text-[14px] leading-[1.7] text-[var(--foreground)] opacity-90 mt-2 max-w-[62ch]">
                <span className="font-semibold text-[var(--foreground)]">{step.title}.</span>{" "}
                <span className="text-[var(--muted)]">{step.body}</span>
              </div>
            </div>
          ))}
        </div>

        {/* See-the-swarm CTA */}
        <div className="mt-8 text-center">
          <button onClick={() => setOpen(true)} className="term-chip">
            see the swarm animate ↗
          </button>
        </div>
      </div>

      {open && <ProbeGraphModal onClose={() => setOpen(false)} />}
    </section>
  );
}
