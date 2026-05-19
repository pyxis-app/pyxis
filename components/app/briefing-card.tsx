"use client";

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

function classifyLabel(topicType: string | null | undefined): string | null {
  if (!topicType) return null;
  return topicType.charAt(0).toUpperCase() + topicType.slice(1);
}

function freshnessSummary(f: BriefingFreshness[] | undefined): string | null {
  if (!f || f.length === 0) return null;
  const live = f.filter((x) => !x.cached).length;
  const cached = f.length - live;
  if (cached === 0) return `${live} live`;
  if (live === 0) return `${cached} cached`;
  return `${live} live · ${cached} cached`;
}

export function BriefingCard({ b }: { b: Briefing }) {
  const date = new Date(b.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
  const classification = classifyLabel(b.topicType);
  const fresh = freshnessSummary(b.freshness);
  return (
    <article className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 lg:gap-12">
      {/* Meta column */}
      <aside className="lg:sticky lg:top-8 self-start text-[12px] space-y-5">
        <Meta label="Subject" value={b.topic} />
        {classification && <Meta label="Classification" value={classification} />}
        <Meta label="Issued" value={date} />
        <Meta label="Confidence" value={`${b.confidence}/100`} mono />
        <Meta label="Sources" value={String(b.sources)} mono />
        {fresh && <Meta label="Live data" value={fresh} mono />}
        <Meta label="Completion" value={b.partial ? "Partial" : "Full"} />
        {b.paymentTx && (
          <div>
            <div className="eyebrow mb-1.5">Settlement</div>
            <a
              href={`https://basescan.org/tx/${b.paymentTx}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] text-[var(--gold)] editorial-link"
            >
              View on Basescan ↗
            </a>
          </div>
        )}
      </aside>

      {/* Body */}
      <div className="prose-pyxis max-w-3xl">
        <MarkdownRenderer content={b.briefing} />
      </div>
    </article>
  );
}

function Meta({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="eyebrow mb-1.5">{label}</div>
      <div className={`text-[var(--foreground)] ${mono ? "font-mono tabular text-[13px]" : "font-display text-[15px]"}`}>
        {value}
      </div>
    </div>
  );
}
