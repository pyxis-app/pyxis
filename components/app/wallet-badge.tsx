"use client";

import { useAccount, useDisconnect } from "wagmi";

export function WalletBadge() {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  if (!isConnected || !address) {
    return <div className="text-xs text-[var(--muted)]">Not connected</div>;
  }
  const short = address.slice(0, 6) + "…" + address.slice(-4);
  return (
    <div className="text-xs">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full" />
        <span className="font-mono">{short}</span>
      </div>
      <button
        onClick={() => disconnect()}
        className="text-[var(--muted)] hover:text-white text-[11px]"
      >
        Disconnect
      </button>
    </div>
  );
}
