"use client";

import { useEffect, useState } from "react";
import { useAccount, useChainId, useConfig } from "wagmi";
import { getWalletClient } from "wagmi/actions";
import { wrapFetchWithPayment } from "x402-fetch";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion, AnimatePresence } from "framer-motion";
import { TopicInput } from "./topic-input";
import { BriefingCard, type Briefing } from "./briefing-card";
import { ProbeNodeGraph } from "@/components/shared/probe-node-graph";
import { signInWithEthereum } from "@/lib/siwe-client";

type State =
  | { kind: "idle" }
  | { kind: "running"; startedAt: number }
  | { kind: "done"; briefing: Briefing }
  | { kind: "error"; message: string };

const EXAMPLE_TOPICS = [
  "Modular DA layers in 2026",
  "Liquid restaking systemic risk",
  "Solana payments adoption",
  "Bitcoin L2 thesis",
  "MEV redistribution post-PBS",
];

const RUNNING_PHASES = [
  { t: 0,     caption: "Commander reading your topic…" },
  { t: 1500,  caption: "Three probes searching in parallel…" },
  { t: 4500,  caption: "Cross-referencing market data…" },
  { t: 7000,  caption: "Synthesizer assembling the briefing…" },
  { t: 10000, caption: "Almost there — finalising citations…" },
];

function currentPhase(elapsedMs: number) {
  let p = RUNNING_PHASES[0];
  for (const phase of RUNNING_PHASES) {
    if (elapsedMs >= phase.t) p = phase;
  }
  return p;
}

