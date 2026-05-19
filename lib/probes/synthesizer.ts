import { complete } from "../llm";
import { SYNTHESIZER_PROMPT } from "./personas";
import { withRetry } from "../retry";
import type { ProbeFinding, TopicType } from "./types";
import type { FreshnessMeta } from "../data/freshness";

export interface SynthesizerOutput {
  briefing: string;
  confidence: number;
  partial: boolean;
}

function parseConfidence(text: string): number {
  const m =
    text.match(/confidence[^0-9]{0,40}(\d{1,3})\s*\/\s*100/i) ??
    text.match(/Overall confidence[^0-9]{0,10}(\d{1,3})/i);
  if (!m) return 70;
  const n = parseInt(m[1], 10);
  return Math.max(0, Math.min(100, isNaN(n) ? 70 : n));
}

function renderFreshnessTable(metas: FreshnessMeta[]): string {
  if (metas.length === 0) return "";
  const lines = [
    "",
    "## Data Freshness",
    "",
    "| Source | Endpoint | Sampled | Cache |",
    "| --- | --- | --- | --- |",
  ];
  for (const m of metas) {
    const endpoint = m.endpoint.length > 60 ? m.endpoint.slice(0, 57) + "..." : m.endpoint;
    lines.push(
      `| ${m.source} | ${endpoint} | ${m.sampledAt} | ${m.cached ? "hit" : "live"} |`,
    );
  }
  return lines.join("\n");
}

export interface SynthesizerInput {
  topic: string;
  topicType: TopicType;
  findings: ProbeFinding[];
  freshness: FreshnessMeta[];
}

export async function runSynthesizer(
  input: SynthesizerInput,
): Promise<SynthesizerOutput> {
  const { topic, topicType, findings, freshness } = input;
  const partial = findings.some((f) => f.failed);

  const probeBlocks = findings
    .map((f) => {
      if (f.failed)
        return `### ${f.probeType.toUpperCase()}\n(probe failed; no data available)`;
      return `### ${f.probeType.toUpperCase()}\n${f.findings}`;
    })
    .join("\n\n");

  const userMsg = [
    `Topic: ${topic}`,
    `Topic type: ${topicType}`,
    partial
      ? "\nNOTE: One or more probes failed; synthesize from available data and reflect that in the Confidence Assessment.\n"
      : "",
    probeBlocks,
  ].join("\n");

  const briefingBody = await withRetry(
    () =>
      complete({
        system: SYNTHESIZER_PROMPT,
        user: userMsg,
        maxTokens: 2500,
        temperature: 0.5,
      }),
    3,
    1000,
  );

  const freshnessTable = renderFreshnessTable(freshness);
  const briefing = freshnessTable ? `${briefingBody.trim()}\n${freshnessTable}` : briefingBody;

  return {
    briefing,
    confidence: parseConfidence(briefingBody),
    partial,
  };
}
