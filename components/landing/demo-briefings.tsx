"use client";

import { useState } from "react";
import Link from "next/link";
import { DEMOS } from "@/lib/demo-briefings";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";

/**
 * Magazine-spread treatment for the demo briefings section.
 *
 *  ┌── Issue selector tabs ─────────────────────────────────┐
 *  │  ISSUE 01 — May 15    ISSUE 02 — May 16               │
 *  │  Solana               Ethereum                         │
 *  └────────────────────────────────────────────────────────┘
 *  ┌── Cover ───────────────────────────────────────────────┐
 *  │  Solana                                                │
 *  │  Ecosystem State                                       │
 *  └────────────────────────────────────────────────────────┘
 *  ┌── Stats strip ─────────────────────────────────────────┐
 *  │  $214   $103B   $12.1B   1,847   87                   │
 *  │  PRICE  MCAP    TVL      VALS    CONF                  │
 *  └────────────────────────────────────────────────────────┘
 *  ┌── Meta column ──┐  ┌── Body w/ drop-cap + pull-quote ─┐
 *  │ Issued / Conf / │  │ Solana enters mid-2026 …          │
 *  │ Sources / Pipe  │  │ ┌─ pull quote ─────────────────┐  │
 *  │ Editor's note   │  │ │ "FireDancer now serves …"    │  │
 *  └─────────────────┘  │ └──────────────────────────────┘  │
 *                       │ … rest of briefing                │
 *                       └────────────────────────────────────┘
 *  ┌── Sources footer ──────────────────────────────────────┐
 *  │ 01 — jumpcrypto.com   03 — solanamobile.com           │
 *  │ 02 — solanapay.com    04 — coingecko.com  …           │
 *  └────────────────────────────────────────────────────────┘
 *  ┌── Outro CTA ───────────────────────────────────────────┐
 *  │ Run your own briefing →                                │
 *  └────────────────────────────────────────────────────────┘
 */
