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
  const [needsAuth, setNeedsAuth] = useState(false);

  useEffect(() => {
    if (!isConnected) return;
    fetch("/api/history")
      .then(async (r) => {
        // 401 = wallet connected but no SIWE session. Distinct from "loading"
        // so the UI can prompt sign-in instead of spinning forever.
        if (r.status === 401) {
          setNeedsAuth(true);
          return;
        }
        if (!r.ok) return;
        const j = await r.json();
        setNeedsAuth(false);
        setHistory(j?.sessions?.slice(0, 12) ?? []);
      })
      .catch(() => {});
  }, [isConnected, address]);

  return (
    <aside className="w-[240px] shrink-0 border-r border-[var(--hair)] flex flex-col bg-[var(--background)]/85 backdrop-blur-md">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-[var(--hair)]">
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/logo.png"
            alt=""
            width={22}
            height={22}
            className="opacity-95 group-hover:opacity-100 transition-opacity"
          />
          <span className="font-mono text-[15px] text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
            pyxis
          </span>
          <span
            className="ml-auto font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--muted)] border border-[var(--hair)] px-1.5 py-0.5 rounded"
            style={{ borderRadius: 4 }}
          >
            free beta
          </span>
        </Link>
      </div>

      {/* New research */}
      <div className="px-5 py-4 border-b border-[var(--hair)]">
        <Link href="/research" className="term-cta w-full justify-center">
          + new run
          <span className="text-[14px] leading-none translate-y-[-1px]">›</span>
        </Link>
      </div>

      {/* History list */}
      <div className="flex-1 overflow-auto py-4">
        <div className="px-5 mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">
          // history
        </div>
        {!isConnected ? (
          <div className="px-5 font-mono text-[12px] text-[var(--muted)] leading-[1.6]">
            connect a wallet to begin tracking research.
          </div>
        ) : needsAuth ? (
          <Link
            href="/history"
            className="block px-5 font-mono text-[12px] text-[var(--accent)] hover:text-[var(--scout)] leading-[1.6] transition-colors"
          >
            sign in to view your research history ↗
          </Link>
        ) : history === null ? (
          <div className="px-5 font-mono text-[12px] text-[var(--muted)]">loading…</div>
        ) : history.length === 0 ? (
          <div className="px-5 font-mono text-[12px] text-[var(--muted)] leading-[1.6]">
            no briefings yet. your first session will appear here.
          </div>
        ) : (
          <ul>
            {history.map((h) => (
              <li key={h.id}>
                <Link
                  href={`/history#${h.id}`}
                  className="block px-5 py-2 group hover:bg-[var(--hair)]/40 transition-colors"
                  title={h.topic}
                >
                  <div className="font-mono text-[13px] text-[var(--foreground)] opacity-85 group-hover:opacity-100 truncate">
                    <span className="text-[var(--muted)] mr-1">▸</span>
                    {h.topic}
                  </div>
                  <div className="font-mono text-[10px] text-[var(--muted)] mt-0.5 pl-3">
                    {relativeTime(h.createdAt)}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer — wallet + settings */}
      <div className="px-5 py-4 border-t border-[var(--hair)]">
        <WalletBadge />
        <div className="mt-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">
          <Link href="/settings" className="hover:text-[var(--accent)] transition-colors">
            settings
          </Link>
          <Link href="/" className="hover:text-[var(--accent)] transition-colors">
            landing ↗
          </Link>
        </div>
        <div className="mt-3 font-mono text-[10px] text-[var(--muted)] opacity-60">
          pyxis v3.0.0 · agpl-3.0
        </div>
      </div>
    </aside>
  );
}
