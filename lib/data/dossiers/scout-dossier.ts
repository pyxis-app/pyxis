import type { FreshnessMeta, WithFreshness } from "../freshness";
import type { CommanderHints, TopicType } from "../../probes/types";
import { searchTavily, type TavilyResult } from "../sources/tavily";
import {
  getContractMeta,
  getContractCreation,
  type ContractMeta,
  type ContractCreation,
} from "../sources/etherscan";
import { getTrending } from "../sources/coingecko";

export interface ScoutDossier {
  query: string;
  topicType: TopicType;
  markdown: string;
  webResults: TavilyResult[];
  freshness: FreshnessMeta[];
  failedSources: string[];
  endpointSources: string[];
}

function renderContractMeta(c: ContractMeta, meta: FreshnessMeta): string {
  const lines = [
    `### Contract verification — Etherscan ${meta.cached ? "[cached]" : "[live]"}`,
    `- Chain: ${c.chain} · Address: ${c.address}`,
    `- Verified source code: ${c.verified ? "✅ Yes" : "❌ No (RED FLAG for new project)"}`,
    c.verified && c.name ? `- Contract name: ${c.name}` : "",
    c.verified && c.compilerVersion ? `- Compiler: ${c.compilerVersion}` : "",
    c.verified ? `- Proxy pattern detected: ${c.hasProxy ? "yes (admin can upgrade)" : "no"}` : "",
    c.verified ? `- Owner pattern in source: ${c.hasOwner ? "yes (admin privileges exist)" : "no (renounced or none)"}` : "",
  ].filter(Boolean);
  return lines.join("\n");
}

function renderCreation(c: ContractCreation, meta: FreshnessMeta): string {
  return [
    `### Contract creation — Etherscan ${meta.cached ? "[cached]" : "[live]"}`,
    `- Creator: ${c.creator}`,
    `- Creation tx: ${c.creationTxHash}`,
  ].join("\n");
}

function renderTrending(
  items: Array<{ id: string; name: string; symbol: string; rank: number }>,
  meta: FreshnessMeta,
): string {
  if (items.length === 0) return "";
  const lines = [
    `### Trending (CoinGecko 24h) ${meta.cached ? "[cached]" : "[live]"}`,
  ];
  for (const i of items.slice(0, 7)) {
    lines.push(`- ${i.name} (${i.symbol.toUpperCase()}) — rank #${i.rank}`);
  }
  return lines.join("\n");
}

function renderWebResults(results: TavilyResult[], meta: FreshnessMeta): string {
  if (results.length === 0) return "";
  const lines = [
    `### Web news & narrative — Tavily ${meta.cached ? "[cached]" : "[live]"}`,
  ];
  for (const r of results) {
    lines.push(`- **${r.title}** (${r.url})`);
    lines.push(`  ${r.content.slice(0, 400)}`);
  }
  return lines.join("\n");
}

export async function buildScoutDossier(
  query: string,
  topicType: TopicType,
  chainHint: string | undefined,
  hints: CommanderHints,
): Promise<ScoutDossier> {
  const tasks: Array<{
    name: string;
    run: () => Promise<WithFreshness<unknown> | null>;
  }> = [];

  tasks.push({ name: "tavily", run: () => searchTavily(query, 3) });

  if (hints.contractAddress && chainHint) {
    tasks.push({
      name: "contractMeta",
      run: () => getContractMeta(chainHint, hints.contractAddress!),
    });
    tasks.push({
      name: "contractCreation",
      run: () => getContractCreation(chainHint, hints.contractAddress!),
    });
  }

  if (topicType === "narrative" || topicType === "token") {
    tasks.push({ name: "trending", run: () => getTrending() });
  }

  const settled = await Promise.allSettled(tasks.map((t) => t.run()));
  const failedSources: string[] = [];
  const sections: string[] = [];
  const freshnessMetas: FreshnessMeta[] = [];
  const endpointSources: string[] = [];
  let webResults: TavilyResult[] = [];

  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    const r = settled[i];
    if (r.status === "rejected" || r.value === null) {
      failedSources.push(t.name);
      continue;
    }
    const v = r.value;
    if (!v || !v.data) {
      if (v?.meta) freshnessMetas.push(v.meta);
      continue;
    }
    freshnessMetas.push(v.meta);
    endpointSources.push(v.meta.endpoint);

    switch (t.name) {
      case "tavily": {
        const list = v.data as TavilyResult[];
        if (list.length > 0) {
          webResults = list;
          sections.push(renderWebResults(list, v.meta));
        }
        break;
      }
      case "contractMeta":
        sections.push(renderContractMeta(v.data as ContractMeta, v.meta));
        break;
      case "contractCreation":
        sections.push(renderCreation(v.data as ContractCreation, v.meta));
        break;
      case "trending": {
        const items = v.data as Array<{ id: string; name: string; symbol: string; rank: number }>;
        if (items.length > 0) sections.push(renderTrending(items, v.meta));
        break;
      }
    }
  }

  const failuresLine =
    failedSources.length > 0 ? `\n\n_Sources unavailable: ${failedSources.join(", ")}_` : "";

  const markdown =
    sections.length === 0
      ? `_No live information sources retrieved for "${query}". Treat findings as model-knowledge only and lower confidence accordingly._`
      : `## Live Information Dossier\n\n${sections.join("\n\n")}${failuresLine}`;

  return {
    query,
    topicType,
    markdown,
    webResults,
    freshness: freshnessMetas,
    failedSources,
    endpointSources,
  };
}
