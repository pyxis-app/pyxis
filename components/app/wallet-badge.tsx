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
            <span className="font-mono text-[11px] text-[var(--muted)] tracking-[0.18em]">
              · · ·
            </span>
          );
        }

        if (!connected) {
          return (
            <button
              onClick={openConnectModal}
              className="term-cta w-full justify-center"
            >
              connect wallet
              <span className="text-[14px] leading-none translate-y-[-1px]">›</span>
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button
              onClick={openChainModal}
              className="term-chip w-full justify-center"
              style={{ borderColor: "var(--danger)", color: "var(--danger)" }}
            >
              wrong network · switch
            </button>
          );
        }

        return (
          <div className="font-mono text-[12px]">
            <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--muted)] mb-2">
              connected
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--success)" }}
              />
              <span className="text-[var(--foreground)] truncate">
                {account.displayName}
              </span>
              <span className="text-[var(--muted)] ml-auto text-[10px]">
                {chain.name?.toLowerCase()}
              </span>
            </div>
            <button
              onClick={() => disconnect()}
              className="text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
            >
              disconnect
            </button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
