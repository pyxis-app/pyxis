import { complete } from "../llm";
import { COMMANDER_PROMPT, SCOUT_PERSONA, ANALYST_PERSONA, SENTINEL_PERSONA } from "./personas";
import { withRetry } from "../retry";
import type { CommanderOutput } from "./types";

function parseLine(text: string, label: string): string | null {
  const re = new RegExp(`^${label}:\\s*(.+)$`, "im");
  const m = text.match(re);
  return m ? m[1].trim() : null;
}

export async function runCommander(topic: string): Promise<CommanderOutput> {
  const raw = await withRetry(() => complete({
    system: COMMANDER_PROMPT,
    user: `Topic: ${topic}`,
    maxTokens: 300,
    temperature: 0.4,
  }), 3, 1000);

  return {
    scout:    parseLine(raw, "SCOUT")    ?? SCOUT_PERSONA.queryTemplate(topic),
    analyst:  parseLine(raw, "ANALYST")  ?? ANALYST_PERSONA.queryTemplate(topic),
    sentinel: parseLine(raw, "SENTINEL") ?? SENTINEL_PERSONA.queryTemplate(topic),
  };
}
