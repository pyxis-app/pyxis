import { complete } from "../llm";
import { SCOUT_PERSONA } from "./personas";
import { withRetry } from "../retry";
import { buildScoutDossier } from "../data/dossiers/scout-dossier";
import type { CommanderHints, ProbeFinding, TopicType } from "./types";

function extractUrls(s: string): string[] {
  return Array.from(new Set(s.match(/https?:\/\/[^\s)]+/g) ?? []));
}

export interface ScoutInput {
  query: string;
  topicType: TopicType;
  chainHint?: string;
  hints: CommanderHints;
}

export async function runScout(input: ScoutInput): Promise<ProbeFinding> {
  try {
    const dossier = await buildScoutDossier(
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
          system: SCOUT_PERSONA.systemPrompt,
          user: userMsg,
          maxTokens: 4000,
          temperature: 0.4,
        }),
      3,
      1000,
    );

    const webUrls = dossier.webResults.map((w) => w.url);
    const sources = Array.from(
      new Set([...extractUrls(findings), ...webUrls, ...dossier.endpointSources]),
    );

    return {
      probeType: "scout",
      query: input.query,
      findings,
      sources,
      freshness: dossier.freshness,
      failed: false,
    };
  } catch {
    return {
      probeType: "scout",
      query: input.query,
      findings: "",
      sources: [],
      freshness: [],
      failed: true,
    };
  }
}
