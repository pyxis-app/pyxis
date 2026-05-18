"use client";

import Link from "next/link";
import Image from "next/image";
import { WalletConnect } from "@/components/shared/wallet-connect";

export function LandingNav() {
  return (
    <nav className="sticky top-0 z-50 bg-[var(--background)]/85 backdrop-blur-sm hairline-bottom">
      <div className="max-w-[1280px] mx-auto px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/logo.png"
            alt=""
            width={26}
            height={26}
            className="opacity-90 group-hover:opacity-100 transition"
          />
          <div className="flex items-baseline gap-2">
            <span className="font-display text-[19px] leading-none">Pyxis</span>
            <span className="eyebrow text-[10px] opacity-60">Vol. I</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-[13px] text-[var(--muted)]">
          <a href="#method" className="editorial-link hover:text-[var(--foreground)]">
            Method
          </a>
          <a href="#briefing" className="editorial-link hover:text-[var(--foreground)]">
            Briefing
          </a>
          <a href="#pricing" className="editorial-link hover:text-[var(--foreground)]">
            Pricing
          </a>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <WalletConnect />
          </div>
          <Link
            href="/research"
            className="group inline-flex items-baseline gap-2 text-[12px] font-mono uppercase tracking-[0.22em] text-[var(--gold)] hover:text-[var(--foreground)] transition-colors"
          >
            Open app
            <span className="font-display text-[13px] leading-none translate-y-[1px] group-hover:translate-x-0.5 transition-transform">
              →
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
