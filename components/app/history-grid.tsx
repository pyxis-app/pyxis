"use client";

import { useEffect, useState } from "react";
import { useAccount, useChainId, useConfig } from "wagmi";
import { signInWithEthereum } from "@/lib/siwe-client";
import { BriefingCard, type Briefing } from "./briefing-card";

function relativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  const dt = Math.max(0, Date.now() - t);
  const m = Math.floor(dt / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

export function HistoryGrid() {
  const [sessions, setSessions] = useState<Briefing[] | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
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

  function toggle(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="px-6 lg:px-10 py-6 lg:py-8 max-w-[1100px]">
      <header className="mb-8 flex items-center gap-3 flex-wrap">
        <span className="term-section-tag">// history</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
          past briefings · tied to your wallet
        </span>
      </header>
      <h2 className="font-mono text-[22px] lg:text-[28px] font-semibold tracking-[-0.005em] text-[var(--foreground)] lowercase mb-8">
        research history
      </h2>

      {!isConnected ? (
        <EmptyBlock title="not connected" body="connect a wallet to see briefings tied to your address." />
      ) : needsAuth ? (
        <div className="term-block">
          <div className="term-block-head">
            <span>
              <span className="dim">╭─</span> sign-in <span className="dim">────────────────</span>
            </span>
            <span className="live-pill">[ siwe required ]</span>
          </div>
          <p className="font-mono text-[14px] leading-[1.6] text-[var(--foreground)] opacity-90 mb-4">
            sign in with your wallet to retrieve briefings stored on the server.
          </p>
          <button onClick={authenticate} className="term-cta">
            sign in with ethereum
            <span className="text-[16px] leading-none translate-y-[-1px]">›</span>
          </button>
        </div>
      ) : sessions === null ? (
        <EmptyBlock title="loading" body="fetching your briefings…" />
      ) : sessions.length === 0 ? (
        <EmptyBlock
          title="no runs yet"
          body="> no briefings yet. your first session will appear here."
        />
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const isExpanded = !!expanded[s.id];
            const topicType = s.topicType ?? "topic";
            const fresh = s.freshness?.length ?? 0;
            return (
              <div key={s.id} id={s.id}>
                {!isExpanded ? (
                  <button
                    type="button"
                    onClick={() => toggle(s.id)}
                    className="term-block w-full text-left"
                    style={{ cursor: "pointer" }}
                  >
                    <div className="term-block-head">
                      <span>
                        <span className="dim">╭─</span> <b>{s.topic}</b>{" "}
                        <span className="dim">·</span> {topicType}{" "}
                        <span className="dim">·</span> {relativeTime(s.createdAt)}{" "}
                        <span className="dim">──[</span>
                        {s.sources} sources · 5 agents · ▾ expand
                        <span className="dim">]─╮</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 font-mono text-[11px]">
                      <span className="term-chip" style={{ cursor: "default" }}>
                        {s.sources} sources
                      </span>
                      <span className="term-chip" style={{ cursor: "default" }}>
                        {s.partial ? "partial" : "full"}
                      </span>
                      {fresh > 0 && (
                        <span className="term-chip" style={{ cursor: "default" }}>
                          {fresh} sources tracked
                        </span>
                      )}
                    </div>
                  </button>
                ) : (
                  <div>
                    <div className="mb-2">
                      <button
                        type="button"
                        onClick={() => toggle(s.id)}
                        className="term-chip"
                      >
                        ▴ collapse
                      </button>
                    </div>
                    <BriefingCard b={s} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmptyBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="term-block">
      <div className="term-block-head">
        <span>
          <span className="dim">╭─</span> {title}{" "}
          <span className="dim">──────────────────</span>
        </span>
      </div>
      <p className="font-mono text-[14px] leading-[1.6] text-[var(--muted)]">{body}</p>
    </div>
  );
}
