"use client";

import Link from "next/link";
import Image from "next/image";

export function DocsNav({ onMenu }: { onMenu: () => void }) {
  return (
    <nav className="sticky top-0 z-[60] flex h-[54px] items-center justify-between border-b border-[var(--hair)] bg-[var(--background)]/85 px-5 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenu}
          aria-label="Toggle navigation"
          className="flex h-[34px] w-[34px] items-center justify-center rounded-md border border-[var(--hair)] text-[var(--foreground)] md:hidden"
        >
          ☰
        </button>
        <Link href="/docs" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="" width={24} height={24} className="opacity-95" />
          <span className="font-mono text-[15px] tracking-tight">pyxis</span>
          <span className="font-mono text-[13px] text-[var(--muted)]">/</span>
          <span className="font-mono text-[13px] text-[var(--accent)]">docs</span>
          <span className="ml-1 hidden rounded border border-[var(--hair)] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--scout)] sm:inline">
            free beta
          </span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <a
          href="https://github.com/pyxis-app/pyxis"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden font-mono text-[12px] text-[var(--muted)] hover:text-[var(--foreground)] md:inline"
        >
          github
        </a>
        <a
          href="https://usepyxis.com/changelog"
          className="hidden font-mono text-[12px] text-[var(--muted)] hover:text-[var(--foreground)] md:inline"
        >
          changelog
        </a>
        <a
          href="https://usepyxis.com/research"
          className="rounded-md border border-[var(--accent)]/40 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--accent)] hover:border-[var(--scout)]/60 hover:text-[var(--scout)]"
        >
          launch app →
        </a>
      </div>
    </nav>
  );
}
