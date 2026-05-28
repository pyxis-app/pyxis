"use client";

import { useState, useEffect } from "react";
import { useAccount, useChainId, useConfig } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { signInWithEthereum } from "@/lib/siwe-client";

interface Props {
  state: string;
  port: number;
  challenge: string;
}

export function ClientAuthFlow({ state, port, challenge }: Props) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const config = useConfig();
  const [phase, setPhase] = useState<"idle" | "signing" | "reserving" | "redirecting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window !== window.top) {
      setPhase("error");
      setError("This page cannot be embedded.");
    }
  }, []);

  async function handleSignIn() {
    if (!isConnected || !address) return;
    setError(null);
    try {
      setPhase("signing");
      await signInWithEthereum({ config, address, chainId });
      setPhase("reserving");
      const res = await fetch("/api/cli/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challenge }),
      });
      if (!res.ok) {
        const { error: err } = await res.json().catch(() => ({ error: "unknown" }));
        throw new Error(err);
      }
      setPhase("redirecting");
      window.location.href = `http://localhost:${port}/?state=${encodeURIComponent(state)}&code=${encodeURIComponent(challenge)}`;
    } catch (e) {
      setPhase("error");
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  if (phase === "error") {
    return (
      <div
        className="mt-6 term-block"
        style={{ borderColor: "var(--danger)" }}
      >
        <div className="term-block-head">
          <span>
            <span className="dim">╭─</span> error{" "}
            <span className="dim">──────────────</span>
          </span>
          <span style={{ color: "var(--danger)" }}>[ auth interrupted ]</span>
        </div>
        <p className="font-mono text-[13px] leading-[1.6] text-[var(--foreground)] opacity-90 break-all mb-4">
          {error}
        </p>
        <button
          onClick={() => { setPhase("idle"); setError(null); }}
          className="term-cta outline"
        >
          retry
          <span className="text-[14px] leading-none translate-y-[-1px]">›</span>
        </button>
      </div>
    );
  }

  if (phase === "redirecting") {
    return (
      <p className="mt-6 font-mono text-[13px] text-[var(--muted)]">
        Redirecting back to your terminal… You can close this tab.
      </p>
    );
  }

  if (phase !== "idle") {
    return (
      <p className="mt-6 font-mono text-[13px] text-[var(--muted)]">
        {phase === "signing" && "Waiting for wallet signature…"}
        {phase === "reserving" && "Reserving session…"}
      </p>
    );
  }

  // Connected + has address → ready to SIWE.
  if (isConnected && address) {
    return (
      <div className="mt-6 space-y-3">
        <p className="font-mono text-[13px] text-[var(--foreground)]">
          Grant CLI access to wallet{" "}
          <code className="term-chip" style={{ cursor: "default" }}>
            {address.slice(0, 6)}…{address.slice(-4)}
          </code>
          ?
        </p>
        <button onClick={handleSignIn} className="term-cta">
          sign in with wallet
          <span className="text-[16px] leading-none translate-y-[-1px]">›</span>
        </button>
      </div>
    );
  }

  // Not connected → show RainbowKit connect modal trigger.
  return (
    <div className="mt-6 space-y-3">
      <p className="font-mono text-[13px] text-[var(--muted)]">
        Connect your wallet to continue.
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
  );
}
