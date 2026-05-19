"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

/**
 * Terminal-themed wrapper around RainbowKit's ConnectButton.
 * Uses ConnectButton.Custom so the visual matches the rest of the site
 * (term-chip / term-cta, mono, accent glow) instead of the default blue widget.
 */
export function WalletConnect() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openConnectModal,
        openAccountModal,
        openChainModal,
        mounted,
        authenticationStatus,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
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
            <button onClick={openConnectModal} className="term-cta outline">
              connect
              <span className="text-[14px] leading-none translate-y-[-1px]">›</span>
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button
              onClick={openChainModal}
              className="term-chip"
              style={{
                borderColor: "var(--danger)",
                color: "var(--danger)",
              }}
            >
              wrong network · switch
            </button>
          );
        }

        return (
          <button
            onClick={openAccountModal}
            className="term-chip"
            title="Manage wallet"
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full mr-2"
              style={{ background: "var(--success)" }}
            />
            <span className="font-mono text-[12px]">{account.displayName}</span>
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}
