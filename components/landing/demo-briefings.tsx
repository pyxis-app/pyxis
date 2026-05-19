"use client";

import { useState } from "react";
import Link from "next/link";
import { DEMOS, SAMPLE_LABEL } from "@/lib/demo-briefings";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";

/**
 * Terminal-scrollback treatment for the demo briefings section.
 * Renders one of two demo briefings as a single `term-block.active` with
 * an ascii block-head, pipeline strip, header, stat chips, pull-quote
 * sub-block, markdown body (prose-term), source sub-block, and CTA.
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
  const slug = b.topic.split(/\s+/)[0].toLowerCase();
  const coverInline = b.coverTitle.replace(/\s*\n\s*/g, " / ");

  return (
    <section id="briefing" className="relative">
      <div className="max-w-[1080px] mx-auto px-6 lg:px-8 py-20 lg:py-24">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <span className="term-section-tag">// briefing</span>
          <span className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-[0.18em]">
            specimen · {SAMPLE_LABEL.toLowerCase()}
          </span>
        </div>
        <h2 className="font-mono text-[26px] lg:text-[32px] tracking-[-0.005em] font-semibold text-[var(--foreground)] lowercase">
          two sample briefings
        </h2>
        <p className="mt-3 font-mono text-[14px] text-[var(--muted)] max-w-[58ch] leading-[1.6]">
          Pulled from the live pipeline. The briefing you run will arrive in the same shape — same headings, same citations, same data-freshness audit trail.
        </p>

        {/* Tab selector */}
        <div className="mt-8 flex flex-wrap gap-2">
          {DEMOS.map((d, i) => {
            const isActive = i === active;
            const tabDate = new Date(d.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
            });
            const tabSlug = d.topic.split(/\s+/)[0];
            return (
              <button
                key={d.id}
                onClick={() => setActive(i)}
                className="term-chip"
                style={
                  isActive
                    ? {
                        borderColor: "var(--accent)",
                        background: "rgba(91, 143, 255, 0.08)",
                        color: "var(--foreground)",
                      }
                    : undefined
                }
              >
                <span className={isActive ? "text-[var(--accent)]" : ""}>▸</span>
                <span className="ml-2">
                  {tabSlug} · issue {String(i + 1).padStart(2, "0")} · {tabDate.toLowerCase()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Briefing block */}
        <div className="mt-8 term-block active">
          {/* Block-head */}
          <div className="term-block-head">
            <span>
              <span className="dim">╭─</span> briefing/<b>{slug}</b>{" "}
              <span className="dim">──────────────</span>
            </span>
            <span className="live-pill">[ 5 agents · 1m 04s ]</span>
          </div>

          {/* Pipeline strip — all done */}
          <div className="term-pipeline">
            <span className="term-pipeline-step done">
              <span className="diamond">◆</span> commander
            </span>
            <span className="term-pipeline-step done">
              <span className="diamond">◆</span> scout
            </span>
            <span className="term-pipeline-step done">
              <span className="diamond">◆</span> analyst
            </span>
            <span className="term-pipeline-step done">
              <span className="diamond">◆</span> sentinel
            </span>
            <span className="term-pipeline-step done">
              <span className="diamond">◆</span> synthesizer
            </span>
          </div>

          {/* Cover headline (mono) */}
          <h3 className="font-mono text-[24px] lg:text-[28px] font-semibold tracking-[-0.01em] text-[var(--foreground)] mt-2">
            {coverInline}
          </h3>

          {/* Stats strip — chips */}
          <div className="mt-5 flex flex-wrap gap-2">
            {b.featuredStats.map((s) => (
              <span
                key={s.label}
                className="term-chip tabular-nums"
                style={{ cursor: "default" }}
              >
                <span className="text-[var(--foreground)]">{s.value}</span>
                <span className="ml-2 text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                  · {s.label}
                </span>
              </span>
            ))}
          </div>

          {/* Meta strip */}
          <div className="mt-5 font-mono text-[12px] text-[var(--muted)] flex flex-wrap gap-x-2 gap-y-1">
            <span>issued {issuedLong.toLowerCase()}</span>
            <span className="text-[var(--hair)]">·</span>
            <span>sources <span className="text-[var(--foreground)] tabular-nums">{b.sources}</span></span>
            <span className="text-[var(--hair)]">·</span>
            <span>completion <span className="text-[var(--foreground)]">{b.partial ? "Partial" : "Full"}</span></span>
            <span className="text-[var(--hair)]">·</span>
            <span>pipeline <span className="text-[var(--foreground)]">α→βγδ→ε</span></span>
          </div>

          {/* Pull quote sub-block */}
          <div className="term-sub mt-6">
            <div className="term-sub-head">
              <span className="text-[var(--accent)] uppercase tracking-[0.22em] text-[10px]">
                [ featured finding ]
              </span>
              <span className="text-[var(--hair)]">— from the editor</span>
            </div>
            <blockquote className="font-mono text-[15px] leading-[1.7] text-[var(--foreground)] opacity-92">
              &ldquo;{b.pullQuote}&rdquo;
            </blockquote>
          </div>

          {/* Briefing body — scrollable container so the section height
              stays consistent regardless of briefing length. Mini header
              shows scroll affordance; bottom fade hints at more content. */}
          <div className="relative mt-8 border border-[var(--hair)] rounded-lg bg-[var(--background)]/40 overflow-hidden">
            <div className="sticky top-0 z-10 flex justify-between items-center px-4 py-2 border-b border-[var(--hair)] bg-[var(--background)]/95 backdrop-blur-sm">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                briefing body · {Math.round(b.briefing.length / 5 / 200)} min read
              </span>
              <span className="font-mono text-[10px] text-[var(--muted)] flex items-center gap-1">
                <span>scroll</span>
                <span className="text-[var(--accent)]">↕</span>
              </span>
            </div>
            <div className="max-h-[640px] overflow-y-auto px-5 lg:px-6 py-6 briefing-scroll">
              <article className="prose-term">
                <MarkdownRenderer content={b.briefing} />
              </article>
            </div>
            {/* Bottom fade gradient — visual hint that more content is below */}
            <div
              className="pointer-events-none absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-[var(--background)] to-transparent"
              aria-hidden
            />
          </div>

          {/* Sources sub-block */}
          <div className="term-sub mt-10">
            <div className="term-sub-head">
              <span className="text-[var(--foreground)]">── sources cited · {b.sources} ──</span>
              <span className="text-[var(--muted)]">all citations verifiable</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 mt-2">
              {b.sourceList.map((s, i) => (
                <li key={s.url} className="flex items-baseline gap-2 font-mono text-[12px]">
                  <span className="text-[var(--muted)] tabular-nums shrink-0">
                    {String(i + 1).padStart(2, "0")} ▸
                  </span>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--foreground)] hover:text-[var(--accent)] truncate underline-offset-2 hover:underline"
                    title={s.url}
                  >
                    {s.host}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Outro CTA */}
          <div className="mt-10 flex flex-wrap items-baseline justify-between gap-4">
            <p className="font-mono text-[12px] text-[var(--muted)]">
              <span className="text-[var(--accent)]">›</span> ready to run your own? · static specimen · yours will be live
            </p>
            <Link href="/research" className="term-cta">
              run your own briefing
              <span className="text-[16px] leading-none translate-y-[-1px]">›</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Terminal prose styles for the markdown body */}
      <style>{`
        .prose-term h2 {
          font-family: var(--font-geist-mono), ui-monospace, monospace;
          font-size: 18px;
          font-weight: 600;
          color: var(--foreground);
          margin-top: 32px;
          margin-bottom: 12px;
          padding-left: 12px;
          border-left: 2px solid var(--accent);
          line-height: 1.4;
        }
        .prose-term h3 {
          font-family: var(--font-geist-mono), ui-monospace, monospace;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          color: var(--muted);
          margin-top: 24px;
          margin-bottom: 8px;
        }
        .prose-term p {
          font-family: var(--font-geist-mono), ui-monospace, monospace;
          font-size: 14px;
          line-height: 1.7;
          color: var(--foreground);
          opacity: 0.92;
          margin: 10px 0;
        }
        .prose-term strong {
          color: var(--foreground);
          opacity: 1;
          font-weight: 600;
        }
        .prose-term ul {
          list-style: none;
          padding-left: 0;
          margin: 12px 0;
        }
        .prose-term ul li {
          font-family: var(--font-geist-mono), ui-monospace, monospace;
          font-size: 14px;
          line-height: 1.7;
          color: var(--foreground);
          opacity: 0.92;
          padding-left: 18px;
          position: relative;
          margin: 4px 0;
        }
        .prose-term ul li::before {
          content: "•";
          position: absolute;
          left: 4px;
          color: var(--scout);
        }
        .prose-term ol {
          list-style: decimal;
          padding-left: 24px;
          margin: 12px 0;
          color: var(--foreground);
          font-family: var(--font-geist-mono), ui-monospace, monospace;
          font-size: 14px;
          line-height: 1.7;
        }
        .prose-term ol li { margin: 4px 0; opacity: 0.92; }
        .prose-term ol li::marker { color: var(--muted); }
        .prose-term a {
          color: var(--accent);
          text-decoration: underline;
          text-underline-offset: 2px;
          text-decoration-thickness: 1px;
        }
        .prose-term a:hover { color: var(--scout); }
        .prose-term code {
          font-family: var(--font-geist-mono), ui-monospace, monospace;
          font-size: 12.5px;
          color: var(--accent);
          background: var(--hair);
          padding: 1px 5px;
          border-radius: 4px;
        }
        .prose-term pre {
          background: var(--hair);
          border-radius: 6px;
          padding: 12px;
          overflow-x: auto;
          font-size: 12.5px;
          margin: 12px 0;
        }
        .prose-term blockquote {
          border-left: 2px solid var(--hair);
          padding-left: 12px;
          margin: 14px 0;
          color: var(--muted);
          font-style: normal;
        }
        .prose-term table {
          font-family: var(--font-geist-mono), ui-monospace, monospace;
          font-size: 12px;
          border-collapse: collapse;
          width: 100%;
          margin: 14px 0;
        }
        .prose-term thead th {
          text-align: left;
          font-weight: 500;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.18em;
          font-size: 10px;
          padding: 8px 10px;
          border-bottom: 1px solid var(--hair);
        }
        .prose-term tbody td {
          padding: 6px 10px;
          border-bottom: 1px solid var(--hair);
          color: var(--foreground);
          opacity: 0.92;
        }
        .prose-term hr {
          border: none;
          border-top: 1px solid var(--hair);
          margin: 20px 0;
        }
        /* Custom scrollbar for the briefing body container */
        .briefing-scroll::-webkit-scrollbar {
          width: 10px;
        }
        .briefing-scroll::-webkit-scrollbar-track {
          background: var(--hair);
          border-radius: 5px;
          margin: 4px 0;
        }
        .briefing-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, var(--scout), var(--accent));
          border-radius: 5px;
          border: 2px solid var(--background);
          background-clip: padding-box;
          box-shadow: 0 0 12px rgba(91, 143, 255, 0.35);
        }
        .briefing-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, var(--scout), var(--scout));
          background-clip: padding-box;
          box-shadow: 0 0 18px rgba(34, 211, 238, 0.55);
        }
        /* Firefox */
        .briefing-scroll {
          scrollbar-width: thin;
          scrollbar-color: var(--accent) var(--hair);
        }
      `}</style>
    </section>
  );
}
