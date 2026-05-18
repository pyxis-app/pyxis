"use client";

/**
 * Animated node graph showing the Pyxis pipeline:
 *   α Commander → β Scout · γ Analyst · δ Sentinel → ε Synthesizer
 *
 * A 7-phase choreography (~10s total) drives the motion via framer-motion:
 *   1. Commander wakes        (1.4s)  — node pulse + ring shockwave
 *   2. Edges out               (1.4s)  — three lines draw from Commander
 *   3. Probes activate         (1.6s)  — scout/analyst/sentinel pulse, staggered
 *   4. Edges in                (1.4s)  — three lines draw to Synthesizer
 *   5. Synthesizer pulse       (1.2s)  — big ring shockwave
 *   6. Hold                    (1.5s)  — all bright, complete state
 *   7. Fade                    (1.5s)  — return to dim idle, then loop
 *
 * Signal dots travel along edges during "edges-out" and "edges-in" phases.
 */

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

type Phase =
  | "commander"
  | "edges-out"
  | "probes"
  | "edges-in"
  | "synthesize"
  | "hold"
  | "fade";

const PHASE_TIMELINE: Array<{ p: Phase; ms: number }> = [
  { p: "commander",   ms: 1400 },
  { p: "edges-out",   ms: 1400 },
  { p: "probes",      ms: 1600 },
  { p: "edges-in",    ms: 1400 },
  { p: "synthesize",  ms: 1200 },
  { p: "hold",        ms: 1500 },
  { p: "fade",        ms: 1500 },
];

type NodeId = "commander" | "scout" | "analyst" | "sentinel" | "synthesizer";

interface Node {
  id: NodeId;
  greek: string;
  label: string;
  x: number;
  y: number;
  labelAnchor: "start" | "end";
}

// 100×100 viewBox; layout is a diamond with Synthesizer at the bottom.
const NODES: Node[] = [
  { id: "commander",   greek: "α", label: "Commander",   x: 50, y: 14, labelAnchor: "start" },
  { id: "scout",       greek: "β", label: "Scout",       x: 14, y: 50, labelAnchor: "end"   },
  { id: "analyst",     greek: "γ", label: "Analyst",     x: 50, y: 50, labelAnchor: "start" },
  { id: "sentinel",    greek: "δ", label: "Sentinel",    x: 86, y: 50, labelAnchor: "start" },
  { id: "synthesizer", greek: "ε", label: "Synthesizer", x: 50, y: 86, labelAnchor: "start" },
];

interface Edge {
  id: string;
  from: NodeId;
  to: NodeId;
  group: "out" | "in";
  signalDelay: number; // staggered signal-dot delay within phase
}

const EDGES: Edge[] = [
  { id: "c-s",  from: "commander", to: "scout",       group: "out", signalDelay: 0.0 },
  { id: "c-a",  from: "commander", to: "analyst",     group: "out", signalDelay: 0.15 },
  { id: "c-se", from: "commander", to: "sentinel",    group: "out", signalDelay: 0.30 },
  { id: "s-y",  from: "scout",     to: "synthesizer", group: "in",  signalDelay: 0.0 },
  { id: "a-y",  from: "analyst",   to: "synthesizer", group: "in",  signalDelay: 0.15 },
  { id: "se-y", from: "sentinel",  to: "synthesizer", group: "in",  signalDelay: 0.30 },
];

function nodeById(id: NodeId): Node {
  return NODES.find((n) => n.id === id)!;
}

function nodeState(id: NodeId, phase: Phase): "bright" | "dim" {
  switch (phase) {
    case "commander":
    case "edges-out":  return id === "commander" ? "bright" : "dim";
    case "probes":
    case "edges-in":   return ["commander", "scout", "analyst", "sentinel"].includes(id) ? "bright" : "dim";
    case "synthesize":
    case "hold":       return "bright";
    case "fade":       return "dim";
  }
}

function edgeIsFlowing(group: "out" | "in", phase: Phase): boolean {
  return (phase === "edges-out" && group === "out") || (phase === "edges-in" && group === "in");
}

function edgeIsLit(group: "out" | "in", phase: Phase): boolean {
  if (phase === "edges-out") return group === "out";
  if (phase === "edges-in")  return group === "in" || group === "out"; // out stays lit while in fires
  if (phase === "synthesize" || phase === "hold") return true;
  return false;
}

function pulseRingActive(id: NodeId, phase: Phase): boolean {
  if (phase === "commander"  && id === "commander")  return true;
  if (phase === "probes"     && (id === "scout" || id === "analyst" || id === "sentinel")) return true;
  if (phase === "synthesize" && id === "synthesizer") return true;
  return false;
}

function pulseDelayFor(id: NodeId, phase: Phase): number {
  if (phase === "probes") {
    if (id === "scout")    return 0.0;
    if (id === "analyst")  return 0.18;
    if (id === "sentinel") return 0.36;
  }
  return 0;
}

