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

function coerceSubTopics(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const list = v
    .filter((x): x is string => typeof x === "string" && x.length > 0 && x.length < 30)
    .map((x) => x.trim())
    .slice(0, 5);
  // Require at least 2 sub-topics to make decomposition worthwhile
  return list.length >= 2 ? list : undefined;
}

// Hints become path/query/GraphQL params hitting external APIs, so validate
// their FORMAT here (not just type/length) before they leave the process. The
// values come from the LLM, which the user's topic influences — a hint shaped
// like an injection payload is dropped rather than forwarded. Defense-in-depth:
// the source modules also encodeURIComponent at the call site.
const EVM_ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const SOLANA_ADDRESS = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

function clean(v: unknown, re: RegExp, transform: (s: string) => string): string | undefined {
  const s = coerceStr(v);
  if (!s) return undefined;
  const t = transform(s.trim());
  return re.test(t) ? t : undefined;
}

function coerceHints(raw: unknown): CommanderHints {
  if (!raw || typeof raw !== "object") return {};
  const r = raw as Record<string, unknown>;
  const out: CommanderHints = {};
  const symbol = clean(r.symbol, /^[A-Z0-9]{1,20}$/, (s) => s.toUpperCase().replace(/^\$/, ""));
  if (symbol) out.symbol = symbol;
  const binanceSymbol = clean(r.binanceSymbol, /^[A-Z0-9]{1,20}$/, (s) => s.toUpperCase());
  if (binanceSymbol) out.binanceSymbol = binanceSymbol;
  const geckoNetwork = clean(r.geckoNetwork, /^[a-z0-9-]{1,40}$/, (s) => s.toLowerCase());
  if (geckoNetwork) out.geckoNetwork = geckoNetwork;
  const defillamaSlug = clean(r.defillamaSlug, /^[a-z0-9-]{1,60}$/, (s) => s.toLowerCase());
  if (defillamaSlug) out.defillamaSlug = defillamaSlug;
  const contractAddress = clean(
    r.contractAddress,
    new RegExp(`${EVM_ADDRESS.source}|${SOLANA_ADDRESS.source}`),
    (s) => s,
  );
  if (contractAddress) out.contractAddress = contractAddress;
  const twitterHandle = clean(r.twitterHandle, /^[A-Za-z0-9_]{1,15}$/, (s) => s.replace(/^@/, ""));
  if (twitterHandle) out.twitterHandle = twitterHandle;
  const subreddit = clean(r.subreddit, /^[A-Za-z0-9_]{1,30}$/, (s) => s.replace(/^r\//, ""));
  if (subreddit) out.subreddit = subreddit;
  const snapshotSpace = clean(r.snapshotSpace, /^[a-z0-9.-]{1,60}$/, (s) => s.toLowerCase());
  if (snapshotSpace) out.snapshotSpace = snapshotSpace;
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
    subTopics: coerceSubTopics(parsed.subTopics),
  };
}