export function ResearchWorkspace() {
  const [topic, setTopic] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const [elapsedMs, setElapsedMs] = useState(0);
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const config = useConfig();

  // running timer
  useEffect(() => {
    if (state.kind !== "running") return;
    const id = setInterval(() => setElapsedMs(Date.now() - state.startedAt), 100);
    return () => clearInterval(id);
  }, [state]);

  async function start() {
    if (!isConnected || !address) return;
    try {
      await signInWithEthereum({ config, address, chainId });
    } catch {
      /* ignore — history won't load without auth, but research can still run */
    }

    setElapsedMs(0);
    setState({ kind: "running", startedAt: Date.now() });

    try {
      let paidFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response> = (
        input,
        init
      ) => fetch(input, init);
      try {
        const walletClient = await getWalletClient(config);
        if (walletClient) {
          paidFetch = wrapFetchWithPayment(
            fetch,
            walletClient as unknown as Parameters<typeof wrapFetchWithPayment>[1]
          );
        }
      } catch {
        /* fall back to plain fetch */
      }

      const res = await paidFetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const b = (await res.json()) as Briefing;
      setState({ kind: "done", briefing: b });
    } catch (err) {
      setState({
        kind: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const headerTitle =
    state.kind === "done"     ? "Briefing delivered."
    : state.kind === "running"  ? "Researching…"
    : state.kind === "error"    ? "Something interrupted the swarm."
    :                            "Pose your inquiry.";

  return (
    <div className="px-8 lg:px-12 py-10 lg:py-12 max-w-[1100px]">
      {/* Header */}
      <header className="mb-12">
        <div className="eyebrow mb-3">Workspace · Volume I</div>
        <h1 className="font-display text-[34px] sm:text-[44px] lg:text-[52px] leading-[1.05] tracking-[-0.02em]">
          {state.kind === "done" ? (
            <>
              Briefing{" "}
              <span className="italic" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144' }}>
                delivered
              </span>.
            </>
          ) : (
            headerTitle
          )}
        </h1>
      </header>

      {/* Input row — present when not viewing a completed briefing */}
      {state.kind !== "done" && (
        <>
          <TopicInput
            value={topic}
            onChange={setTopic}
            onSubmit={start}
            disabled={state.kind === "running" || !isConnected}
          />

          {!isConnected && (
            <div className="mt-8 hairline-top pt-8 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-center">
              <div>
                <div className="eyebrow mb-2">Begin</div>
                <p className="font-display italic text-[17px] leading-snug text-[var(--foreground)]/85 max-w-md" style={{ fontVariationSettings: '"opsz" 9' }}>
                  Connect a wallet to research any topic. $0.25 USDC per briefing, settled on Base Sepolia. No subscription.
                </p>
              </div>
              <ConnectButton.Custom>
                {({ openConnectModal, mounted, authenticationStatus }) => {
                  if (!mounted || authenticationStatus === "loading") {
                    return (
                      <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--gold-soft)]">
                        Loading…
                      </div>
                    );
                  }
                  return (
                    <button
                      onClick={openConnectModal}
                      className="group inline-flex items-baseline gap-3 px-6 py-4 bg-[var(--gold)] text-[var(--background)] font-mono uppercase text-[11px] tracking-[0.22em] hover:bg-[var(--foreground)] transition-colors duration-300 self-end"
                    >
                      Connect wallet
                      <span className="font-display text-[16px] leading-none translate-y-[1px] group-hover:translate-x-0.5 transition-transform">
                        →
                      </span>
                    </button>
                  );
                }}
              </ConnectButton.Custom>
            </div>
          )}

          {state.kind === "idle" && isConnected && (
            <div className="mt-6 flex flex-wrap gap-2">
              {EXAMPLE_TOPICS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className="text-[12px] px-3 py-1.5 hairline-x hairline-bottom border-t border-[var(--hair)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--gold-soft)] transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Body */}
      <div className="mt-14">
        <AnimatePresence mode="wait">
          {/* ── Idle ─────────────────────────────────────────── */}
          {state.kind === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 hairline-top pt-10"
            >
              <div>
                <div className="eyebrow mb-4">What you&apos;ll receive</div>
                <p className="font-display italic text-[18px] leading-snug text-[var(--foreground)]/85 max-w-sm" style={{ fontVariationSettings: '"opsz" 9' }}>
                  An executive summary, key findings by category, risks, opportunities, and a confidence score — every claim cited.
                </p>
                <div className="mt-6 grid grid-cols-3 gap-4 text-[11px] font-mono">
                  <div>
                    <div className="eyebrow mb-1">Cost</div>
                    <div className="text-[var(--foreground)] tabular">$0.25</div>
                  </div>
                  <div>
                    <div className="eyebrow mb-1">Time</div>
                    <div className="text-[var(--foreground)] tabular">~6 s</div>
                  </div>
                  <div>
                    <div className="eyebrow mb-1">Sources</div>
                    <div className="text-[var(--foreground)] tabular">8–14</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="eyebrow mb-4">Pipeline</div>
                <div className="font-display text-[28px] leading-tight">
                  <span className="italic text-[var(--gold)]">α</span>{" "}
                  <span className="text-[var(--muted)]">→</span>{" "}
                  <span className="italic text-[var(--gold)]">β</span>{" "}
                  <span className="italic text-[var(--gold)]">γ</span>{" "}
                  <span className="italic text-[var(--gold)]">δ</span>{" "}
                  <span className="text-[var(--muted)]">→</span>{" "}
                  <span className="italic text-[var(--gold)]">ε</span>
                </div>
                <p className="mt-4 text-[13px] text-[var(--muted)] leading-relaxed max-w-sm">
                  Commander decomposes; Scout, Analyst, and Sentinel investigate; Synthesizer writes. One briefing, one payment.
                </p>
              </div>
            </motion.div>
          )}

          {/* ── Running ──────────────────────────────────────── */}
          {state.kind === "running" && (
            <motion.div
              key="running"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              {/* Status row */}
              <div className="flex items-baseline justify-between gap-8 mb-10 hairline-bottom pb-6">
                <div className="min-w-0">
                  <div className="eyebrow mb-2">Status</div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentPhase(elapsedMs).t}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.3 }}
                      className="font-display italic text-[20px] sm:text-[22px] leading-snug text-[var(--foreground)] truncate"
                      style={{ fontVariationSettings: '"opsz" 144' }}
                    >
                      {currentPhase(elapsedMs).caption}
                    </motion.div>
                  </AnimatePresence>
                </div>
                <div className="text-right shrink-0">
                  <div className="eyebrow mb-2">Elapsed</div>
                  <div className="font-mono tabular text-[20px] text-[var(--gold)]">
                    {(elapsedMs / 1000).toFixed(1)}s
                  </div>
                </div>
              </div>
              {/* Probe graph */}
              <div className="aspect-[3/2] max-w-3xl mx-auto">
                <ProbeNodeGraph live />
              </div>
              <p className="mt-8 text-center text-[12px] font-mono uppercase tracking-[0.22em] text-[var(--gold-soft)]">
                Researching: {topic}
              </p>
            </motion.div>
          )}

          {/* ── Done ─────────────────────────────────────────── */}
          {state.kind === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <BriefingCard b={state.briefing} />
              <div className="mt-16 hairline-top pt-8 flex flex-wrap items-baseline justify-between gap-4">
                <p className="text-[13px] text-[var(--muted)] max-w-md">
                  Briefing saved to your history. Sign in from any device with the same wallet to retrieve it.
                </p>
                <button
                  onClick={() => {
                    setState({ kind: "idle" });
                    setTopic("");
                  }}
                  className="group inline-flex items-baseline gap-2.5 px-5 py-3 bg-[var(--foreground)] text-[var(--background)] font-mono uppercase text-[10px] tracking-[0.22em] hover:bg-[var(--gold)] transition-colors duration-300"
                >
                  New research
                  <span className="font-display text-[14px] leading-none translate-y-[1px] group-hover:translate-x-0.5 transition-transform">
                    →
                  </span>
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Error ────────────────────────────────────────── */}
          {state.kind === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="hairline-x hairline-bottom border-t border-[var(--hair)] p-8 max-w-xl"
            >
              <div className="eyebrow mb-3 text-[var(--danger)]">Pipeline error</div>
              <p className="font-display italic text-[18px] leading-snug text-[var(--foreground)]/90 mb-3" style={{ fontVariationSettings: '"opsz" 9' }}>
                The swarm didn&apos;t complete. Your payment, if it settled, is logged — try again or check your wallet.
              </p>
              <p className="text-[12px] font-mono text-[var(--muted)] break-all">
                {state.message}
              </p>
              <button
                onClick={() => setState({ kind: "idle" })}
                className="mt-6 group inline-flex items-baseline gap-2.5 px-4 py-2.5 hairline-x hairline-bottom border-t border-[var(--hair)] font-mono uppercase text-[10px] tracking-[0.22em] text-[var(--gold-soft)] hover:text-[var(--gold)] hover:border-[var(--gold-soft)] transition-colors"
              >
                Try again
                <span className="font-display text-[12px] leading-none translate-y-[1px] group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
