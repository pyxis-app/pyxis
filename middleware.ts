import { paymentMiddleware } from "x402-next";
import type { Address } from "viem";
import { x402Config } from "@/lib/x402";

const cfg = x402Config();

export const middleware = paymentMiddleware(
  cfg.payTo as Address,
  {
    "/api/research": {
      price: cfg.price,
      network: cfg.network as "base" | "base-sepolia",
      config: {
        description: "Pyxis research session",
        mimeType: "application/json",
        maxTimeoutSeconds: 60,
      },
    },
  },
  { url: cfg.facilitator as `${string}://${string}` },
);

export const config = { matcher: ["/api/research"] };
