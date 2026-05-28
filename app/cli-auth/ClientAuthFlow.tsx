"use client";

import { useState, useEffect } from "react";
import { useAccount, useChainId, useConfig } from "wagmi";
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

  async function handleContinue() {
    setError(null);
    try {
      if (!isConnected || !address) {
        setPhase("signing");
        await signInWithEthereum({ config, address: address!, chainId });
      }
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
      <div className="mt-6 rounded border border-red-700 bg-red-950/30 p-4">
        <p className="text-sm text-red-200">Error: {error}</p>
        <button
          onClick={() => { setPhase("idle"); setError(null); }}
          className="mt-3 rounded bg-red-700 px-3 py-1.5 text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (phase === "redirecting") {
    return (
      <p className="mt-6 text-sm text-zinc-400">
        Redirecting back to your terminal… You can close this tab.
      </p>
    );
  }

  if (phase !== "idle") {
    return (
      <p className="mt-6 text-sm text-zinc-400">
        {phase === "signing" && "Waiting for wallet signature…"}
        {phase === "reserving" && "Reserving session…"}
      </p>
    );
  }

  if (isConnected && address) {
    return (
      <div className="mt-6 space-y-3">
        <p className="text-sm">
          Grant CLI access to wallet{" "}
          <code className="rounded bg-zinc-800 px-2 py-0.5">
            {address.slice(0, 6)}…{address.slice(-4)}
          </code>?
        </p>
        <button
          onClick={handleContinue}
          className="w-full rounded bg-cyan-600 py-2 text-sm font-medium hover:bg-cyan-500"
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <p className="text-sm text-zinc-400">
        Sign in with your wallet to continue.
      </p>
      <button
        onClick={handleContinue}
        className="mt-3 w-full rounded bg-cyan-600 py-2 text-sm font-medium hover:bg-cyan-500"
      >
        Sign in with wallet
      </button>
    </div>
  );
}
