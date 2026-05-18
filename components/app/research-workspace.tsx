"use client";

import { useState } from "react";
import { useAccount, useChainId, useConfig } from "wagmi";
import { getWalletClient } from "wagmi/actions";
import { wrapFetchWithPayment } from "x402-fetch";
import { TopicInput } from "./topic-input";
import { BriefingCard, type Briefing } from "./briefing-card";
import { ProbeNodeGraph } from "@/components/shared/probe-node-graph";
import { signInWithEthereum } from "@/lib/siwe-client";

type State =
  | { kind: "idle" }
  | { kind: "running" }
  | { kind: "done"; briefing: Briefing }
  | { kind: "error"; message: string };

export function ResearchWorkspace() {
  const [topic, setTopic] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const config = useConfig();

  async function start() {
    if (!isConnected || !address) return;

    // Best-effort SIWE so the resulting session is persisted to history.
    try {
      await signInWithEthereum({ config, address, chainId });
    } catch {
      /* ignore — history just won't load without auth */
    }

    setState({ kind: "running" });
    try {
      // wagmi WalletClient → wrap fetch to satisfy 402 challenges.
      // wrapFetchWithPayment's signer type is the viem WalletClient that
      // getWalletClient returns, so we cast through unknown to avoid the
      // overly-restrictive Signer narrowing in x402-fetch's d.ts.
      let paidFetch: (
        input: RequestInfo,
        init?: RequestInit
      ) => Promise<Response> = (input, init) => fetch(input, init);
      try {
        const walletClient = await getWalletClient(config);
        if (walletClient) {
          paidFetch = wrapFetchWithPayment(
            fetch,
            walletClient as unknown as Parameters<typeof wrapFetchWithPayment>[1]
          );
        }
      } catch {
        /* fall back to plain fetch — endpoint will reject with 402 */
      }

      const res = await paidFetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const b = (await res.json()) as Briefing;
      setState({ kind: "done", briefing: b });
    } catch (err) {
      setState({
        kind: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <h1 className="text-xl font-semibold">New research</h1>
      <TopicInput
        value={topic}
        onChange={setTopic}
        onSubmit={start}
        disabled={state.kind === "running" || !isConnected}
      />
      {!isConnected && (
        <p className="text-xs text-[var(--muted)]">
          Connect a wallet in the sidebar to start.
        </p>
      )}

      <div className="mt-8">
        {state.kind === "idle" && (
          <div className="text-sm text-[var(--muted)]">
            Try: &ldquo;Modular DA layers in 2026&rdquo; &middot; &ldquo;Liquid
            restaking risks&rdquo; &middot; &ldquo;Solana payments adoption&rdquo;
          </div>
        )}
        {state.kind === "running" && (
          <div className="aspect-video">
            <ProbeNodeGraph live />
          </div>
        )}
        {state.kind === "done" && <BriefingCard b={state.briefing} />}
        {state.kind === "error" && (
          <div className="glass-card p-4 text-sm text-[var(--danger)]">
            Something went wrong: {state.message}
          </div>
        )}
      </div>
    </div>
  );
}
