import { complete } from "../llm";
import {
  COMMANDER_PROMPT,
  SCOUT_PERSONA,
  ANALYST_PERSONA,
  SENTINEL_PERSONA,
} from "./personas";
import { withRetry } from "../retry";
import { logger } from "../logger";
import type {
  CommanderHints,
  CommanderOutput,
  TemporalMode,
  TopicType,
} from "./types";

const VALID_TOPIC_TYPES: ReadonlyArray<TopicType> = [
  "token",
  "chain",
  "protocol",
  "narrative",
];
const VALID_TEMPORAL: ReadonlyArray<TemporalMode> = ["realtime", "historical"];

function coerceTopicType(v: unknown): TopicType {
  return typeof v === "string" && (VALID_TOPIC_TYPES as readonly string[]).includes(v)
    ? (v as TopicType)
    : "token";
}

function coerceTemporal(v: unknown): TemporalMode {
  return typeof v === "string" && (VALID_TEMPORAL as readonly string[]).includes(v)
    ? (v as TemporalMode)
    : "realtime";
}

function coerceStr(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

function coerceNum(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

function coerceHints(raw: unknown): CommanderHints {
  if (!raw || typeof raw !== "object") return {};
  const r = raw as Record<string, unknown>;
  const out: CommanderHints = {};
  const symbol = coerceStr(r.symbol);
  if (symbol) out.symbol = symbol.toUpperCase().replace(/^\$/, "");
  const binanceSymbol = coerceStr(r.binanceSymbol);
  if (binanceSymbol) out.binanceSymbol = binanceSymbol.toUpperCase();
  const geckoNetwork = coerceStr(r.geckoNetwork);
  if (geckoNetwork) out.geckoNetwork = geckoNetwork.toLowerCase();
  const defillamaSlug = coerceStr(r.defillamaSlug);
  if (defillamaSlug) out.defillamaSlug = defillamaSlug.toLowerCase();
  const contractAddress = coerceStr(r.contractAddress);
  if (contractAddress) out.contractAddress = contractAddress;
  const twitterHandle = coerceStr(r.twitterHandle);
  if (twitterHandle) out.twitterHandle = twitterHandle.replace(/^@/, "");
  const subreddit = coerceStr(r.subreddit);
  if (subreddit) out.subreddit = subreddit.replace(/^r\//, "");
  const snapshotSpace = coerceStr(r.snapshotSpace);
  if (snapshotSpace) out.snapshotSpace = snapshotSpace.toLowerCase();
  return out;
}

function parseLine(text: string, label: string): string | null {
  const re = new RegExp(`^${label}:\\s*(.+)$`, "im");
  const m = text.match(re);
  return m ? m[1].trim() : null;
}

function tryParseJson(raw: string): Record<string, unknown> | null {
  // strip code fences if model wraps response
  const stripped = raw.replace(/^```(?:json)?/i, "").replace(/```$/m, "").trim();
  try {
    const parsed = JSON.parse(stripped);
    return typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export async function runCommander(topic: string): Promise<CommanderOutput> {
  const raw = await withRetry(
    () =>
      complete({
        system: COMMANDER_PROMPT,
        user: `Topic: ${topic}`,
        maxTokens: 2000,
        temperature: 0.2,
        jsonMode: true,
      }),
    3,
    1000,
  );

  const parsed = tryParseJson(raw);

  if (!parsed) {
    logger.warn("commander.json_parse_fallback", { raw: raw.slice(0, 200) });
    return {
      scout: parseLine(raw, "SCOUT") ?? SCOUT_PERSONA.queryTemplate(topic),
      analyst: parseLine(raw, "ANALYST") ?? ANALYST_PERSONA.queryTemplate(topic),
      sentinel: parseLine(raw, "SENTINEL") ?? SENTINEL_PERSONA.queryTemplate(topic),
      topicType: "token",
      temporalMode: "realtime",
      hints: {},
    };
  }

  return {
    scout: coerceStr(parsed.scout) ?? SCOUT_PERSONA.queryTemplate(topic),
    analyst: coerceStr(parsed.analyst) ?? ANALYST_PERSONA.queryTemplate(topic),
    sentinel: coerceStr(parsed.sentinel) ?? SENTINEL_PERSONA.queryTemplate(topic),
    topicType: coerceTopicType(parsed.topicType),
    chainHint: coerceStr(parsed.chainHint)?.toLowerCase(),
    temporalMode: coerceTemporal(parsed.temporalMode),
    lookbackDays: coerceNum(parsed.lookbackDays),
    hints: coerceHints(parsed.hints),
  };
}
