import { NextResponse, type NextRequest } from "next/server";
import { paymentMiddleware } from "x402-next";
import type { Address } from "viem";
import { x402Config } from "@/lib/x402";
import { env } from "@/lib/env";
import { rateLimit, clientIp } from "@/lib/ratelimit";
import { docsRewrite } from "@/lib/docs-rewrite";

const cfg = x402Config();
const freeMode = env.X402_FREE_MODE();

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
  // docs.usepyxis.com → /docs subtree
  const docsTarget = docsRewrite(req.headers.get("host"), req.nextUrl.pathname);
  if (docsTarget) {
    const url = req.nextUrl.clone();
    url.pathname = docsTarget;
    return NextResponse.rewrite(url);
  }

  if (req.nextUrl.pathname.startsWith("/api/research")) {
    const ip = clientIp(req);
    const { ok, retryAfter } = rateLimit(`research:${ip}`, 30, 60_000);
    if (!ok) {
      return NextResponse.json(
        { error: "rate_limited" },
        { status: 429, headers: { "Retry-After": String(retryAfter) } },
      );
    }
    if (freeMode) return NextResponse.next();
    return payment(req);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|.*\\.).*)"],
};
