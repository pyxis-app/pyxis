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

export function AppSidebar() {
  const { isConnected, address } = useAccount();
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);

  useEffect(() => {
    if (!isConnected) return;
    fetch("/api/history")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setHistory(j?.sessions?.slice(0, 10) ?? null))
      .catch(() => setHistory(null));
  }, [isConnected, address]);

  return (
    <aside className="w-[280px] shrink-0 border-r border-[var(--card-border)] flex flex-col">
      <div className="p-4 flex items-center gap-2 border-b border-[var(--card-border)]">
        <Image src="/logo.png" alt="Pyxis" width={24} height={24} />
        <span className="font-semibold">Pyxis</span>
      </div>
      <div className="p-4">
        <Link
          href="/research"
          className="block w-full text-center py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-[#3b82f6] to-[#1e40af]"
        >
          + New research
        </Link>
      </div>
      <div className="flex-1 overflow-auto px-2">
        <div className="text-xs uppercase tracking-wider text-[var(--muted)] px-2 py-2">
          History
        </div>
        {!isConnected ? (
          <div className="text-xs text-[var(--muted)] px-2">
            <Link href="/research" className="underline">
              Sign in
            </Link>{" "}
            to see history
          </div>
        ) : history === null ? (
          <div className="text-xs text-[var(--muted)] px-2">Loading…</div>
        ) : history.length === 0 ? (
          <div className="text-xs text-[var(--muted)] px-2">No sessions yet</div>
        ) : (
          <ul className="space-y-1">
            {history.map((h) => (
              <li key={h.id}>
                <Link
                  href={`/history#${h.id}`}
                  className="block px-2 py-1.5 rounded-md text-[13px] hover:bg-[var(--card)] truncate"
                  title={h.topic}
                >
                  → {h.topic}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="p-4 border-t border-[var(--card-border)] flex items-center justify-between gap-2">
        <WalletBadge />
        <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
          <Link href="/settings" className="hover:text-white" title="Settings">
            Settings
          </Link>
        </div>
      </div>
    </aside>
  );
}
