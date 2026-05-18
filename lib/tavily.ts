export interface TavilyResult {
  title: string;
  url: string;
  content: string;
}

export async function searchTavily(
  query: string,
  maxResults = 2,
): Promise<TavilyResult[]> {
  const key = process.env.TAVILY_API_KEY;
  if (!key) throw new Error("TAVILY_API_KEY not set");

  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: key,
      query,
      max_results: maxResults,
      search_depth: "basic",
      include_answer: false,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    throw new Error(
      `Tavily ${res.status}: ${await res.text().catch(() => "")}`,
    );
  }

  const json = (await res.json()) as { results?: TavilyResult[] };
  return json.results ?? [];
}
