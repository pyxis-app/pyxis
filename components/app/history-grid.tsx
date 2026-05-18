"use client";

import { useEffect, useState } from "react";
import { useAccount, useChainId, useConfig } from "wagmi";
import { signInWithEthereum } from "@/lib/siwe-client";
import { BriefingCard, type Briefing } from "./briefing-card";

export function HistoryGrid() {
  const [sessions, setSessions] = useState<Briefing[] | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const config = useConfig();

  useEffect(() => {
    if (!isConnected) return;
    fetch("/api/history")
      .then(async (r) => {
        if (r.status === 401) {
          setNeedsAuth(true);
          return null;
        }
        if (!r.ok) return null;
        const j = await r.json();
        return j.sessions as Briefing[];
      })
      .then(setSessions);
  }, [isConnected, address]);

  async function authenticate() {
    if (!address) return;
    await signInWithEthereum({ config, address, chainId });
    setNeedsAuth(false);
    // re-trigger fetch
    const r = await fetch("/api/history");
    if (r.ok) setSessions((await r.json()).sessions);
  }

  if (!isConnected) {
    return (
      <p className="p-6 text-sm text-[var(--muted)]">
        Connect a wallet to see history.
      </p>
    );
  }
  if (needsAuth) {
    return (
      <div className="p-6">
        <p className="text-sm text-[var(--muted)] mb-4">
          Sign in to access your history.
        </p>
        <button
          onClick={authenticate}
          className="px-4 py-2 rounded-md text-sm bg-gradient-to-r from-[#3b82f6] to-[#1e40af] text-white"
        >
          Sign in with Ethereum
        </button>
      </div>
    );
  }
  if (sessions === null) {
    return <p className="p-6 text-sm text-[var(--muted)]">Loading…</p>;
  }
  if (sessions.length === 0) {
    return <p className="p-6 text-sm text-[var(--muted)]">No sessions yet.</p>;
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <h1 className="text-xl font-semibold">History</h1>
      {sessions.map((s) => (
        <div key={s.id} id={s.id}>
          <BriefingCard b={s} />
        </div>
      ))}
    </div>
  );
}