export function FlowGraph() {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const phase = PHASE_TIMELINE[phaseIdx].p;

  useEffect(() => {
    const t = setTimeout(
      () => setPhaseIdx((i) => (i + 1) % PHASE_TIMELINE.length),
      PHASE_TIMELINE[phaseIdx].ms
    );
    return () => clearTimeout(t);
  }, [phaseIdx]);

  return (
    <div className="relative w-full h-full">
      {/* Soft radial glow behind the graph */}
      <div className="absolute inset-[8%] celestial-glow rounded-full" aria-hidden />

      <svg
        viewBox="0 0 100 110"
        className="relative w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* ── Edges ──────────────────────────────────────────── */}
        {EDGES.map((edge) => {
          const a = nodeById(edge.from);
          const b = nodeById(edge.to);
          const lit = edgeIsLit(edge.group, phase);
          const flowing = edgeIsFlowing(edge.group, phase);

          return (
            <g key={edge.id}>
              {/* dim base line, always present */}
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="rgba(91, 143, 255, 0.12)"
                strokeWidth="0.12"
                strokeLinecap="round"
              />
              {/* bright overlay that draws/un-draws with phase */}
              <motion.line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="rgba(127, 170, 255, 0.85)"
                strokeWidth="0.22"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: lit ? 1 : 0,
                  opacity: lit ? 1 : 0,
                }}
                transition={{
                  pathLength: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
                  opacity: { duration: 0.35 },
                }}
              />
              {/* signal dot — travels from source to target during flow phases */}
              <AnimatePresence>
                {flowing && (
                  <motion.circle
                    key={`signal-${edge.id}-${phase}`}
                    r="0.7"
                    fill="rgba(240, 245, 255, 0.95)"
                    filter="drop-shadow(0 0 1.5px rgba(127, 170, 255, 0.9))"
                    initial={{ cx: a.x, cy: a.y, opacity: 0 }}
                    animate={{ cx: b.x, cy: b.y, opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    transition={{
                      cx: { duration: 1.0, ease: "easeOut", delay: edge.signalDelay },
                      cy: { duration: 1.0, ease: "easeOut", delay: edge.signalDelay },
                      opacity: { duration: 0.25, delay: edge.signalDelay },
                    }}
                  />
                )}
              </AnimatePresence>
            </g>
          );
        })}

        {/* ── Nodes ──────────────────────────────────────────── */}
        {NODES.map((node) => {
          const bright = nodeState(node.id, phase) === "bright";
          const pulsing = pulseRingActive(node.id, phase);
          const pulseDelay = pulseDelayFor(node.id, phase);

          return (
            <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
              {/* outer ambient halo */}
              <motion.circle
                r={3.8}
                fill="rgba(91, 143, 255, 0.10)"
                animate={{ opacity: bright ? 1 : 0.25 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
              {/* inner glow ring */}
              <motion.circle
                r={2.4}
                fill="none"
                stroke="rgba(127, 170, 255, 0.45)"
                strokeWidth="0.15"
                animate={{ opacity: bright ? 1 : 0.35 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
              {/* shockwave ring on pulse */}
              <AnimatePresence>
                {pulsing && (
                  <motion.circle
                    key={`pulse-${node.id}-${phase}`}
                    cx={0}
                    cy={0}
                    fill="none"
                    stroke="rgba(127, 170, 255, 0.8)"
                    strokeWidth="0.2"
                    initial={{ r: 1.8, opacity: 0.9 }}
                    animate={{
                      r: node.id === "synthesizer" ? 9 : 6.5,
                      opacity: 0,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: node.id === "synthesizer" ? 1.6 : 1.3,
                      ease: [0.22, 1, 0.36, 1],
                      delay: pulseDelay,
                    }}
                  />
                )}
              </AnimatePresence>
              {/* bright core */}
              <motion.circle
                r={1.1}
                fill="rgba(240, 245, 255, 0.98)"
                animate={{
                  scale: bright ? 1.1 : 0.85,
                  opacity: bright ? 1 : 0.55,
                }}
                transition={{ duration: 0.6, ease: "easeOut", delay: pulseDelay }}
              />
            </g>
          );
        })}

        {/* ── Labels ─────────────────────────────────────────── */}
        {NODES.map((node) => {
          const bright = nodeState(node.id, phase) === "bright";
          const isLeft = node.labelAnchor === "end";
          const greekX = isLeft ? node.x - 3.5 : node.x + 3.5;
          const labelX = isLeft ? node.x - 7   : node.x + 7;
          return (
            <motion.g
              key={`label-${node.id}`}
              animate={{ opacity: bright ? 1 : 0.45 }}
              transition={{ duration: 0.6 }}
            >
              {/* Greek letter — display serif italic */}
              <text
                x={greekX}
                y={node.y + 1.1}
                textAnchor={node.labelAnchor}
                fontFamily="var(--font-fraunces), serif"
                fontSize="4"
                fontStyle="italic"
                fill="rgba(127, 170, 255, 0.95)"
              >
                {node.greek}
              </text>
              {/* Role — monospace */}
              <text
                x={labelX}
                y={node.y + 0.9}
                textAnchor={node.labelAnchor}
                fontFamily="var(--font-geist-mono), monospace"
                fontSize="2.4"
                letterSpacing="0.06em"
                fill="rgba(229, 233, 240, 0.85)"
              >
                {node.label}
              </text>
            </motion.g>
          );
        })}

        {/* Constellation name plate */}
        <text
          x="50"
          y="106"
          textAnchor="middle"
          fontFamily="var(--font-fraunces), serif"
          fontSize="3.2"
          fontStyle="italic"
          fill="rgba(229, 233, 240, 0.5)"
        >
          Pyxis — the agent swarm
        </text>
      </svg>
    </div>
  );
}
