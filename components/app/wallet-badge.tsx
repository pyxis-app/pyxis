"use client";

import { useAccount, useDisconnect } from "wagmi";

export function WalletBadge() {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();

  if (!isConnected || !address) {
    return (
      <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--gold-soft)]">
        Wallet · not connected
      </div>
    );
  }
  const short = address.slice(0, 6) + "…" + address.slice(-4);
  return (
    <div>
      <div className="eyebrow mb-1.5">Connected</div>
      <div className="flex items-center gap-2 mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]" />
        <span className="font-mono text-[12px] text-[var(--foreground)]">{short}</span>
      </div>
      <button
        onClick={() => disconnect()}
        className="text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--muted)] hover:text-[var(--foreground)] editorial-link"
      >
        Disconnect
      </button>
    </div>
  );
}
