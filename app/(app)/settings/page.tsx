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
    <div className="px-8 lg:px-12 py-10 lg:py-12 max-w-[820px]">
      <header className="mb-12">
        <div className="eyebrow mb-3">Settings · Volume I</div>
        <h1 className="font-display text-[34px] sm:text-[44px] lg:text-[52px] leading-[1.05] tracking-[-0.02em]">
          Account.
        </h1>
      </header>

      <div className="space-y-10 hairline-top pt-10">
        <Row label="Wallet">
          {isConnected && address ? (
            <span className="font-mono text-[14px] text-[var(--foreground)] break-all">{address}</span>
          ) : (
            <span className="font-display italic text-[15px] text-[var(--muted)]" style={{ fontVariationSettings: '"opsz" 9' }}>
              Not connected
            </span>
          )}
        </Row>

        <Row label="Network">
          <span className="font-mono text-[14px] text-[var(--foreground)]">Base</span>
        </Row>

        <Row label="Pricing">
          <span className="font-mono text-[14px] text-[var(--foreground)] tabular">
            <span className="line-through opacity-40 mr-2">$0.10 USDC</span>
            <span className="text-[var(--gold)]">Free during beta</span>
          </span>
        </Row>

        <Row label="Theme">
          <span className="font-display italic text-[15px] text-[var(--muted)]" style={{ fontVariationSettings: '"opsz" 9' }}>
            Dark · only option for now
          </span>
        </Row>

        {isConnected && (
          <div className="hairline-top pt-8">
            <button
              onClick={disconnectAndSignOut}
              className="group inline-flex items-baseline gap-2.5 px-5 py-3 hairline-x hairline-bottom border-t border-[var(--hair)] font-mono uppercase text-[10px] tracking-[0.22em] text-[var(--muted)] hover:text-[var(--danger)] hover:border-[var(--danger)] transition-colors"
            >
              Disconnect & sign out
              <span className="font-display text-[14px] leading-none translate-y-[1px] group-hover:translate-x-0.5 transition-transform">
                ↗
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-2 sm:gap-8 items-baseline">
      <div className="eyebrow">{label}</div>
      <div>{children}</div>
    </div>
  );
}
