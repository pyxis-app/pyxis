"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="inline-block text-xs tracking-wider uppercase px-3 py-1 rounded-full border border-[var(--card-border)] text-[var(--accent)] mb-8">
        Pyxis · Under construction
      </div>
      <h1 className="font-bold tracking-tight text-4xl sm:text-5xl mb-4">
        Web3 Intelligence Swarm
      </h1>
      <p className="text-sm sm:text-base text-[var(--muted)] max-w-xl mb-10">
        Landing page and research workspace are being rebuilt. Sidebar links work below.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/history"
          className="px-4 py-2 rounded-md text-sm border border-[var(--card-border)] hover:bg-[var(--card)]"
        >
          History →
        </Link>
        <Link
          href="/settings"
          className="px-4 py-2 rounded-md text-sm border border-[var(--card-border)] hover:bg-[var(--card)]"
        >
          Settings →
        </Link>
      </div>
    </main>
  );
}
