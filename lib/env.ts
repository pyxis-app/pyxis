function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}
function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export const env = {
  OPENROUTER_API_KEY: () => required("OPENROUTER_API_KEY"),
  OPENROUTER_MODEL: () => optional("OPENROUTER_MODEL", "openai/gpt-4o-mini"),
  TAVILY_API_KEY: () => required("TAVILY_API_KEY"),
  X402_NETWORK: () => optional("X402_NETWORK", "base-sepolia"),
  X402_PAY_TO: () => required("X402_PAY_TO"),
  X402_PRICE_USDC: () => optional("X402_PRICE_USDC", "0.25"),
  X402_FACILITATOR: () =>
    optional("X402_FACILITATOR_URL", "https://x402.org/facilitator"),
  SIWE_JWT_SECRET: () => required("SIWE_JWT_SECRET"),
  SIWE_DOMAIN: () => optional("SIWE_DOMAIN", "localhost:3000"),
  APP_URL: () => optional("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
};
