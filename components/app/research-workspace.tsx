"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount, useChainId, useConfig } from "wagmi";
import { getWalletClient } from "wagmi/actions";
import { wrapFetchWithPayment } from "x402-fetch";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { TopicInput } from "./topic-input";
import { BriefingCard, type Briefing } from "./briefing-card";
import { signInWithEthereum } from "@/lib/siwe-client";

type State =
  | { kind: "idle" }
  | { kind: "running"; startedAt: number }
  | { kind: "done"; briefing: Briefing }
  | { kind: "error"; message: string };

const EXAMPLE_TOPICS = [
  "modular DA layers",
  "liquid restaking risk",
  "solana payments",
  "bitcoin L2 thesis",
  "MEV post-PBS",
];

const RUNNING_PHASES = [
  { t: 0,     stage: 0, caption: "commander reading your topic…" },
  { t: 1500,  stage: 1, caption: "three agents searching in parallel…" },
  { t: 4500,  stage: 2, caption: "cross-referencing market data…" },
  { t: 7000,  stage: 3, caption: "synthesizer assembling the briefing…" },
  { t: 10000, stage: 4, caption: "almost there — finalising citations…" },
];

function currentPhase(elapsedMs: number) {
  let p = RUNNING_PHASES[0];
  for (const phase of RUNNING_PHASES) {
    if (elapsedMs >= phase.t) p = phase;
  }
  return p;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function fmtElapsed(ms: number): string {
  const s = Math.floor(ms / 1000);
  return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
}

function topicSlug(topic: string): string {
  return (
    topic
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 32) || "new"
  );
}

function probeColorClass(probe: string): string {
  if (probe === "scout") return "scout";
  if (probe === "analyst") return "analyst";
  if (probe === "sentinel") return "sentinel";
  return "";
}

function probeTagClass(probe: string): string {
  if (probe === "scout") return "scout";
  if (probe === "analyst") return "analyst";
  if (probe === "sentinel") return "sentinel";
  if (probe === "synthesizer") return "synth";
  return "cmd";
}

