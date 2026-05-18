"use client";

import Image from "next/image";
import Link from "next/link";
import { WalletConnect } from "@/components/shared/wallet-connect";

export function LandingNav() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-[var(--background)]/70 border-b border-[var(--card-border)]">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Pyxis" width={28} height={28} />
          <span className="font-semibold tracking-tight">Pyxis</span>
        </Link>
        <div className="flex items-center gap-3">
          <WalletConnect />
          <Link
            href="/research"
            className="text-sm px-3 py-1.5 rounded-md hover:bg-[var(--card)]"
          >
            Open app →
          </Link>
        </div>
      </div>
    </nav>
  );
}
