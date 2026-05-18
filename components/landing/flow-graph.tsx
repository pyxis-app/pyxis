"use client";

/**
 * Animated narrative of the Pyxis pipeline.
 *
 * Five named agents — Commander, Scout, Analyst, Sentinel, Synthesizer —
 * shown as a top-down flow with explicit input ("Your topic") and output
 * ("Briefing ready") pills, plus a phase caption underneath that changes
 * to tell a layperson exactly what's happening.
 *
 * Built for clarity over decoration: every visual element corresponds to
 * a real step in the product flow.
 */

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

type Phase = "input" | "commander" | "agents" | "converge" | "synthesize" | "done";

const PHASES: Array<{ p: Phase; ms: number; caption: string }> = [
  { p: "input",      ms: 1300, caption: "You enter a Web3 topic to research." },
  { p: "commander",  ms: 1500, caption: "The Commander breaks it into three focused questions." },
  { p: "agents",     ms: 1800, caption: "Three agents search the web in parallel — news, data, sentiment." },
  { p: "converge",   ms: 1500, caption: "Findings flow back to one place." },
  { p: "synthesize", ms: 1500, caption: "The Synthesizer writes a structured briefing with citations." },
  { p: "done",       ms: 1900, caption: "Ready to read — usually within ten seconds." },
];

type NodeId = "commander" | "scout" | "analyst" | "sentinel" | "synthesizer";

interface Node {
  id: NodeId;
  greek: string;
  name: string;
  role: string;
  x: number;
  y: number;
}

// viewBox is 100×150
const NODES: Node[] = [
  { id: "commander",   greek: "α", name: "Commander",   role: "reads your topic",     x: 50, y: 28  },
  { id: "scout",       greek: "β", name: "Scout",       role: "scans news + docs",     x: 18, y: 72  },
  { id: "analyst",     greek: "γ", name: "Analyst",     role: "checks prices + TVL",   x: 50, y: 72  },
  { id: "sentinel",    greek: "δ", name: "Sentinel",    role: "reads community mood",  x: 82, y: 72  },
  { id: "synthesizer", greek: "ε", name: "Synthesizer", role: "writes the briefing",   x: 50, y: 116 },
];

const TOPIC_PILL_Y = 8;
const BRIEFING_PILL_Y = 138;

interface Edge {
  id: string;
  from: NodeId;
  to: NodeId;
  group: "out" | "in";
  signalDelay: number;
}

const EDGES: Edge[] = [
  { id: "c-s",  from: "commander", to: "scout",       group: "out", signalDelay: 0.0  },
  { id: "c-a",  from: "commander", to: "analyst",     group: "out", signalDelay: 0.15 },
  { id: "c-se", from: "commander", to: "sentinel",    group: "out", signalDelay: 0.30 },
  { id: "s-y",  from: "scout",     to: "synthesizer", group: "in",  signalDelay: 0.0  },
  { id: "a-y",  from: "analyst",   to: "synthesizer", group: "in",  signalDelay: 0.15 },
  { id: "se-y", from: "sentinel",  to: "synthesizer", group: "in",  signalDelay: 0.30 },
];

function nodeById(id: NodeId): Node {
  return NODES.find((n) => n.id === id)!;
}

function nodeBright(id: NodeId, phase: Phase): boolean {
  switch (phase) {
    case "input":       return false;
    case "commander":   return id === "commander";
    case "agents":      return id === "commander" || id === "scout" || id === "analyst" || id === "sentinel";
    case "converge":    return id !== "synthesizer";
    case "synthesize":  return id === "synthesizer";
    case "done":        return true;
  }
}

function pulseFor(id: NodeId, phase: Phase): { active: boolean; delay: number; big: boolean } {
  if (phase === "commander" && id === "commander")   return { active: true, delay: 0,    big: false };
  if (phase === "agents"    && id === "scout")       return { active: true, delay: 0.0,  big: false };
  if (phase === "agents"    && id === "analyst")     return { active: true, delay: 0.18, big: false };
  if (phase === "agents"    && id === "sentinel")    return { active: true, delay: 0.36, big: false };
  if (phase === "synthesize" && id === "synthesizer") return { active: true, delay: 0,    big: true  };
  return { active: false, delay: 0, big: false };
}

