export type ProbeType = "scout" | "analyst" | "sentinel";

export interface ProbeQuery {
  probeType: ProbeType;
  query: string;
  systemPrompt: string;
}

export interface ProbeFinding {
  probeType: ProbeType;
  query: string;
  findings: string; // markdown
  sources: string[]; // URL list extracted from findings
  failed: boolean;
}

export interface CommanderOutput {
  scout: string;
  analyst: string;
  sentinel: string;
}

export interface BriefingResult {
  id: string;
  topic: string;
  briefing: string; // synthesizer markdown output
  confidence: number; // 0-100
  sources: number;
  partial: boolean; // true if any probe failed after retry
  createdAt: string;
}

export interface ProbePersona {
  type: ProbeType;
  name: string;
  systemPrompt: string;
  queryTemplate: (topic: string) => string;
}
