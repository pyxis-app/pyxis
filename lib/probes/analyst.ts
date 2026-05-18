import { complete } from "../llm";
import { searchTavily } from "../tavily";
import { getMarketContext } from "../market";
import { ANALYST_PERSONA } from "./personas";
import { withRetry } from "../retry";
import type { ProbeFinding } from "./types";

function extractUrls(s: string): string[] {
  return Array.from(new Set(s.match(/https?:\/\/[^\s)]+/g) ?? []));
}

export async function runAnalyst(query: string): Promise<ProbeFinding> {
  try {
    const [web, market] = await Promise.all([
      withRetry(() => searchTavily(query, 2), 2, 1000).catch(() => []),
      getMarketContext(query).catch(() => ""),
    ]);

    const webBlock = web.map(r =>
      `- ${r.title} (${r.url})\n  ${r.content.slice(0, 600)}`
    ).join("\n\n");

    const userMsg = [
      `Query: ${query}`,
      "",
      "LIVE WEB RESULTS:",
      webBlock || "(no results)",
      "",
      market || "",
    ].join("\n");

    const findings = await withRetry(() => complete({
      system: ANALYST_PERSONA.systemPrompt,
      user: userMsg,
      maxTokens: 1500,
    }), 3, 1000);

    return {
      probeType: "analyst",
      query,
      findings,
      sources: extractUrls(findings).concat(web.map(w => w.url)),
      failed: false,
    };
  } catch {
    return { probeType: "analyst", query, findings: "", sources: [], failed: true };
  }
}
