import { v4 as uuidv4 } from "uuid";
import { runCommander } from "./commander";
import { runScout } from "./scout";
import { runAnalyst } from "./analyst";
import { runSentinel } from "./sentinel";
import { runSynthesizer } from "./synthesizer";
import { logger } from "../logger";
import type { BriefingResult } from "./types";

export async function runPipeline(topic: string): Promise<BriefingResult> {
  const id = uuidv4();
  const createdAt = new Date().toISOString();

  let queries;
  try {
    queries = await runCommander(topic);
  } catch (err) {
    logger.error("pipeline.commander_failed", { topic, err: String(err) });
    return {
      id, topic, createdAt,
      briefing: "## Executive Summary\n\nAll probes unavailable — please retry in a few minutes.\n\n## Confidence Assessment\n- Overall confidence: 0/100",
      confidence: 0,
      sources: 0,
      partial: true,
    };
  }

  // Run probes sequentially per spec § 8 (keeps load on OpenRouter predictable)
  const scout    = await runScout(queries.scout);
  const analyst  = await runAnalyst(queries.analyst);
  const sentinel = await runSentinel(queries.sentinel);

  const findings = [scout, analyst, sentinel];
  const synth = await runSynthesizer(topic, findings);

  const sources = new Set<string>();
  for (const f of findings) for (const u of f.sources) sources.add(u);

  return {
    id, topic, createdAt,
    briefing: synth.briefing,
    confidence: synth.confidence,
    sources: sources.size,
    partial: synth.partial,
  };
}
