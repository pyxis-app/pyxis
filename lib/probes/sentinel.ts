import { complete } from "../llm";
import { SENTINEL_PERSONA } from "./personas";
import { withRetry } from "../retry";
import { buildSentinelDossier } from "../data/dossiers/sentinel-dossier";
import { logger } from "../logger";
import type { CommanderHints, ProbeFinding, TopicType } from "./types";

function extractUrls(s: string): string[] {
  return Array.from(new Set(s.match(/https?:\/\/[^\s)]+/g) ?? []));
}

export interface SentinelInput {
  query: string;
  topicType: TopicType;
  hints: CommanderHints;
}

export async function runSentinel(input: SentinelInput): Promise<ProbeFinding> {
  try {
    const dossier = await buildSentinelDossier(
      input.query,
      input.topicType,
      input.hints,
    );

    if (dossier.getxapiCallsUsed > 0) {
      logger.info("sentinel.getxapi_usage", {
        calls: dossier.getxapiCallsUsed,
        approxCostUsd: dossier.getxapiCallsUsed * 0.001,
      });
    }

    const userMsg = [
      `Topic / query: ${input.query}`,
      `Classified as: ${input.topicType}`,
      "",
      dossier.markdown,
    ].join("\n");

    const findings = await withRetry(
      () =>
        complete({
          system: SENTINEL_PERSONA.systemPrompt,
          user: userMsg,
          maxTokens: 1500,
          temperature: 0.5,
        }),
      3,
      1000,
    );

    const webUrls = dossier.webResults.map((w) => w.url);
    const sources = Array.from(
      new Set([...extractUrls(findings), ...webUrls, ...dossier.endpointSources]),
    );

    return {
      probeType: "sentinel",
      query: input.query,
      findings,
      sources,
      freshness: dossier.freshness,
      failed: false,
    };
  } catch {
    return {
      probeType: "sentinel",
      query: input.query,
      findings: "",
      sources: [],
      freshness: [],
      failed: true,
    };
  }
}
