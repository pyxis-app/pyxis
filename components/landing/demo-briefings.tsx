"use client";

import { useState } from "react";
import { DEMOS } from "@/lib/demo-briefings";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";

export function DemoBriefings() {
  const [active, setActive] = useState(0);
  const b = DEMOS[active];
  const topicShort = b.topic.split(/\s+/)[0]; // "Solana" / "Ethereum"

  return (
    <section id="briefing" className="relative hairline-bottom">
      <div className="max-w-[1280px] mx-auto px-8 py-24 lg:py-32">
        {/* Section head */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <div className="eyebrow mb-5">Specimen · §02</div>
            <h2 className="font-display text-[44px] sm:text-[60px] lg:text-[72px] leading-[1.02] tracking-[-0.02em]">
              A briefing,{" "}
              <span className="italic" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144' }}>
                in full
              </span>.
            </h2>
          </div>
          <p className="max-w-sm text-[15px] text-[var(--muted)]">
            Two pre-rendered specimens from the live pipeline.
            Same structure, same citations, same confidence math you'll receive.
          </p>
        </div>

        {/* Tab switcher — "Issue: Solana" style */}
        <div className="flex items-end gap-10 hairline-bottom mb-10">
          {DEMOS.map((d, i) => {
            const isActive = i === active;
            return (
              <button
                key={d.id}
                onClick={() => setActive(i)}
                className={`pb-4 -mb-px transition-colors ${
                  isActive
                    ? "border-b border-[var(--gold)] text-[var(--foreground)]"
                    : "border-b border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <div className="eyebrow text-left mb-1.5">
                  {isActive ? "Issue 0" + (i + 1) : "Issue 0" + (i + 1)}
                </div>
                <div className="font-display text-[28px] leading-none">
                  {d.topic.split(/\s+/).slice(0, 2).join(" ")}
                </div>
              </button>
            );
          })}
        </div>

        {/* Magazine spread — left meta, right body */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10 lg:gap-16">
          {/* Meta column */}
          <aside className="lg:sticky lg:top-24 self-start">
            <div className="space-y-6 text-[13px]">
              <Meta label="Subject" value={b.topic} />
              <Meta label="Issued" value={new Date(b.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })} />
              <Meta label="Confidence" value={`${b.confidence}/100`} tabular />
              <Meta label="Sources cited" value={String(b.sources)} tabular />
              <Meta label="Completion" value={b.partial ? "Partial" : "Full"} />
              <Meta label="Pipeline" value="α → β γ δ → ε" />
            </div>
            <div className="mt-10 pt-6 hairline-top">
              <div className="eyebrow mb-3">From the editor</div>
              <p className="text-[13px] leading-relaxed text-[var(--muted)] italic font-display" style={{ fontVariationSettings: '"opsz" 9' }}>
                A specimen briefing on {topicShort}, generated as the production pipeline would. Run your own to see live output for any topic.
              </p>
            </div>
          </aside>

          {/* Body */}
          <article className="prose-pyxis max-w-none">
            <MarkdownRenderer content={b.briefing} />
          </article>
        </div>
      </div>

      {/* Local prose styles for the briefing markdown */}
      <style>{`
        .prose-pyxis h2 {
          font-family: var(--font-fraunces), serif;
          font-size: 36px;
          line-height: 1.1;
          letter-spacing: -0.01em;
          margin-top: 2.5rem;
          margin-bottom: 1.25rem;
          color: var(--foreground);
        }
        .prose-pyxis h2:first-child { margin-top: 0; }
        .prose-pyxis h3 {
          font-family: var(--font-geist-mono), monospace;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          color: var(--gold-soft);
          margin-top: 2rem;
          margin-bottom: 0.75rem;
        }
        .prose-pyxis p, .prose-pyxis li {
          font-size: 15px;
          line-height: 1.65;
          color: var(--foreground);
        }
        .prose-pyxis ul {
          list-style: none;
          padding-left: 0;
        }
        .prose-pyxis li {
          padding-left: 1.5rem;
          position: relative;
          margin-bottom: 0.5rem;
          color: rgba(236, 234, 216, 0.82);
        }
        .prose-pyxis li::before {
          content: "—";
          position: absolute;
          left: 0;
          color: var(--gold-soft);
        }
        .prose-pyxis strong {
          color: var(--foreground);
          font-weight: 600;
        }
        .prose-pyxis a {
          color: var(--gold);
          text-decoration: underline;
          text-decoration-color: rgba(212, 184, 134, 0.3);
          text-underline-offset: 3px;
        }
        .prose-pyxis a:hover {
          text-decoration-color: var(--gold);
        }
      `}</style>
    </section>
  );
}

function Meta({ label, value, tabular: tabularFlag = false }: { label: string; value: string; tabular?: boolean }) {
  return (
    <div>
      <div className="eyebrow mb-1.5">{label}</div>
      <div className={`text-[var(--foreground)] ${tabularFlag ? "tabular font-mono" : ""}`}>{value}</div>
    </div>
  );
}
