"use client";

import { useAccount, useDisconnect } from "wagmi";
import { signOut } from "@/lib/siwe-client";

export default function SettingsPage() {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();

  function disconnectAndSignOut() {
    disconnect();
    // Clear the SIWE session cookie client-side so the next /api/history
    // call returns 401 instead of serving the stale wallet's sessions.
    signOut().catch(() => {
      /* signOut is best-effort */
    });
  }

  return (
    <div className="px-6 lg:px-10 py-6 lg:py-8 max-w-[820px]">
      <header className="mb-8 flex items-center gap-3 flex-wrap">
        <span className="term-section-tag">// settings</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
          account · preferences · about
        </span>
      </header>
      <h2 className="font-mono text-[22px] lg:text-[28px] font-semibold tracking-[-0.005em] text-[var(--foreground)] lowercase mb-8">
        settings
      </h2>

      <div className="space-y-4">
        {/* Wallet */}
        <div className="term-block">
          <div className="term-block-head">
            <span>
              <span className="dim">╭─</span> wallet{" "}
              <span className="dim">──────────────────</span>
            </span>
            <span className="live-pill">
              [ {isConnected ? "connected" : "disconnected"} ]
            </span>
          </div>
          <Row label="address">
            {isConnected && address ? (
              <span className="font-mono text-[13px] text-[var(--foreground)] break-all">
                {address}
              </span>
            ) : (
              <span className="font-mono text-[13px] text-[var(--muted)]">
                not connected
              </span>
            )}
          </Row>
          <Row label="network">
            <span className="font-mono text-[13px] text-[var(--foreground)]">base</span>
          </Row>
          {isConnected && (
            <div className="pt-3 mt-3 border-t border-[var(--hair)]">
              <button onClick={disconnectAndSignOut} className="term-chip">
                disconnect & sign out
                <span className="ml-2 text-[14px] leading-none translate-y-[-1px]">↗</span>
              </button>
            </div>
          )}
        </div>

        {/* Preferences */}
        <div className="term-block">
          <div className="term-block-head">
            <span>
              <span className="dim">╭─</span> preferences{" "}
              <span className="dim">───────────────</span>
            </span>
          </div>
          <Row label="theme">
            <span className="font-mono text-[13px] text-[var(--muted)]">
              dark · only option for now
            </span>
          </Row>
          <Row label="default mode">
            <span className="font-mono text-[13px] text-[var(--foreground)]">
              read mode <span className="text-[var(--muted)]">(briefings)</span>
            </span>
          </Row>
        </div>

        {/* Account / billing */}
        <div className="term-block">
          <div className="term-block-head">
            <span>
              <span className="dim">╭─</span> account{" "}
              <span className="dim">─────────────────</span>
            </span>
            <span className="live-pill">[ free beta ]</span>
          </div>
          <Row label="pricing">
            <span className="font-mono text-[13px] text-[var(--foreground)] tabular-nums">
              <span className="line-through opacity-40 mr-2">$0.10 USDC</span>
              <span className="text-[var(--accent)]">free during beta</span>
            </span>
          </Row>
          <Row label="quota">
            <span className="font-mono text-[13px] text-[var(--foreground)]">
              5 runs/day
            </span>
          </Row>
        </div>

        {/* About */}
        <div className="term-block">
          <div className="term-block-head">
            <span>
              <span className="dim">╭─</span> about{" "}
              <span className="dim">───────────────────</span>
            </span>
          </div>
          <Row label="version">
            <span className="font-mono text-[13px] text-[var(--foreground)]">
              pyxis v0.4.1
            </span>
          </Row>
          <Row label="license">
            <span className="font-mono text-[13px] text-[var(--foreground)]">
              agpl-3.0
            </span>
          </Row>
          <Row label="source">
            <a
              href="https://github.com/pyxis-app/pyxis"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[13px] text-[var(--accent)] hover:text-[var(--scout)] transition-colors"
            >
              github.com/pyxis-app/pyxis ↗
            </a>
          </Row>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-6 items-baseline py-2">
      <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
        {label}
      </div>
      <div>{children}</div>
    </div>
  );
}
