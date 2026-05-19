"use client";

import Link from "next/link";
import Image from "next/image";
import { WalletConnect } from "@/components/shared/wallet-connect";

export function LandingNav() {
  return (
    <nav className="sticky top-0 z-50 bg-[var(--background)]/85 backdrop-blur-md border-b border-[var(--hair)]">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Left: logo + pyxis + beta badge */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/logo.png"
            alt=""
            width={26}
            height={26}
            priority
            className="opacity-95 group-hover:opacity-100 transition-opacity"
          />
          <span className="font-mono text-[15px] tracking-tight text-[var(--foreground)]">
            pyxis
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--scout)] border border-[var(--hair)] rounded px-1.5 py-0.5 ml-1.5">
            free beta
          </span>
        </Link>

        {/* Center: nav links */}
        <div className="hidden md:flex items-center gap-7 font-mono text-[12px] text-[var(--muted)]">
          <a href="#method" className="hover:text-[var(--foreground)] transition-colors">
            method
          </a>
          <a href="#briefing" className="hover:text-[var(--foreground)] transition-colors">
            briefing
          </a>
          <a href="#pricing" className="hover:text-[var(--foreground)] transition-colors">
            pricing
          </a>
          <a
            href="https://github.com/pyxis-app/pyxis"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--foreground)] transition-colors"
          >
            github
          </a>
        </div>

        {/* Right: wallet + launch */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <WalletConnect />
          </div>
          <Link
            href="/research"
            className="group inline-flex items-baseline gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--accent)] hover:text-[var(--scout)] transition-colors px-3 py-1.5 border border-[var(--accent)]/40 rounded-md hover:border-[var(--scout)]/60"
          >
            launch
            <span className="text-[14px] leading-none translate-y-[1px] group-hover:translate-x-0.5 transition-transform">
              ›
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
