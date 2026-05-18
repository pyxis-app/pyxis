import Link from "next/link";
import { Constellation } from "./constellation";

export function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "var(--accent-deep)" }}
    >
      <Constellation />
      <div className="relative max-w-3xl mx-auto px-6 py-32 sm:py-40 text-center">
        <div className="inline-block text-xs tracking-wider uppercase px-3 py-1 rounded-full border border-[var(--card-border)] text-[var(--accent)] mb-8">
          Live on Base Sepolia · $0.25 USDC per session
        </div>
        <h1 className="font-bold tracking-tight text-4xl sm:text-6xl leading-tight mb-6">
          Navigate Web3 with a research swarm
        </h1>
        <p className="text-base sm:text-lg text-[var(--muted)] max-w-xl mx-auto mb-10">
          Five agents decompose your topic, sweep the web, cross-reference
          market data, and return a sourced briefing.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/research"
            className="px-5 py-3 rounded-md text-sm font-medium text-white bg-gradient-to-r from-[#3b82f6] to-[#1e40af] hover:translate-y-[-2px] hover:shadow-[0_8px_30px_-8px_rgba(59,130,246,0.5)] transition"
          >
            Open the app →
          </Link>
          <a
            href="#demo"
            className="px-5 py-3 rounded-md text-sm font-medium border border-[var(--card-border)] hover:bg-[var(--card)]"
          >
            See sample output ↓
          </a>
        </div>
      </div>
    </section>
  );
}
