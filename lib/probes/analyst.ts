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
  /** When set (narrative/comparison topics), fan out the dossier composition
   * across these concrete assets — each is dossier'd as topicType=token, then
   * concatenated under the parent dossier. Single LLM call digests the lot. */
  subTopics?: string[];
}

export async function runAnalyst(input: AnalystInput): Promise<ProbeFinding> {
  try {
    // 1. Main dossier — the umbrella topic (may be a narrative; analyst-dossier
    // narrative path still pulls sector-level data like stablecoins/trending)
    const mainDossier = await buildAnalystDossier(
      input.query,
      input.topicType,
      input.chainHint,
      input.hints,
    );

    let combinedMarkdown = mainDossier.markdown;
    let combinedFreshness = [...mainDossier.freshness];
    let combinedSources = [...mainDossier.endpointSources];

    // 2. Sub-topic fan-out (parallel) — each ticker/name gets a token-path
    // dossier with symbol hint set, so it routes to coin-specific endpoints.
    if (input.subTopics && input.subTopics.length >= 2) {
      const subDossiers = await Promise.all(
        input.subTopics.map((st) => {
          // Normalize symbol: strip leading $, uppercase. Some sub-topics are
          // protocol names (EtherFi), not tickers — for those we let the
          // analyst-dossier's searchCoin() fallback resolve the right CG id.
          const looksLikeTicker = /^\$?[A-Za-z0-9]{2,8}$/.test(st);
          return buildAnalystDossier(
            st,
            looksLikeTicker ? "token" : "protocol",
            input.chainHint,
            {
              symbol: st.toUpperCase().replace(/^\$/, ""),
            },
          );
        }),
      );

      const subBlocks = subDossiers
        .map((d, i) => `\n\n### Sub-asset · ${input.subTopics![i]}\n${d.markdown}`)
        .join("");
      combinedMarkdown = `${mainDossier.markdown}${subBlocks}`;
      combinedFreshness = [
        ...combinedFreshness,
        ...subDossiers.flatMap((d) => d.freshness),
      ];
      combinedSources = [
        ...combinedSources,
        ...subDossiers.flatMap((d) => d.endpointSources),
      ];
    }

    // 3. Single LLM digest of (main + all sub) dossier — keeps cost manageable
    const subTopicNote =
      input.subTopics && input.subTopics.length >= 2
        ? `\nNOTE: This dossier contains per-asset sub-sections (### Sub-asset · X). When you write findings, give a brief per-asset readout for each, then a cross-asset summary highlighting common patterns + divergences.\n`
        : "";

    const userMsg = [
      `Topic / query: ${input.query}`,
      `Classified as: ${input.topicType}${input.chainHint ? ` (chain: ${input.chainHint})` : ""}`,
      subTopicNote,
      combinedMarkdown,
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
      new Set([...extractUrls(findings), ...combinedSources]),
    );

    return {
      probeType: "analyst",
      query: input.query,
      findings,
      sources,
      freshness: combinedFreshness,
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
