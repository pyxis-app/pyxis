import { env } from "./env";

// USDC contract addresses by network
const USDC: Record<string, string> = {
  "base-sepolia": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  "base": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
};

export function x402Config() {
  const network = env.X402_NETWORK();
  return {
    payTo: env.X402_PAY_TO(),
    price: env.X402_PRICE_USDC(),
    network,
    usdc: USDC[network] ?? USDC["base-sepolia"],
    facilitator: env.X402_FACILITATOR(),
  };
}
