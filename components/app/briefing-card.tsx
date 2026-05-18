"use client";

import { MarkdownRenderer } from "@/components/shared/markdown-renderer";

export interface Briefing {
  id: string;
  topic: string;
  briefing: string;
  confidence: number;
  sources: number;
  partial: boolean;
  createdAt: string;
  paymentTx?: string | null;
}

export function BriefingCard({ b }: { b: Briefing }) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-4">
        <div>{b.topic}</div>
        <div className="flex items-center gap-3">
          <span>Confidence {b.confidence}/100</span>
          <span>{b.sources} sources</span>
          {b.partial && <span className="text-[var(--sentinel)]">partial</span>}
          {b.paymentTx && (
            <a
              href={`https://sepolia.basescan.org/tx/${b.paymentTx}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline"
            >
              tx ↗
            </a>
          )}
        </div>
      </div>
      <MarkdownRenderer content={b.briefing} />
    </div>
  );
}
