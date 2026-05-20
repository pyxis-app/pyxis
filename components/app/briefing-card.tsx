"use client";

import { useState } from "react";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";

export interface BriefingFreshness {
  source: string;
  sampledAt: string;
  endpoint: string;
  cached: boolean;
}

export interface Briefing {
  id: string;
  topic: string;
  briefing: string;
  confidence: number;
  sources: number;
  partial: boolean;
  createdAt: string;
  paymentTx?: string | null;
  topicType?: string | null;
  freshness?: BriefingFreshness[];
}

function freshnessSummary(f: BriefingFreshness[] | undefined): string | null {
  if (!f || f.length === 0) return null;
  const live = f.filter((x) => !x.cached).length;
  const cached = f.length - live;
  if (cached === 0) return `${live} live`;
  if (live === 0) return `${cached} cached`;
  return `${live} live · ${cached} cached`;
}

function elapsedFromNow(iso: string): string {
  const ms = Math.max(0, Date.now() - new Date(iso).getTime());
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function BriefingCard({ b, active }: { b: Briefing; active?: boolean }) {
  const [readMode, setReadMode] = useState(true);
  const [copied, setCopied] = useState<"md" | "link" | null>(null);

  function flashCopied(which: "md" | "link", text: string) {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(which);
        setTimeout(() => setCopied(null), 1800);
      })
      .catch(() => {});
  }

  const fresh = freshnessSummary(b.freshness);
  const topicType = b.topicType ?? "topic";
  const issuedRel = elapsedFromNow(b.createdAt);

  return (
    <div className={`term-block ${active ? "active" : ""}`}>
      {/* Block head */}
      <div className="term-block-head">
        <span>
          <span className="dim">╭─</span> briefing · <b>{b.topic}</b>{" "}
          <span className="dim">──[</span>
          {topicType} · 5 agents · {issuedRel}
          <span className="dim">]─╮</span>
        </span>
        <span className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setReadMode(true)}
            className="term-chip"
            style={
              readMode
                ? {
                    borderColor: "var(--accent)",
                    color: "var(--foreground)",
                    background: "rgba(91,143,255,0.08)",
                  }
                : undefined
            }
          >
            read · {readMode ? "ON" : "off"}
          </button>
          <button
            type="button"
            onClick={() => setReadMode(false)}
            className="term-chip"
            style={
              !readMode
                ? {
                    borderColor: "var(--accent)",
                    color: "var(--foreground)",
                    background: "rgba(91,143,255,0.08)",
                  }
                : undefined
            }
          >
            ⊟ blocks view
          </button>
        </span>
      </div>

      {/* Meta strip — confidence intentionally removed (was LLM-stochastic + biased
          against briefings with more honest data caveats). Source count + live
          freshness + completion give a better, deterministic picture. */}
      <div className="font-mono text-[11px] text-[var(--muted)] flex flex-wrap gap-x-4 gap-y-1 mb-3">
        <span>
          <span className="opacity-60">sources</span>{" "}
          <span className="text-[var(--foreground)]">{b.sources}</span>
        </span>
        {fresh && (
          <span>
            <span className="opacity-60">live data</span>{" "}
            <span className="text-[var(--foreground)]">{fresh}</span>
          </span>
        )}
        <span>
          <span className="opacity-60">completion</span>{" "}
          <span className="text-[var(--foreground)]">
            {b.partial ? "partial" : "full"}
          </span>
        </span>
        {b.paymentTx && (
          <a
            href={`https://basescan.org/tx/${b.paymentTx}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent)] hover:text-[var(--scout)] transition-colors"
          >
            tx ↗
          </a>
        )}
      </div>

      {readMode ? (
        <>
          <button
            type="button"
            onClick={() => setReadMode(false)}
            className="font-mono text-[12px] text-[var(--muted)] hover:text-[var(--accent)] transition-colors mb-3 block text-left"
          >
            ▸ show 5 agents (commander · scout · analyst · sentinel · synth)
          </button>
          <article className="prose-term">
            <MarkdownRenderer content={b.briefing} />
          </article>
        </>
      ) : (
        <>
          {/* Compact agent strip */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-4">
            <div className="term-sub" style={{ margin: 0 }}>
              <div className="term-sub-head">
                <span className="term-tag cmd">[commander]</span>
                <span>0.4s</span>
              </div>
              <div className="font-mono text-[12px] text-[var(--foreground)] opacity-85">
                classified · {topicType}
              </div>
            </div>
            <div className="term-sub scout" style={{ margin: 0 }}>
              <div className="term-sub-head">
                <span className="term-tag scout">[scout]</span>
                <span>info</span>
              </div>
              <div className="font-mono text-[12px] text-[var(--foreground)] opacity-85">
                news + narrative
              </div>
            </div>
            <div className="term-sub analyst" style={{ margin: 0 }}>
              <div className="term-sub-head">
                <span className="term-tag analyst">[analyst]</span>
                <span>{b.sources} sources</span>
              </div>
              <div className="font-mono text-[12px] text-[var(--foreground)] opacity-85">
                quantitative readout
              </div>
            </div>
            <div className="term-sub sentinel" style={{ margin: 0 }}>
              <div className="term-sub-head">
                <span className="term-tag sentinel">[sentinel]</span>
                <span>social</span>
              </div>
              <div className="font-mono text-[12px] text-[var(--foreground)] opacity-85">
                pulse + sentiment
              </div>
            </div>
            <div
              className="term-sub"
              style={{ margin: 0, borderColor: "rgba(91,143,255,0.30)" }}
            >
              <div className="term-sub-head">
                <span className="term-tag synth">[synth]</span>
                <span>briefing</span>
              </div>
              <div className="font-mono text-[12px] text-[var(--foreground)] opacity-85">
                merged briefing
              </div>
            </div>
          </div>
          <article className="prose-term" style={{ maxWidth: "100%" }}>
            <MarkdownRenderer content={b.briefing} />
          </article>
        </>
      )}

      {/* Action footer */}
      <div className="mt-6 pt-4 border-t border-[var(--hair)] flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => flashCopied("md", b.briefing)}
          className="term-chip"
        >
          {copied === "md" ? "copied ✓" : "copy md"}
        </button>
        <button
          type="button"
          onClick={() =>
            flashCopied(
              "link",
              `${typeof window !== "undefined" ? window.location.origin : "https://usepyxis.com"}/b/${b.id}`,
            )
          }
          className="term-chip"
        >
          {copied === "link" ? "link copied ✓" : "share link"}
        </button>
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.location.href = `/research?topic=${encodeURIComponent(b.topic)}`;
            }
          }}
          className="term-chip"
        >
          rerun · fresh
        </button>
        <button
          type="button"
          onClick={() => {
            if (typeof window === "undefined") return;
            const blob = new Blob([JSON.stringify(b, null, 2)], {
              type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `pyxis-${b.id}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="term-chip"
        >
          export json
        </button>
      </div>

      <style jsx>{`
        .prose-term {
          max-width: 68ch;
          margin: 0 auto;
        }
        .prose-term :global(h1),
        .prose-term :global(h2) {
          font-family: var(--font-geist-mono);
          font-size: 18px;
          font-weight: 600;
          margin: 32px 0 12px;
          padding-left: 12px;
          border-left: 2px solid var(--accent);
          color: var(--foreground);
        }
        .prose-term :global(h3) {
          font-family: var(--font-geist-mono);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          color: var(--muted);
          margin: 24px 0 8px;
        }
        .prose-term :global(p),
        .prose-term :global(li) {
          font-family: var(--font-geist-mono);
          font-size: 14px;
          line-height: 1.75;
          color: var(--foreground);
          opacity: 0.92;
          margin-bottom: 12px;
        }
        .prose-term :global(strong) {
          color: var(--foreground);
          font-weight: 600;
          opacity: 1;
        }
        .prose-term :global(ul) {
          list-style: none;
          padding-left: 0;
        }
        .prose-term :global(li) {
          padding-left: 18px;
          position: relative;
        }
        .prose-term :global(li)::before {
          content: "•";
          color: var(--scout);
          position: absolute;
          left: 4px;
        }
        .prose-term :global(table) {
          font-family: var(--font-geist-mono);
          font-size: 12px;
          border-collapse: collapse;
          margin: 16px 0;
          width: 100%;
        }
        .prose-term :global(th) {
          text-align: left;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          font-weight: 500;
          color: var(--muted);
          border-bottom: 1px solid var(--hair);
          padding: 6px 10px;
        }
        .prose-term :global(td) {
          border-bottom: 1px solid var(--hair);
          padding: 6px 10px;
          color: var(--foreground);
          opacity: 0.85;
        }
        .prose-term :global(code) {
          font-family: var(--font-geist-mono);
          color: var(--accent);
          background: var(--hair);
          padding: 1px 6px;
          border-radius: 3px;
          font-size: 0.9em;
        }
        .prose-term :global(a) {
          color: var(--accent);
          text-decoration: underline;
          text-underline-offset: 3px;
          text-decoration-color: rgba(91, 143, 255, 0.4);
        }
        .prose-term :global(a:hover) {
          text-decoration-color: var(--accent);
        }
      `}</style>
    </div>
  );
}
