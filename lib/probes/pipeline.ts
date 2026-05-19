import { v4 as uuidv4 } from "uuid";
import { runCommander } from "./commander";
import { runScout } from "./scout";
import { runAnalyst } from "./analyst";
import { runSentinel } from "./sentinel";
import { runSynthesizer } from "./synthesizer";
import { logger } from "../logger";
import { cachePurgeExpired } from "../data/cache";
import type { BriefingResult, ProbeFinding } from "./types";
import type { FreshnessMeta } from "../data/freshness";

let _runCount = 0;
const PRUNE_EVERY = 100;

async function maybePrune(): Promise<void> {
  _runCount++;
  if (_runCount % PRUNE_EVERY !== 0) return;
  try {
    const removed = await cachePurgeExpired();
    if (removed > 0) logger.debug("cache.pruned", { removed });
  } catch (err) {
    logger.warn("cache.prune_failed", { err: String(err) });
  }
}

export async function runPipeline(topic: string): Promise<BriefingResult> {
  const id = uuidv4();
  const createdAt = new Date().toISOString();

  let cmd;
  try {
    cmd = await runCommander(topic);
  } catch (err) {
    logger.error("pipeline.commander_failed", { topic, err: String(err) });
    return {
      id,
      topic,
      createdAt,
      briefing:
        "## Executive Summary\n\nAll probes unavailable — please retry in a few minutes.\n\n## Confidence Assessment\n- Overall confidence: 0/100",
      confidence: 0,
      sources: 0,
      partial: true,
      topicType: "narrative",
      freshness: [],
    };
  }

  logger.info("pipeline.commander_done", {
    topic,
    topicType: cmd.topicType,
    chainHint: cmd.chainHint,
    temporalMode: cmd.temporalMode,
    hints: cmd.hints,
  });

  // Run probes sequentially (predictable load on OpenRouter)
  const scout = await runScout({
    query: cmd.scout,
    topicType: cmd.topicType,
    chainHint: cmd.chainHint,
    hints: cmd.hints,
  });
  const analyst = await runAnalyst({
    query: cmd.analyst,
    topicType: cmd.topicType,
    chainHint: cmd.chainHint,
    hints: cmd.hints,
  });
  const sentinel = await runSentinel({
    query: cmd.sentinel,
    topicType: cmd.topicType,
    hints: cmd.hints,
  });

  const findings: ProbeFinding[] = [scout, analyst, sentinel];

  const freshness: FreshnessMeta[] = findings.flatMap((f) => f.freshness);

  const synth = await runSynthesizer({
    topic,
    topicType: cmd.topicType,
    findings,
    freshness,
  });

  const sources = new Set<string>();
  for (const f of findings) for (const u of f.sources) sources.add(u);

  await maybePrune();

  return {
    id,
    topic,
    createdAt,
    briefing: synth.briefing,
    confidence: synth.confidence,
    sources: sources.size,
    partial: synth.partial,
    topicType: cmd.topicType,
    freshness,
  };
}
