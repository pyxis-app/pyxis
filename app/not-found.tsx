import Link from "next/link";
import type { Metadata } from "next";
import { LandingNav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "404 · off the chart · pyxis",
  description: "No bearing found for this coordinate.",
};

export default function NotFound() {
  return (
    <main className="relative term-grid-bg min-h-screen flex flex-col">
      <LandingNav />

      <section className="flex-1 w-full max-w-[920px] mx-auto px-6 lg:px-8 pt-16 lg:pt-24 pb-20">
        <div className="mb-6 flex items-center gap-3">
          <span className="term-section-tag">// 404</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
            signal lost · off the chart
          </span>
        </div>

        <div className="term-block">
          <div className="term-block-head">
            <span>
              <span className="dim">╭─</span> error{" "}
              <span className="dim">──────────────</span>
            </span>
            <span className="live-pill" style={{ color: "var(--danger)" }}>
              [ no fix ]
            </span>
          </div>

          <div
            className="font-mono leading-none text-[var(--accent)] mb-5 select-none"
            style={{ fontSize: "clamp(64px, 16vw, 132px)", letterSpacing: "0.04em" }}
            aria-hidden
          >
            404
          </div>

          <p className="font-mono text-[14px] leading-[1.7] text-[var(--foreground)] opacity-90 mb-2 max-w-[60ch]">
            <span className="term-p-prefix">P›</span>
            no bearing found for this coordinate. the page you&apos;re after has
            drifted, been retired, or was never charted.
          </p>
          <p className="font-mono text-[12px] text-[var(--muted)] mb-6 break-all">
            <span className="dim">pyxis://</span>
            <span className="text-[var(--danger)]">unknown-coordinate</span>
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href="/" className="term-cta">
              return to port
              <span className="text-[16px] leading-none translate-y-[-1px]">›</span>
            </Link>
            <Link href="/research" className="term-cta outline">
              start a research run
              <span className="text-[14px] leading-none translate-y-[-1px]">›</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
