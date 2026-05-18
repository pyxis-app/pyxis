import { complete } from "../llm";
import { searchTavily } from "../tavily";
import { SENTINEL_PERSONA } from "./personas";
import { withRetry } from "../retry";
import type { ProbeFinding } from "./types";

function extractUrls(s: string): string[] {
  return Array.from(new Set(s.match(/https?:\/\/[^\s)]+/g) ?? []));
}

export async function runSentinel(query: string): Promise<ProbeFinding> {
  try {
    const web = await withRetry(() => searchTavily(query, 2), 2, 1000);
    const webBlock = web.map(r =>
      `- ${r.title} (${r.url})\n  ${r.content.slice(0, 600)}`
    ).join("\n\n");

    const findings = await withRetry(() => complete({
      system: SENTINEL_PERSONA.systemPrompt,
      user: `Query: ${query}\n\nLIVE WEB RESULTS:\n${webBlock}`,
      maxTokens: 1500,
    }), 3, 1000);

    return {
      probeType: "sentinel",
      query,
      findings,
      sources: extractUrls(findings).concat(web.map(w => w.url)),
      failed: false,
    };
  } catch {
    return { probeType: "sentinel", query, findings: "", sources: [], failed: true };
  }
}