function edgeLit(group: "out" | "in", phase: Phase): boolean {
  if (phase === "agents" && group === "out") return true;
  if (phase === "converge") return true;
  if (phase === "synthesize" || phase === "done") return true;
  return false;
}

function edgeFlowing(group: "out" | "in", phase: Phase): boolean {
  return (phase === "agents" && group === "out") || (phase === "converge" && group === "in");
}

const inputPillBright  = (phase: Phase) => phase === "input" || phase === "commander" || phase === "agents" || phase === "done";
const outputPillBright = (phase: Phase) => phase === "synthesize" || phase === "done";

export function FlowGraph() {
  const [idx, setIdx] = useState(0);
  const current = PHASES[idx];
  const phase = current.p;

  useEffect(() => {
    const t = setTimeout(() => setIdx((i) => (i + 1) % PHASES.length), current.ms);
    return () => clearTimeout(t);
  }, [idx, current.ms]);

  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="relative flex-1">
        <div className="absolute inset-[8%] celestial-glow rounded-full" aria-hidden />

        <svg
          viewBox="0 0 100 150"
          className="relative w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* ── Top pill: "Your topic" ──────────────────────── */}
          <Pill
            cx={50}
            cy={TOPIC_PILL_Y}
            label="Your topic"
            bright={inputPillBright(phase)}
          />
          {/* connector pill → Commander */}
          <line
            x1={50}
            y1={TOPIC_PILL_Y + 3}
            x2={50}
            y2={nodeById("commander").y - 3.5}
            stroke="rgba(91, 143, 255, 0.18)"
            strokeWidth="0.12"
            strokeDasharray="0.6 1"
          />

          {/* ── Edges (Commander → agents → Synthesizer) ───── */}
          {EDGES.map((edge) => {
            const a = nodeById(edge.from);
            const b = nodeById(edge.to);
            const lit = edgeLit(edge.group, phase);
            const flowing = edgeFlowing(edge.group, phase);
            return (
              <g key={edge.id}>
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="rgba(91, 143, 255, 0.12)"
                  strokeWidth="0.12"
                  strokeLinecap="round"
                />
                <motion.line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="rgba(127, 170, 255, 0.85)"
                  strokeWidth="0.22"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: lit ? 1 : 0, opacity: lit ? 1 : 0 }}
                  transition={{
                    pathLength: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
                    opacity: { duration: 0.4 },
                  }}
                />
                <AnimatePresence>
                  {flowing && (
                    <motion.circle
                      key={`sig-${edge.id}-${phase}`}
                      r={0.7}
                      fill="rgba(240, 245, 255, 0.95)"
                      filter="drop-shadow(0 0 1.4px rgba(127, 170, 255, 0.9))"
                      initial={{ cx: a.x, cy: a.y, opacity: 0 }}
                      animate={{ cx: b.x, cy: b.y, opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.25 } }}
                      transition={{
                        cx: { duration: 1.0, ease: "easeOut", delay: edge.signalDelay },
                        cy: { duration: 1.0, ease: "easeOut", delay: edge.signalDelay },
                        opacity: { duration: 0.3, delay: edge.signalDelay },
                      }}
                    />
                  )}
                </AnimatePresence>
              </g>
            );
          })}

          {/* ── Nodes ──────────────────────────────────────── */}
          {NODES.map((node) => {
            const bright = nodeBright(node.id, phase);
            const pulse = pulseFor(node.id, phase);
            return (
              <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                <motion.circle
                  r={3.6}
                  fill="rgba(91, 143, 255, 0.10)"
                  animate={{ opacity: bright ? 1 : 0.25 }}
                  transition={{ duration: 0.5 }}
                />
                <motion.circle
                  r={2.3}
                  fill="none"
                  stroke="rgba(127, 170, 255, 0.5)"
                  strokeWidth="0.18"
                  animate={{ opacity: bright ? 1 : 0.3 }}
                  transition={{ duration: 0.5 }}
                />
                <AnimatePresence>
                  {pulse.active && (
                    <motion.circle
                      key={`pulse-${node.id}-${phase}`}
                      cx={0}
                      cy={0}
                      fill="none"
                      stroke="rgba(127, 170, 255, 0.8)"
                      strokeWidth="0.22"
                      initial={{ r: 1.6, opacity: 0.95 }}
                      animate={{ r: pulse.big ? 10 : 6.5, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: pulse.big ? 1.6 : 1.2,
                        ease: [0.22, 1, 0.36, 1],
                        delay: pulse.delay,
                      }}
                    />
                  )}
                </AnimatePresence>
                <motion.circle
                  r={1.1}
                  fill="rgba(240, 245, 255, 0.98)"
                  animate={{ scale: bright ? 1.1 : 0.85, opacity: bright ? 1 : 0.55 }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: pulse.delay }}
                />
              </g>
            );
          })}

          {/* ── Node labels — α  Commander \n role description ─ */}
          {NODES.map((node) => {
            const bright = nodeBright(node.id, phase);
            const labelY = node.y + 8;
            return (
              <motion.g
                key={`label-${node.id}`}
                animate={{ opacity: bright ? 1 : 0.5 }}
                transition={{ duration: 0.5 }}
              >
                {/* Greek + Name inline */}
                <text
                  x={node.x}
                  y={labelY}
                  textAnchor="middle"
                  fontFamily="var(--font-fraunces), serif"
                  fontSize="3.6"
                >
                  <tspan
                    fontStyle="italic"
                    fill="rgba(127, 170, 255, 0.95)"
                    fontWeight="400"
                  >
                    {node.greek}
                  </tspan>
                  <tspan dx="1" fontWeight="500" fill="rgba(229, 233, 240, 0.98)">
                    {" "}{node.name}
                  </tspan>
                </text>
                {/* Role description — monospace, smaller */}
                <text
                  x={node.x}
                  y={labelY + 4}
                  textAnchor="middle"
                  fontFamily="var(--font-geist-mono), monospace"
                  fontSize="2.1"
                  letterSpacing="0.04em"
                  fill="rgba(127, 170, 255, 0.7)"
                >
                  {node.role}
                </text>
              </motion.g>
            );
          })}

          {/* connector Synthesizer → "Briefing" pill */}
          <line
            x1={50}
            y1={nodeById("synthesizer").y + 3.5}
            x2={50}
            y2={BRIEFING_PILL_Y - 3}
            stroke="rgba(91, 143, 255, 0.18)"
            strokeWidth="0.12"
            strokeDasharray="0.6 1"
          />

          {/* ── Bottom pill: "Briefing ready" ──────────────── */}
          <Pill
            cx={50}
            cy={BRIEFING_PILL_Y}
            label="Briefing ready"
            bright={outputPillBright(phase)}
          />
        </svg>
      </div>

      {/* Phase caption — under the graph, crossfades with phase */}
      <div className="mt-2 lg:mt-4 h-12 flex items-start justify-center px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4 }}
            className="text-center max-w-md"
          >
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--gold)] mb-1.5">
              Step {idx + 1} / {PHASES.length}
            </div>
            <div className="font-display italic text-[15px] leading-snug text-[var(--foreground)]/85">
              {current.caption}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Pill (input/output capsule) ───────────────────────────── */

function Pill({ cx, cy, label, bright }: { cx: number; cy: number; label: string; bright: boolean }) {
  const w = 36;
  const h = 7;
  return (
    <motion.g animate={{ opacity: bright ? 1 : 0.4 }} transition={{ duration: 0.5 }}>
      <rect
        x={cx - w / 2}
        y={cy - h / 2}
        width={w}
        height={h}
        rx={h / 2}
        ry={h / 2}
        fill="rgba(91, 143, 255, 0.08)"
        stroke="rgba(127, 170, 255, 0.55)"
        strokeWidth="0.18"
      />
      <text
        x={cx}
        y={cy + 1.1}
        textAnchor="middle"
        fontFamily="var(--font-geist-mono), monospace"
        fontSize="2.6"
        letterSpacing="0.06em"
        fill="rgba(229, 233, 240, 0.95)"
      >
        {label}
      </text>
    </motion.g>
  );
}
