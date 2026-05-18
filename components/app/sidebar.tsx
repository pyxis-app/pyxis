"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { WalletBadge } from "./wallet-badge";

interface HistoryEntry {
  id: string;
  topic: string;
  createdAt: string;
}

function relativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  const dt = Math.max(0, Date.now() - t);
  const m = Math.floor(dt / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

export function AppSidebar() {
  const { isConnected, address } = useAccount();
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);

  useEffect(() => {
    if (!isConnected) return;
    fetch("/api/history")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setHistory(j?.sessions?.slice(0, 12) ?? null))
      .catch(() => setHistory(null));
  }, [isConnected, address]);

  return (
    <aside className="w-[260px] shrink-0 hairline-x flex flex-col bg-[var(--background)]/40">
      {/* Brand */}
      <Link href="/" className="px-5 py-5 flex items-baseline gap-2 hairline-bottom group">
        <Image src="/logo.png" alt="" width={22} height={22} className="opacity-90 group-hover:opacity-100" />
        <span className="font-display text-[18px] leading-none">Pyxis</span>
        <span className="eyebrow text-[9px] opacity-60 ml-auto">Vol. I</span>
      </Link>

      {/* New research */}
      <div className="px-5 py-5 hairline-bottom">
        <Link
          href="/research"
          className="group inline-flex items-baseline gap-3 w-full justify-between px-3 py-2.5 bg-[var(--foreground)] text-[var(--background)] font-mono uppercase text-[10px] tracking-[0.22em] hover:bg-[var(--gold)] transition-colors duration-300"
        >
          New research
          <span className="font-display text-[14px] leading-none translate-y-[1px] group-hover:translate-x-0.5 transition-transform">
            →
          </span>
        </Link>
      </div>

      {/* History list */}
      <div className="flex-1 overflow-auto px-5 py-5">
        <div className="eyebrow mb-4">Recent</div>
        {!isConnected ? (
          <div className="text-[12px] text-[var(--muted)] italic font-display" style={{ fontVariationSettings: '"opsz" 9' }}>
            Connect a wallet to begin tracking research.
          </div>
        ) : history === null ? (
          <div className="text-[12px] text-[var(--muted)]">Loading…</div>
        ) : history.length === 0 ? (
          <div className="text-[12px] text-[var(--muted)] italic font-display" style={{ fontVariationSettings: '"opsz" 9' }}>
            No briefings yet. Your first session will appear here.
          </div>
        ) : (
          <ul className="space-y-3">
            {history.map((h) => (
              <li key={h.id}>
                <Link
                  href={`/history#${h.id}`}
                  className="block group"
                  title={h.topic}
                >
                  <div className="flex items-baseline justify-between gap-2 mb-0.5">
                    <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--gold-soft)]">
                      {relativeTime(h.createdAt)}
                    </span>
                  </div>
                  <div className="font-display text-[13.5px] leading-tight text-[var(--foreground)]/85 group-hover:text-[var(--foreground)] truncate">
                    {h.topic}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer — wallet + settings */}
      <div className="px-5 py-5 hairline-top">
        <WalletBadge />
        <div className="mt-4 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--gold-soft)]">
          <Link href="/settings" className="editorial-link hover:text-[var(--gold)]">
            Settings
          </Link>
          <Link href="/" className="editorial-link hover:text-[var(--gold)]">
            Landing ↗
          </Link>
        </div>
      </div>
    </aside>
  );
}
