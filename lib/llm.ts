import OpenAI from "openai";
import { env } from "./env";

export const MODEL = env.OPENROUTER_MODEL();

let _client: OpenAI | null = null;
function client(): OpenAI {
  if (_client) return _client;
  _client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: env.OPENROUTER_API_KEY(),
    defaultHeaders: {
      "HTTP-Referer": env.APP_URL(),
      "X-Title": "Pyxis - Web3 Intelligence Swarm",
    },
  });
  return _client;
}

export interface CompletionParams {
  system: string;
  user: string;
  maxTokens: number;
  temperature?: number;
  jsonMode?: boolean;
}

export async function complete(p: CompletionParams): Promise<string> {
  const res = await client().chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: p.system },
      { role: "user", content: p.user },
    ],
    max_tokens: p.maxTokens,
    temperature: p.temperature ?? 0.7,
    ...(p.jsonMode ? { response_format: { type: "json_object" } } : {}),
  });
  return res.choices[0]?.message?.content ?? "";
}
