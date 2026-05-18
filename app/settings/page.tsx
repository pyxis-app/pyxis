"use client";

import { Settings } from "lucide-react";
import { FloatingCard } from "@/components/shared/floating-card";

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Settings className="w-7 h-7 text-[var(--accent)]" />
          Settings
        </h1>
        <p className="text-sm text-[var(--muted)] mt-1">Pyxis configuration</p>
      </div>

      <FloatingCard>
        <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">
          About
        </h2>
        <div className="text-sm text-[var(--muted)] space-y-1.5">
          <p>Pyxis — Web3 Intelligence Swarm</p>
          <p>Pricing: $0.25 USDC per research session</p>
          <p>Network: Base Sepolia</p>
        </div>
      </FloatingCard>

      <p className="text-xs text-[var(--muted)]">
        Wallet controls and preference toggles will appear here once the app workspace
        is wired up.
      </p>
    </div>
  );
}
