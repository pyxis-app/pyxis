import { complete } from "../llm";
import { SYNTHESIZER_PROMPT } from "./personas";
import { withRetry } from "../retry";
import type { ProbeFinding } from "./types";

export interface SynthesizerOutput {
  briefing: string;
  confidence: number;
  partial: boolean;
}

function parseConfidence(text: string): number {
  const m = text.match(/confidence[^0-9]{0,40}(\d{1,3})\s*\/\s*100/i)
        ?? text.match(/Overall confidence[^0-9]{0,10}(\d{1,3})/i);
  if (!m) return 70; // sane default
  const n = parseInt(m[1], 10);
  return Math.max(0, Math.min(100, isNaN(n) ? 70 : n));
}

export async function runSynthesizer(topic: string, findings: ProbeFinding[]): Promise<SynthesizerOutput> {
  const partial = findings.some(f => f.failed);

  const probeBlocks = findings.map(f => {
    if (f.failed) return `### ${f.probeType.toUpperCase()}\n(probe failed; no data available)`;
    return `### ${f.probeType.toUpperCase()}\n${f.findings}`;
  }).join("\n\n");

  const userMsg = [
    `Topic: ${topic}`,
    partial ? "\nNOTE: One or more probes failed; synthesize from available data and reflect that in the confidence section.\n" : "",
    probeBlocks,
  ].join("\n");

  const briefing = await withRetry(() => complete({
    system: SYNTHESIZER_PROMPT,
    user: userMsg,
    maxTokens: 2500,
    temperature: 0.5,
  }), 3, 1000);

  return {
    briefing,
    confidence: parseConfidence(briefing),
    partial,
  };
}