export function DemoBriefings() {
  const [active, setActive] = useState(0);
  const b = DEMOS[active];
  const issueDate = new Date(b.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });
  const issuedLong = new Date(b.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

  return (
    <section id="briefing" className="relative hairline-bottom">
      <div className="max-w-[1280px] mx-auto px-8 py-24 lg:py-32">
        {/* Section eyebrow + small intro */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
          <div>
            <div className="eyebrow mb-5">Specimen · §02</div>
            <h2 className="font-display text-[40px] sm:text-[52px] lg:text-[60px] leading-[1.04] tracking-[-0.02em]">
              Two briefings the swarm{" "}
              <span className="italic" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144' }}>
                already wrote
              </span>.
            </h2>
          </div>
          <p className="max-w-sm text-[14px] text-[var(--muted)]">
            Pulled straight from the live pipeline. The briefing you run will arrive in the same shape — same headings, same citations, same confidence math.
          </p>
        </div>

        {/* ── Issue selector tabs ─────────────────────────── */}
        <div className="grid grid-cols-2 hairline-top hairline-bottom">
          {DEMOS.map((d, i) => {
            const isActive = i === active;
            const tabDate = new Date(d.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
            });
            return (
              <button
                key={d.id}
                onClick={() => setActive(i)}
                className={`text-left p-6 md:p-8 transition-colors ${
                  i === 0 ? "border-r border-[var(--hair)]" : ""
                } ${isActive ? "bg-[var(--hair)]/30" : "hover:bg-[var(--hair)]/15"}`}
              >
                <div className="flex items-baseline justify-between mb-2">
                  <span className={`font-mono text-[10px] uppercase tracking-[0.22em] ${isActive ? "text-[var(--gold)]" : "text-[var(--gold-soft)]"}`}>
                    Issue {String(i + 1).padStart(2, "0")} · {tabDate}
                  </span>
                  {isActive && (
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)]">
                      Reading
                    </span>
                  )}
                </div>
                <div className={`font-display text-[22px] sm:text-[26px] leading-tight ${isActive ? "text-[var(--foreground)]" : "text-[var(--foreground)]/55"}`}>
                  {d.topic.split(/\s+/).slice(0, 3).join(" ")}
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Cover headline ─────────────────────────────── */}
        <div className="py-14 lg:py-20 hairline-bottom">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold-soft)] mb-4">
            Issue {String(active + 1).padStart(2, "0")} · {issueDate}
          </div>
          <h3
            className="font-display text-[64px] sm:text-[88px] lg:text-[110px] leading-[0.92] tracking-[-0.03em] whitespace-pre-line"
            style={{ fontVariationSettings: '"opsz" 144' }}
          >
            {b.coverTitle}
          </h3>
        </div>

        {/* ── Stats strip ────────────────────────────────── */}
        <div className="hairline-bottom py-10 lg:py-14">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-8">
            {b.featuredStats.map((s) => (
              <div key={s.label}>
                <div
                  className="font-display text-[36px] sm:text-[44px] lg:text-[52px] leading-none tracking-[-0.02em] tabular text-[var(--foreground)]"
                  style={{ fontVariationSettings: '"opsz" 144' }}
                >
                  {s.value}
                </div>
                <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold-soft)]">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Magazine spread: meta + body ────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10 lg:gap-16 pt-12 lg:pt-16">
          <aside className="lg:sticky lg:top-24 self-start space-y-6 text-[13px]">
            <Meta label="Issued"        value={issuedLong} />
            <Meta label="Confidence"    value={`${b.confidence}/100`} mono />
            <Meta label="Sources cited" value={String(b.sources)}     mono />
            <Meta label="Completion"    value={b.partial ? "Partial" : "Full"} />
            <Meta label="Pipeline"      value="α → β γ δ → ε" />
            <div className="pt-6 hairline-top">
              <div className="eyebrow mb-3">From the editor</div>
              <p
                className="text-[13px] leading-relaxed italic font-display text-[var(--muted)]"
                style={{ fontVariationSettings: '"opsz" 9' }}
              >
                A specimen briefing on {b.topic.split(/\s+/)[0]}, rendered exactly as the
                production pipeline would emit it. Run your own to see live output.
              </p>
            </div>
          </aside>

          <article className="prose-pyxis prose-pyxis-drop max-w-3xl">
            {/* Pull quote rendered as a leading callout above the markdown */}
            <PullQuote text={b.pullQuote} />
            <MarkdownRenderer content={b.briefing} />
          </article>
        </div>

        {/* ── Sources footer ──────────────────────────────── */}
        <div className="mt-20 lg:mt-28 hairline-top pt-10">
          <div className="flex items-baseline justify-between mb-6">
            <div className="eyebrow">Sources · {b.sources}</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold-soft)]">
              All citations verifiable
            </div>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3 text-[13px]">
            {b.sourceList.map((s, i) => (
              <li key={s.url} className="flex items-baseline gap-3">
                <span className="font-mono text-[11px] tabular text-[var(--gold-soft)] shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[var(--foreground)]/85 hover:text-[var(--gold)] editorial-link truncate"
                  title={s.url}
                >
                  {s.host}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Outro CTA ───────────────────────────────────── */}
        <div className="mt-20 lg:mt-28 hairline-top pt-10 flex flex-wrap items-baseline justify-between gap-4">
          <p className="font-display italic text-[18px] text-[var(--muted)] max-w-md" style={{ fontVariationSettings: '"opsz" 9' }}>
            Static specimen. Yours will be generated live, in seconds.
          </p>
          <Link
            href="/research"
            className="group inline-flex items-baseline gap-3 px-6 py-3.5 bg-[var(--foreground)] text-[var(--background)] font-mono uppercase text-[11px] tracking-[0.22em] hover:bg-[var(--gold)] transition-colors duration-300"
          >
            Run your own briefing
            <span className="font-display text-[16px] leading-none translate-y-[1px] group-hover:translate-x-0.5 transition-transform">
              →
            </span>
          </Link>
        </div>
      </div>

      {/* Local styles: drop cap + pull quote (scoped via class) */}
      <style>{`
        .prose-pyxis-drop > div:first-of-type + :where(h2):first-of-type + p:first-letter,
        .prose-pyxis-drop > :where(h2):first-of-type + p:first-letter {
          font-family: var(--font-fraunces), serif;
          font-size: 64px;
          font-weight: 500;
          font-style: italic;
          float: left;
          line-height: 0.85;
          padding: 6px 10px 0 0;
          color: var(--gold);
        }
      `}</style>
    </section>
  );
}

function Meta({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="eyebrow mb-1.5">{label}</div>
      <div
        className={`text-[var(--foreground)] ${
          mono ? "font-mono tabular text-[13px]" : "font-display text-[15px]"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function PullQuote({ text }: { text: string }) {
  return (
    <figure className="my-0 mb-10 pl-6 border-l-2 border-[var(--gold)]/60">
      <blockquote
        className="font-display italic text-[24px] sm:text-[28px] lg:text-[32px] leading-[1.2] text-[var(--foreground)]/95"
        style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144' }}
      >
        &ldquo;{text}&rdquo;
      </blockquote>
      <figcaption className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold-soft)]">
        Featured finding
      </figcaption>
    </figure>
  );
}
