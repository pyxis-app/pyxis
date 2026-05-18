"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useDisconnect } from "wagmi";

export function WalletBadge() {
  const { disconnect } = useDisconnect();

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, openChainModal, mounted, authenticationStatus }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready && account && chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        if (!ready) {
          return (
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--gold-soft)]">
              Loading…
            </div>
          );
        }

        if (!connected) {
          return (
            <button
              onClick={openConnectModal}
              className="group inline-flex items-baseline gap-2.5 px-3 py-2 w-full justify-center bg-[var(--gold)] text-[var(--background)] font-mono uppercase text-[10px] tracking-[0.22em] hover:bg-[var(--foreground)] transition-colors duration-300"
            >
              Connect wallet
              <span className="font-display text-[13px] leading-none translate-y-[1px] group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button
              onClick={openChainModal}
              className="text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--danger)] hover:text-[var(--foreground)] editorial-link"
            >
              Wrong network · switch
            </button>
          );
        }

        return (
          <div>
            <div className="eyebrow mb-1.5">Connected</div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]" />
              <span className="font-mono text-[12px] text-[var(--foreground)]">
                {account.displayName}
              </span>
            </div>
            <button
              onClick={() => disconnect()}
              className="text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--muted)] hover:text-[var(--foreground)] editorial-link"
            >
              Disconnect
            </button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
