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
    const r = await fetch("/api/history");
    if (r.ok) setSessions((await r.json()).sessions);
  }

  return (
    <div className="px-8 lg:px-12 py-10 lg:py-12 max-w-[1100px]">
      <header className="mb-12">
        <div className="eyebrow mb-3">Archive · Volume I</div>
        <h1 className="font-display text-[34px] sm:text-[44px] lg:text-[52px] leading-[1.05] tracking-[-0.02em]">
          Past{" "}
          <span className="italic" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144' }}>
            briefings
          </span>.
        </h1>
      </header>

      {!isConnected ? (
        <EmptyMessage text="Connect a wallet to see briefings tied to your address." />
      ) : needsAuth ? (
        <div className="hairline-top pt-8">
          <p className="font-display italic text-[18px] text-[var(--foreground)]/85 mb-6 max-w-md" style={{ fontVariationSettings: '"opsz" 9' }}>
            Sign in with your wallet to retrieve briefings stored on the server.
          </p>
          <button
            onClick={authenticate}
            className="group inline-flex items-baseline gap-2.5 px-5 py-3 bg-[var(--foreground)] text-[var(--background)] font-mono uppercase text-[10px] tracking-[0.22em] hover:bg-[var(--gold)] transition-colors duration-300"
          >
            Sign in with Ethereum
            <span className="font-display text-[14px] leading-none translate-y-[1px] group-hover:translate-x-0.5 transition-transform">
              →
            </span>
          </button>
        </div>
      ) : sessions === null ? (
        <EmptyMessage text="Loading…" />
      ) : sessions.length === 0 ? (
        <EmptyMessage text="No briefings yet. Your first session will appear here." />
      ) : (
        <div className="space-y-20 hairline-top pt-12">
          {sessions.map((s, i) => (
            <div key={s.id} id={s.id} className={i > 0 ? "hairline-top pt-20" : ""}>
              <BriefingCard b={s} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyMessage({ text }: { text: string }) {
  return (
    <div className="hairline-top pt-10">
      <p className="font-display italic text-[18px] text-[var(--muted)] max-w-md" style={{ fontVariationSettings: '"opsz" 9' }}>
        {text}
      </p>
    </div>
  );
}
