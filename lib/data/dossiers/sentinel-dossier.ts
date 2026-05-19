import type { FreshnessMeta, WithFreshness } from "../freshness";
import type { CommanderHints, TopicType } from "../../probes/types";
import { searchTavily, type TavilyResult } from "../sources/tavily";
import { getFearGreed, type FearGreedSeries } from "../sources/alternativeme";
import {
  getSubredditMeta,
  getSubredditNewPosts,
  type SubredditMeta,
  type RedditPost,
} from "../sources/reddit";
import {
  getActiveProposals,
  type SnapshotProposal,
} from "../sources/snapshot";
import {
  newBudget,
  getUserInfo,
  getUserRecentTweets,
  searchMentions,
  type CallBudget,
  type TwitterUser,
  type Tweet,
  type MentionSearch,
} from "../sources/getxapi";

export interface SentinelDossier {
  query: string;
  topicType: TopicType;
  markdown: string;
  webResults: TavilyResult[];
  freshness: FreshnessMeta[];
  failedSources: string[];
  endpointSources: string[];
  getxapiCallsUsed: number;
}

function renderFng(f: FearGreedSeries, meta: FreshnessMeta): string {
  return [
    `### Macro Fear & Greed — Alternative.me ${meta.cached ? "[cached]" : "[live]"}`,
    `- Current: ${f.current.value} (${f.current.classification})`,
  ].join("\n");
}

function renderTwitterUser(u: TwitterUser, meta: FreshnessMeta): string {
  const accountAgeYears = u.createdAt
    ? Math.round(
        (Date.now() - new Date(u.createdAt).getTime()) /
          (1000 * 60 * 60 * 24 * 365) * 10,
      ) / 10
    : null;
  return [
    `### Project X account — @${u.username} ${meta.cached ? "[cached]" : "[live]"}`,
    `- Name: ${u.name}${u.verified ? " ✓ verified" : ""}`,
    `- Followers: ${u.followers.toLocaleString()} · Following: ${u.following.toLocaleString()}`,
    accountAgeYears !== null ? `- Account age: ${accountAgeYears} years` : "",
    `- Total posts: ${u.postCount.toLocaleString()}`,
    u.description ? `- Bio: ${u.description.slice(0, 200)}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function renderUserTweets(tweets: Tweet[], handle: string, meta: FreshnessMeta): string {
  if (tweets.length === 0) return "";
  const lines = [
    `### @${handle} recent activity ${meta.cached ? "[cached]" : "[live]"}`,
    `- Last 20 posts pulled`,
  ];
  const top3 = [...tweets]
    .sort((a, b) => b.likes + b.retweets - (a.likes + a.retweets))
    .slice(0, 3);
  for (const t of top3) {
    lines.push(
      `- (${t.likes}❤ ${t.retweets}🔁): "${t.text.replace(/\s+/g, " ").slice(0, 200)}"`,
    );
  }
  return lines.join("\n");
}

function renderMentions(m: MentionSearch, meta: FreshnessMeta): string {
  if (m.tweets.length === 0) return "";
  const lines = [
    `### Open mention search ${meta.cached ? "[cached]" : "[live]"}`,
    `- Total tweets sampled: ${m.tweets.length} · Unique authors: ${m.uniqueAuthors}`,
    `- Lexicon-based sentiment (NOT LLM-derived): ${m.sentiment.positivePct}% positive, ${m.sentiment.negativePct}% negative, ${m.sentiment.neutralPct}% neutral`,
    `- Note: lexicon-based scoring is indicative only — interpret in context, do not quote raw percentages without disclaiming the methodology.`,
    `- Top tweets by engagement:`,
  ];
  for (const t of m.topByEngagement.slice(0, 3)) {
    lines.push(
      `  - @${t.author} (${t.authorFollowers.toLocaleString()}f, ${t.likes}❤): "${t.text.replace(/\s+/g, " ").slice(0, 200)}"`,
    );
  }
  return lines.join("\n");
}

function renderSubreddit(meta_: SubredditMeta, posts: RedditPost[], freshness: FreshnessMeta): string {
  const lines = [
    `### Subreddit pulse — r/${meta_.name} ${freshness.cached ? "[cached]" : "[live]"}`,
    `- Subscribers: ${meta_.subscribers.toLocaleString()}${meta_.activeUsers !== null ? ` · Online now: ${meta_.activeUsers.toLocaleString()}` : ""}`,
  ];
  if (posts.length > 0) {
    lines.push(`- Recent post titles:`);
    for (const p of posts.slice(0, 5)) {
      lines.push(`  - "${p.title}" (${p.score}↑ ${p.numComments}💬)`);
    }
  }
  return lines.join("\n");
}

function renderProposals(props: SnapshotProposal[], meta: FreshnessMeta): string {
  if (props.length === 0) return "";
  const lines = [
    `### Active governance proposals — Snapshot ${meta.cached ? "[cached]" : "[live]"}`,
  ];
  for (const p of props.slice(0, 5)) {
    lines.push(
      `- "${p.title}" — state: ${p.state}, ${p.scoresTotal.toLocaleString()} votes total (${p.link})`,
    );
  }
  return lines.join("\n");
}

