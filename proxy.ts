import { NextResponse, type NextRequest } from "next/server";
import { paymentMiddleware } from "x402-next";
import type { Address } from "viem";
import { x402Config } from "@/lib/x402";
import { rateLimit, clientIp } from "@/lib/ratelimit";

const cfg = x402Config();

const payment = paymentMiddleware(
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

export async function proxy(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/api/research")) {
    const ip = clientIp(req);
    const { ok, retryAfter } = rateLimit(`research:${ip}`, 30, 60_000);
    if (!ok) {
      return NextResponse.json(
        { error: "rate_limited" },
        { status: 429, headers: { "Retry-After": String(retryAfter) } },
      );
    }
  }
  return payment(req);
}

export const config = { matcher: ["/api/research"] };
