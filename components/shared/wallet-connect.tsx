"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

/**
 * Editorial-themed wrapper around RainbowKit's ConnectButton.
 * Uses ConnectButton.Custom so the visual matches the rest of the site
 * (mono-caps tracking-wide, hairline borders, gold accents) instead of
 * the default blue rounded widget.
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
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
              · · ·
            </span>
          );
        }

        if (!connected) {
          return (
            <button
              onClick={openConnectModal}
              className="group inline-flex items-baseline gap-2 px-3.5 py-1.5 border border-[var(--hair)] hover:border-[var(--gold)] font-mono uppercase text-[11px] tracking-[0.22em] text-[var(--foreground)]/85 hover:text-[var(--foreground)] transition-colors"
            >
              Connect
              <span className="font-display text-[12px] leading-none translate-y-[1px] group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button
              onClick={openChainModal}
              className="px-3 py-1.5 border border-[var(--danger)] font-mono uppercase text-[11px] tracking-[0.22em] text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors"
            >
              Wrong network
            </button>
          );
        }

        return (
          <button
            onClick={openAccountModal}
            className="group inline-flex items-center gap-2 px-3 py-1.5 border border-[var(--hair)] hover:border-[var(--gold)] font-mono text-[11px] tracking-[0.05em] text-[var(--foreground)]/85 hover:text-[var(--foreground)] transition-colors"
            title="Manage wallet"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]" />
            {account.displayName}
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}
