import Link from "next/link";

export function Pricing() {
  return (
    <section id="pricing" className="max-w-md mx-auto px-6 py-32">
      <div className="glass-card p-10 text-center">
        <div className="font-mono text-[64px] sm:text-[80px] leading-none bg-gradient-to-r from-[#3b82f6] to-[#1e40af] bg-clip-text text-transparent">
          $0.25
        </div>
        <div className="text-sm text-[var(--muted)] mt-1 mb-2">
          USDC per research
        </div>
        <div className="text-xs text-[var(--muted)] mb-8">
          x402 native · Base Sepolia · No subscription
        </div>
        <Link
          href="/research"
          className="inline-block px-5 py-3 rounded-md text-sm font-medium text-white bg-gradient-to-r from-[#3b82f6] to-[#1e40af] hover:translate-y-[-2px] transition"
        >
          Connect wallet & start →
        </Link>
      </div>
    </section>
  );
}
