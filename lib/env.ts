function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}
function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export const env = {
  OPENGATEWAY_API_KEY: () => required("OPENGATEWAY_API_KEY"),
  OPENGATEWAY_BASE_URL: () =>
    optional("OPENGATEWAY_BASE_URL", "https://opengateway.gitlawb.com/v1"),
  OPENGATEWAY_MODEL: () => optional("OPENGATEWAY_MODEL", "mimo-v2.5-pro"),
  TAVILY_API_KEY: () => required("TAVILY_API_KEY"),
  X402_NETWORK: () => optional("X402_NETWORK", "base"),
  X402_PAY_TO: () => required("X402_PAY_TO"),
  X402_PRICE_USDC: () => optional("X402_PRICE_USDC", "0.10"),
  X402_FREE_MODE: () =>
    optional("NEXT_PUBLIC_X402_FREE_MODE", "false") === "true",
  X402_FACILITATOR: () =>
    optional("X402_FACILITATOR_URL", "https://x402.org/facilitator"),
  SIWE_JWT_SECRET: () => required("SIWE_JWT_SECRET"),
  // The host the SIWE signature must be bound to. The client signs with
  // `window.location.host`, so this must match the deployed host exactly.
  // Defaults to APP_URL's host (prod: usepyxis.com) so we don't silently fall
  // back to localhost in production. Override with SIWE_DOMAIN only if the
  // signing origin differs from APP_URL.
  SIWE_DOMAIN: () => {
    const explicit = process.env.SIWE_DOMAIN;
    if (explicit) return explicit;
    try {
      return new URL(env.APP_URL()).host;
    } catch {
      return "localhost:3000";
    }
  },
  APP_URL: () => optional("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
};