export function ResearchWorkspace() {
  const [topic, setTopic] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const [elapsedMs, setElapsedMs] = useState(0);
  const [utcClock, setUtcClock] = useState("");
  // SIWE handshake state — auto-runs once wallet connects so the start button
  // never has to trigger a wallet-sign popup mid-flow. "idle" before connect,
  // "signing" while the popup is open, "ready" after verify (or skipped),
  // "rejected" if the user dismissed the popup.
  const [auth, setAuth] = useState<"idle" | "signing" | "ready" | "rejected">("idle");
  // Guards SIWE useEffect against firing before the post-mount cookie check
  // resolves. Without this, SSR-initialized auth="idle" + connected wallet
  // would trigger an unnecessary popup for users who already have a session.
  const [authChecked, setAuthChecked] = useState(false);
  // In-flight guard. We use a ref (not a closure variable) because the SIWE
  // useEffect setAuth("signing") inside its own body triggers a re-render that
  // changes the `auth` dep, which fires the effect's cleanup. A closure-based
  // `cancelled` flag would then be set to TRUE before the promise resolves,
  // causing the success/reject callback's `if (!cancelled)` guard to silently
  // drop the resolution — and the state would stay stuck at "signing" forever
  // even though the wallet signed successfully and the cookie was set.
  const signingRef = useRef(false);
  // Tracks mount status so async callbacks don't setState on unmounted component.
  const mountedRef = useRef(true);
  useEffect(() => () => {
    mountedRef.current = false;
  }, []);
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const config = useConfig();

  // UTC clock tick
  useEffect(() => {
    function tick() {
      const d = new Date();
      setUtcClock(
        `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} UTC`
      );
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // running timer
  useEffect(() => {
    if (state.kind !== "running") return;
    const id = setInterval(() => setElapsedMs(Date.now() - state.startedAt), 100);
    return () => clearInterval(id);
  }, [state]);

  // Post-mount cookie check — runs once, ahead of the SIWE auto-trigger.
  // If a valid pyxis_session cookie is present, skip the popup entirely.
  useEffect(() => {
    if (typeof document !== "undefined") {
      const hasSession = document.cookie
        .split("; ")
        .some((c) => c.startsWith("pyxis_session=") && c.length > "pyxis_session=".length);
      if (hasSession) setAuth("ready");
    }
    setAuthChecked(true);
  }, []);

  // Auto-trigger SIWE the moment a wallet connects so the popup happens at
  // connect-time (a natural place for a sign), not at submit-time (jarring).
  // Once auth is "ready", the start button submits without any wallet popup.
  // Guarded by authChecked + signingRef so:
  //   1. We don't fire before the cookie pre-check resolves (avoids redundant
  //      popups for users with valid sessions).
  //   2. We don't double-fire when setAuth("signing") below re-triggers this
  //      effect (the `auth` dep changes → effect re-runs → guard bails on the
  //      second run because signingRef.current is TRUE).
  // No cleanup/cancellation — the promise resolves naturally and the resolve
  // callbacks check mountedRef before calling setAuth.
  useEffect(() => {
    if (!authChecked) return;
    if (!isConnected || !address) return;
    if (auth !== "idle") return;
    if (signingRef.current) return;

    signingRef.current = true;
    setAuth("signing");
    signInWithEthereum({ config, address, chainId })
      .then(() => {
        signingRef.current = false;
        if (mountedRef.current) setAuth("ready");
      })
      .catch(() => {
        signingRef.current = false;
        if (mountedRef.current) setAuth("rejected");
      });
  }, [authChecked, isConnected, address, auth, config, chainId]);

  // Reset auth when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      setAuth("idle");
      signingRef.current = false;
    }
  }, [isConnected]);

  function retryAuth() {
    signingRef.current = false;
    setAuth("idle");
  }

  // Escape hatch — proceed without a server-side session. Research will still
  // run; only history won't load for this device. Useful when the wallet popup
  // gets dismissed silently, blocked by an extension, or otherwise hangs.
  function skipAuth() {
    setAuth("ready");
  }

  async function start() {
    if (!isConnected || !address || auth !== "ready") return;

    setElapsedMs(0);
    setState({ kind: "running", startedAt: Date.now() });

    try {
      const freeMode = process.env.NEXT_PUBLIC_X402_FREE_MODE === "true";
      let paidFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response> = (
        input,
        init
      ) => fetch(input, init);
      if (!freeMode) {
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
      }

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (freeMode) headers["X-PAYER-ADDRESS"] = address;

      const res = await paidFetch("/api/research", {
        method: "POST",
        headers,
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

  const phase = state.kind === "running" ? currentPhase(elapsedMs) : null;
  const stageIdx = phase?.stage ?? -1;
  const runSlug =
    state.kind === "done"
      ? topicSlug(state.briefing.topic)
      : topic
      ? topicSlug(topic)
      : "new";
  const breadcrumb = `pyxis://research/${runSlug}`;

  // Stage layout: 0=commander, 1=scout+analyst+sentinel parallel, 2=still parallel, 3=synth, 4=synth
  function probeStatus(probe: "commander" | "scout" | "analyst" | "sentinel" | "synthesizer"):
    "done" | "running" | "queued" {
    if (state.kind === "done") return "done";
    if (state.kind !== "running") return "queued";
    const map: Record<typeof probe, number> = {
      commander: 0,
      scout: 1,
      analyst: 1,
      sentinel: 1,
      synthesizer: 3,
    } as const;
    const startStage = map[probe];
    if (stageIdx < startStage) return "queued";
    // synth runs only at stage 3+; everything else done by stage 3
    if (probe === "synthesizer") {
      return stageIdx >= 4 ? "done" : "running";
    }
    if (probe === "commander") return "done";
    // scout/analyst/sentinel — running until stage 3
    return stageIdx >= 3 ? "done" : "running";
  }

  return (
    <div className="px-6 lg:px-10 py-6 lg:py-8 max-w-[1100px] flex flex-col min-h-screen">
      {/* Top chrome */}
      <header className="mb-6 flex items-center gap-3 flex-wrap">
        <span className="term-section-tag">// research</span>
        <span className="font-mono text-[11px] text-[var(--foreground)]">
          <span className="text-[var(--muted)]">pyxis://research/</span>
          {runSlug}
        </span>
        <span className="ml-auto font-mono text-[11px] text-[var(--muted)] tabular-nums">
          {utcClock}
        </span>
      </header>

      {/* Body — scrollback stack */}
      <div className="flex-1 space-y-4">
        {/* Empty state — no run yet, no input value */}
        {state.kind === "idle" && !isConnected && (
          <div className="term-block">
            <div className="term-block-head">
              <span>
                <span className="dim">╭─</span> connect <span className="dim">────────────────</span>
              </span>
              <span className="live-pill">[ wallet required ]</span>
            </div>
            <p className="font-mono text-[14px] leading-[1.6] text-[var(--foreground)] opacity-90 mb-4">
              <span className="term-p-prefix">P›</span>
              connect a wallet to begin. research is{" "}
              <b className="text-[var(--accent)]">free during beta</b> · no card
              required.
            </p>
            <ConnectButton.Custom>
              {({ openConnectModal, mounted, authenticationStatus }) => {
                if (!mounted || authenticationStatus === "loading") {
                  return (
                    <span className="font-mono text-[11px] text-[var(--muted)] tracking-[0.18em]">
                      loading…
                    </span>
                  );
                }
                return (
                  <button onClick={openConnectModal} className="term-cta">
                    connect wallet
                    <span className="text-[16px] leading-none translate-y-[-1px]">›</span>
                  </button>
                );
              }}
            </ConnectButton.Custom>
          </div>
        )}

        {state.kind === "idle" && isConnected && (
          <div className={`term-block ${auth === "ready" ? "active" : ""}`}>
              <div className="term-block-head">
                <span>
                  <span className="dim">╭─</span> ready <span className="dim">──────────────────</span>
                </span>
                <span className="live-pill">
                  {auth === "ready" && "[ idle · 5 agents on standby ]"}
                  {auth === "signing" && "[ verifying wallet… sign in your wallet ]"}
                  {auth === "rejected" && "[ wallet sign rejected · retry to begin ]"}
                  {auth === "idle" && "[ preparing handshake… ]"}
                </span>
              </div>
              <p className="font-mono text-[15px] text-[var(--foreground)] mb-5">
                <span className="term-p-prefix">P›</span>
                {auth === "ready" && (
                  <>
                    ready to research.
                    <span className="term-cursor" />
                  </>
                )}
                {auth === "signing" && (
                  <>
                    awaiting wallet signature…
                    <span className="term-cursor" />
                  </>
                )}
                {auth === "rejected" && (
                  <>
                    sign-in rejected.{" "}
                    <button
                      onClick={retryAuth}
                      className="font-mono text-[var(--accent)] underline underline-offset-2 hover:text-[var(--scout)]"
                    >
                      retry verification ›
                    </button>
                  </>
                )}
                {auth === "idle" && (
                  <>
                    preparing handshake…
                    <span className="term-cursor" />
                  </>
                )}
              </p>
              <TopicInput
                value={topic}
                onChange={setTopic}
                onSubmit={start}
                disabled={auth !== "ready"}
              />
              <div className="mt-5 flex flex-wrap gap-2">
                {EXAMPLE_TOPICS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTopic(t)}
                    className="term-chip"
                    disabled={auth !== "ready"}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {auth !== "ready" && (
                <div className="mt-4 font-mono text-[11px] text-[var(--muted)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span>
                    {auth === "signing" && "→ check your wallet for a sign-in request"}
                    {auth === "rejected" && "→ wallet sign is one-time per session; required to load history"}
                    {auth === "idle" && "→ wallet handshake will start shortly"}
                  </span>
                  {(auth === "signing" || auth === "rejected") && (
                    <span className="flex items-center gap-2">
                      {auth === "signing" && (
                        <button
                          onClick={retryAuth}
                          className="font-mono text-[11px] text-[var(--muted)] hover:text-[var(--foreground)] underline underline-offset-2"
                          title="popup stuck? retry"
                        >
                          retry ↻
                        </button>
                      )}
                      <button
                        onClick={skipAuth}
                        className="font-mono text-[11px] text-[var(--accent)] hover:text-[var(--scout)] underline underline-offset-2"
                        title="skip wallet sign-in — research still runs, history won't load"
                      >
                        skip sign-in ›
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
        )}

        {/* Running — active run block */}
        {state.kind === "running" && (
          <div className="term-block active">
            <div className="term-block-head">
              <span>
                <span className="dim">╭─</span> run · <b>{utcClock.slice(0, 5)}</b>{" "}
                <span className="dim">──────────</span>
              </span>
              <span>
                <span className="dim">[</span>
                <b className="live-pill">running</b> · <b>{fmtElapsed(elapsedMs)}</b>
                <span className="dim">]─╮</span>
              </span>
            </div>

            {/* 5-agent diamond strip */}
            <div className="term-pipeline">
              {(["commander", "scout", "analyst", "sentinel", "synthesizer"] as const).map(
                (probe, i) => {
                  const status = probeStatus(probe);
                  const cls =
                    status === "done"
                      ? "done"
                      : status === "running"
                      ? "running"
                      : "queued";
                  const diamond =
                    status === "done" ? "◆" : status === "running" ? "◐" : "◇";
                  return (
                    <span key={probe} className="contents">
                      {i > 0 && <span className="dim">·</span>}
                      <span className={`term-pipeline-step ${cls}`}>
                        <span className="diamond">{diamond}</span> {probe}
                      </span>
                    </span>
                  );
                }
              )}
            </div>

            {/* User prompt line */}
            <div className="font-mono text-[15px] text-[var(--foreground)] mb-3">
              <span className="term-p-prefix">›</span>
              {topic}
            </div>

            {/* Probe sub-blocks */}
            {(["commander", "scout", "analyst", "sentinel", "synthesizer"] as const).map(
              (probe) => {
                const status = probeStatus(probe);
                const colorCls = probeColorClass(probe);
                const tagCls = probeTagClass(probe);
                const subClass =
                  status === "queued"
                    ? "term-sub queued"
                    : `term-sub ${colorCls}`;
                return (
                  <div key={probe} className={subClass}>
                    <div className="term-sub-head">
                      <span>
                        <span className="dim">┌─</span> {probe}{" "}
                        <span className="dim">──[</span>
                        {status === "running" ? (
                          <>
                            <span
                              className={`term-spinner ${colorCls}`}
                              aria-hidden
                            />{" "}
                            {fmtElapsed(elapsedMs)}
                          </>
                        ) : status === "done" ? (
                          <>✓ done</>
                        ) : (
                          <>· queued</>
                        )}
                        <span className="dim">]─┐</span>
                      </span>
                    </div>
                    <div className="font-mono text-[12.5px] text-[var(--foreground)] opacity-90">
                      {status === "queued" ? (
                        <span className="text-[var(--muted)]">waiting…</span>
                      ) : (
                        <>
                          <span className={`term-tag ${tagCls}`}>[{probe}]</span>{" "}
                          {probe === "commander" && "decomposing topic into 3 probe queries"}
                          {probe === "scout" && "scanning news, audits, narrative"}
                          {probe === "analyst" && "fetching price, tvl, liquidity, supply"}
                          {probe === "sentinel" && "reading social pulse + governance"}
                          {probe === "synthesizer" && "merging findings into briefing"}
                        </>
                      )}
                    </div>
                  </div>
                );
              }
            )}

            <p className="mt-4 font-mono text-[11px] text-[var(--muted)]">
              {phase?.caption}
            </p>
          </div>
        )}

        {/* Done — briefing */}
        {state.kind === "done" && (
          <>
            <BriefingCard b={state.briefing} active />
            <div className="term-block">
              <div className="font-mono text-[13px] text-[var(--foreground)] opacity-90 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[var(--muted)]">
                  briefing saved · sign in from any device with the same wallet to
                  retrieve it.
                </span>
                <button
                  onClick={() => {
                    setState({ kind: "idle" });
                    setTopic("");
                  }}
                  className="term-cta"
                >
                  new run
                  <span className="text-[16px] leading-none translate-y-[-1px]">›</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Error */}
        {state.kind === "error" && (
          <div
            className="term-block"
            style={{ borderColor: "var(--danger)" }}
          >
            <div className="term-block-head">
              <span>
                <span className="dim">╭─</span> error{" "}
                <span className="dim">──────────────</span>
              </span>
              <span style={{ color: "var(--danger)" }}>[ pipeline interrupted ]</span>
            </div>
            <p className="font-mono text-[14px] leading-[1.6] text-[var(--foreground)] opacity-90 mb-2">
              the swarm didn&apos;t complete. your payment, if it settled, is logged
              — try again or check your wallet.
            </p>
            <p className="font-mono text-[12px] text-[var(--muted)] break-all mb-4">
              {state.message}
            </p>
            <button
              onClick={() => setState({ kind: "idle" })}
              className="term-cta outline"
            >
              try again
              <span className="text-[14px] leading-none translate-y-[-1px]">›</span>
            </button>
          </div>
        )}
      </div>

      {/* Sticky statusline */}
      <div className="mt-6 -mx-6 lg:-mx-10">
        <div className="term-statusline">
          <span className="crumb">{breadcrumb}</span>
          {state.kind === "running" && phase && (
            <>
              <span className="dim">·</span>
              <span>
                <span className={`term-spinner ${probeColorClass("analyst")}`} aria-hidden />{" "}
                stage {stageIdx + 1}/5 · {fmtElapsed(elapsedMs)}
              </span>
            </>
          )}
          {state.kind === "done" && (
            <>
              <span className="dim">·</span>
              <span>briefing · {state.briefing.sources} sources</span>
            </>
          )}
          <span className="ml-auto flex items-center gap-2">
            <span className="chip">⌘K commands</span>
            <span className="chip">? help</span>
            <span className="chip">↑ history</span>
          </span>
        </div>
      </div>
    </div>
  );
}