function renderWebNarrative(results: TavilyResult[], meta: FreshnessMeta): string {
  if (results.length === 0) return "";
  const lines = [
    `### Narrative news search — Tavily ${meta.cached ? "[cached]" : "[live]"}`,
  ];
  for (const r of results) {
    lines.push(`- **${r.title}** (${r.url})`);
    lines.push(`  ${r.content.slice(0, 350)}`);
  }
  return lines.join("\n");
}

export async function buildSentinelDossier(
  query: string,
  topicType: TopicType,
  hints: CommanderHints,
): Promise<SentinelDossier> {
  const budget: CallBudget = newBudget();
  const startCalls = budget.remaining;

  const tasks: Array<{
    name: string;
    run: () => Promise<WithFreshness<unknown> | null>;
  }> = [];

  // Macro sentiment — unified to 14-day fetch so it shares cache key with
  // analyst-dossier's getFearGreed(14). Backtest showed duplicate calls
  // (limit=14 + limit=7) wasting API budget. Sentinel slices first 7 if needed.
  tasks.push({ name: "fng", run: () => getFearGreed(14) });

  // Tavily narrative search (cached)
  tasks.push({ name: "tavily", run: () => searchTavily(query, 2) });

  // GetXAPI: official account (if known) + mention search
  if (hints.twitterHandle) {
    tasks.push({ name: "twitterUser", run: () => getUserInfo(hints.twitterHandle!, budget) });
    tasks.push({
      name: "twitterUserTweets",
      run: () => getUserRecentTweets(hints.twitterHandle!, budget, 20),
    });
  }
  // Open mention search always, when getxapi configured
  tasks.push({ name: "twitterMentions", run: () => searchMentions(query, budget) });

  // Reddit subreddit pulse if known
  if (hints.subreddit) {
    tasks.push({ name: "subredditMeta", run: () => getSubredditMeta(hints.subreddit!) });
    tasks.push({ name: "subredditPosts", run: () => getSubredditNewPosts(hints.subreddit!, 10) });
  }

  // Snapshot proposals for protocol topics
  if (hints.snapshotSpace) {
    tasks.push({ name: "snapshot", run: () => getActiveProposals(hints.snapshotSpace!, 5) });
  } else if (topicType === "protocol") {
    // Heuristic: best-effort space inference (e.g. "aave" → "aave.eth")
    const guess = `${query.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "")}.eth`;
    tasks.push({ name: "snapshot", run: () => getActiveProposals(guess, 5) });
  }

  const settled = await Promise.allSettled(tasks.map((t) => t.run()));
  const failedSources: string[] = [];
  const sections: string[] = [];
  const freshnessMetas: FreshnessMeta[] = [];
  const endpointSources: string[] = [];
  let webResults: TavilyResult[] = [];
  let pendingSubredditMeta: { v: SubredditMeta; meta: FreshnessMeta } | null = null;
  let pendingSubredditPosts: { posts: RedditPost[] } | null = null;

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
      case "fng":
        sections.push(renderFng(v.data as FearGreedSeries, v.meta));
        break;
      case "tavily": {
        const list = v.data as TavilyResult[];
        if (list.length > 0) {
          webResults = list;
          sections.push(renderWebNarrative(list, v.meta));
        }
        break;
      }
      case "twitterUser":
        sections.push(renderTwitterUser(v.data as TwitterUser, v.meta));
        break;
      case "twitterUserTweets":
        if (hints.twitterHandle) {
          sections.push(
            renderUserTweets(v.data as Tweet[], hints.twitterHandle, v.meta),
          );
        }
        break;
      case "twitterMentions":
        sections.push(renderMentions(v.data as MentionSearch, v.meta));
        break;
      case "subredditMeta":
        pendingSubredditMeta = { v: v.data as SubredditMeta, meta: v.meta };
        break;
      case "subredditPosts":
        pendingSubredditPosts = { posts: v.data as RedditPost[] };
        break;
      case "snapshot": {
        const proposals = v.data as SnapshotProposal[];
        if (proposals.length > 0) sections.push(renderProposals(proposals, v.meta));
        break;
      }
    }
  }

  // Combine reddit meta + posts into one rendered section
  if (pendingSubredditMeta) {
    sections.push(
      renderSubreddit(
        pendingSubredditMeta.v,
        pendingSubredditPosts?.posts ?? [],
        pendingSubredditMeta.meta,
      ),
    );
  }

  const failuresLine =
    failedSources.length > 0 ? `\n\n_Sources unavailable: ${failedSources.join(", ")}_` : "";

  const markdown =
    sections.length === 0
      ? `_No live sentiment sources retrieved for "${query}". Treat findings as model-knowledge only._`
      : `## Live Sentiment Dossier\n\n${sections.join("\n\n")}${failuresLine}`;

  return {
    query,
    topicType,
    markdown,
    webResults,
    freshness: freshnessMetas,
    failedSources,
    endpointSources,
    getxapiCallsUsed: startCalls - budget.remaining,
  };
}
