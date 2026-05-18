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
    <div className="p-6 space-y-4 max-w-2xl">
      <h1 className="text-xl font-semibold">Settings</h1>
      <div className="glass-card p-6 space-y-3">
        <div className="text-sm">
          <div className="text-[var(--muted)] text-xs mb-1">Wallet</div>
          <div className="font-mono">
            {isConnected ? address : "Not connected"}
          </div>
        </div>
        <div className="text-sm">
          <div className="text-[var(--muted)] text-xs mb-1">Theme</div>
          <div>Dark (only theme for now)</div>
        </div>
        {isConnected && (
          <button
            onClick={disconnectAndSignOut}
            className="text-sm px-3 py-2 rounded-md border border-[var(--card-border)] hover:bg-[var(--card)]"
          >
            Disconnect & sign out
          </button>
        )}
      </div>
    </div>
  );
}
