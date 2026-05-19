import type { FreshnessMeta } from "../data/freshness";

export type ProbeType = "scout" | "analyst" | "sentinel";

export type TopicType = "token" | "chain" | "protocol" | "narrative";

export type TemporalMode = "realtime" | "historical";

export interface CommanderHints {
  twitterHandle?: string;
  contractAddress?: string;
  defillamaSlug?: string;
  subreddit?: string;
  snapshotSpace?: string;
  /** Symbol to disambiguate (e.g. "SOL" not "Solana") */
  symbol?: string;
  /** Binance ticker (e.g. "SOLUSDT") if topic is a major asset */
  binanceSymbol?: string;
  /** GeckoTerminal network slug (e.g. "solana", "eth", "base") */
  geckoNetwork?: string;
}

export interface ProbeQuery {
  probeType: ProbeType;
  query: string;
  systemPrompt: string;
}

export interface ProbeFinding {
  probeType: ProbeType;
  query: string;
  findings: string; // markdown
  sources: string[]; // URL list extracted from findings + freshness endpoints
  freshness: FreshnessMeta[]; // data source freshness (data probes only)
  failed: boolean;
}

export interface CommanderOutput {
  scout: string;
  analyst: string;
  sentinel: string;
  topicType: TopicType;
  chainHint?: string;
  temporalMode: TemporalMode;
  lookbackDays?: number;
  hints: CommanderHints;
}

export interface BriefingResult {
  id: string;
  topic: string;
  briefing: string; // synthesizer markdown output
  confidence: number; // 0-100
  sources: number;
  partial: boolean;
  topicType: TopicType;
  freshness: FreshnessMeta[];
  createdAt: string;
}

export interface ProbePersona {
  type: ProbeType;
  name: string;
  systemPrompt: string;
  queryTemplate: (topic: string) => string;
}
