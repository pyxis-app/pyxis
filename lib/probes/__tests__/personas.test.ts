import { describe, it, expect } from "vitest";
import {
  SCOUT_PERSONA,
  ANALYST_PERSONA,
  SENTINEL_PERSONA,
  SYNTHESIZER_PROMPT,
  COMMANDER_PROMPT,
  ALL_PERSONAS,
} from "../personas";

describe("probe personas", () => {
  it("all 5 prompts are non-empty strings", () => {
    expect(SCOUT_PERSONA.systemPrompt.length).toBeGreaterThan(100);
    expect(ANALYST_PERSONA.systemPrompt.length).toBeGreaterThan(100);
    expect(SENTINEL_PERSONA.systemPrompt.length).toBeGreaterThan(100);
    expect(SYNTHESIZER_PROMPT.length).toBeGreaterThan(100);
    expect(COMMANDER_PROMPT.length).toBeGreaterThan(100);
  });

  it("ALL_PERSONAS exports the 3 probe personas", () => {
    expect(ALL_PERSONAS).toHaveLength(3);
    expect(ALL_PERSONAS.map((p) => p.type).sort()).toEqual([
      "analyst",
      "scout",
      "sentinel",
    ]);
  });

  it("each persona produces a query for a topic", () => {
    for (const p of ALL_PERSONAS) {
      expect(p.queryTemplate("Solana")).toContain("Solana");
    }
  });
});
