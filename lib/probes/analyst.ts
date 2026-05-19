import { complete } from "../llm";
import { ANALYST_PERSONA } from "./personas";
import { withRetry } from "../retry";
import { buildAnalystDossier } from "../data/dossiers/analyst-dossier";
import type {
  CommanderHints,
  ProbeFinding,
  TopicType,
} from "./types";

function extractUrls(s: string): string[] {
  return Array.from(new Set(s.match(/https?:\/\/[^\s)]+/g) ?? []));
}

export interface AnalystInput {
  query: string;
  topicType: TopicType;
  chainHint?: string;
  hints: CommanderHints;
}

export async function runAnalyst(input: AnalystInput): Promise<ProbeFinding> {
  try {
    const dossier = await buildAnalystDossier(
      input.query,
      input.topicType,
      input.chainHint,
      input.hints,
    );

    const userMsg = [
      `Topic / query: ${input.query}`,
      `Classified as: ${input.topicType}${input.chainHint ? ` (chain: ${input.chainHint})` : ""}`,
      "",
      dossier.markdown,
    ].join("\n");

    const findings = await withRetry(
      () =>
        complete({
          system: ANALYST_PERSONA.systemPrompt,
          user: userMsg,
          maxTokens: 4000,
          temperature: 0.4,
        }),
      3,
      1000,
    );

    const sources = Array.from(
      new Set([
        ...extractUrls(findings),
        ...dossier.endpointSources,
      ]),
    );

    return {
      probeType: "analyst",
      query: input.query,
      findings,
      sources,
      freshness: dossier.freshness,
      failed: false,
    };
  } catch {
    return {
      probeType: "analyst",
      query: input.query,
      findings: "",
      sources: [],
      freshness: [],
      failed: true,
    };
  }
}
