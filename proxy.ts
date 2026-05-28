import { NextResponse, type NextRequest } from "next/server";
import { paymentMiddleware } from "x402-next";
import type { Address } from "viem";
import { x402Config } from "@/lib/x402";
import { env } from "@/lib/env";
import { rateLimit, clientIp } from "@/lib/ratelimit";
import { docsRewrite } from "@/lib/docs-rewrite";

const freeMode = env.X402_FREE_MODE();

// Apply baseline security headers to every response. Tightened from Vercel
// defaults: explicit XCTO / Referrer-Policy / Permissions-Policy / HSTS with
// includeSubDomains. No CSP yet — that needs a curated connect-src list
// against the wallet + analytics surface, scheduled for v3.3.0.
function withSecurity(
  res: NextResponse,
  opts: { frameOptions?: "DENY" | "SAMEORIGIN" } = {},
): NextResponse {
  res.headers.set("X-Frame-Options", opts.frameOptions ?? "SAMEORIGIN");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  );
  // Tightening Vercel's max-age=63072000 with includeSubDomains. NOT preload
  // yet — that's a permanent commitment, defer until 6 months stable.
  res.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains",
  );
  return res;
}

// Constructed lazily so non-payment requests (docs, landing, every page now
// reaching the proxy via the broadened matcher) never touch x402 env. Only
// a real /api/research call in paid mode initializes the payment middleware.
let payment: ReturnType<typeof paymentMiddleware> | null = null;
function getPayment() {
  if (!payment) {
    const cfg = x402Config();
    payment = paymentMiddleware(
      cfg.payTo as Address,
      {
        "/api/research": {
          price: cfg.price,
          network: cfg.network as "base",
          config: {
            description: "Pyxis research session",
            mimeType: "application/json",
            maxTimeoutSeconds: 60,
          },
        },
      },
      { url: cfg.facilitator as `${string}://${string}` },
    );
  }
  return payment;
}

export async function proxy(req: NextRequest) {
  // docs.usepyxis.com → /docs subtree
  const docsTarget = docsRewrite(req.headers.get("host"), req.nextUrl.pathname);
  if (docsTarget) {
    const url = req.nextUrl.clone();
    url.pathname = docsTarget;
    return NextResponse.rewrite(url);
  }

  // Block framing of /cli-auth to prevent CSRF via embedded sign-in.
  if (req.nextUrl.pathname.startsWith("/cli-auth")) {
    const res = withSecurity(NextResponse.next(), { frameOptions: "DENY" });
    res.headers.set("Cache-Control", "no-store");
    return res;
  }

  // Loose rate limit on /api/auth/* to prevent nonce-table flooding and
  // verify brute-force. Auth flow normally hits each endpoint 1-2x per
  // sign-in — 60/min covers retries on wallet flake while still blocking
  // a runaway script.
  if (req.nextUrl.pathname === "/api/auth/nonce") {
    const ip = clientIp(req);
    const { ok, retryAfter } = rateLimit(`auth-nonce:${ip}`, 60, 60_000);
    if (!ok) {
      return withSecurity(
        NextResponse.json(
          { error: "rate_limited" },
          { status: 429, headers: { "Retry-After": String(retryAfter) } },
        ),
      );
    }
  }
  if (req.nextUrl.pathname === "/api/auth/verify") {
    const ip = clientIp(req);
    const { ok, retryAfter } = rateLimit(`auth-verify:${ip}`, 30, 60_000);
    if (!ok) {
      return withSecurity(
        NextResponse.json(
          { error: "rate_limited" },
          { status: 429, headers: { "Retry-After": String(retryAfter) } },
        ),
      );
    }
  }

  if (req.nextUrl.pathname.startsWith("/api/research")) {
    const ip = clientIp(req);
    const { ok, retryAfter } = rateLimit(`research:${ip}`, 30, 60_000);
    if (!ok) {
      return withSecurity(
        NextResponse.json(
          { error: "rate_limited" },
          { status: 429, headers: { "Retry-After": String(retryAfter) } },
        ),
      );
    }
    if (freeMode) return withSecurity(NextResponse.next());
    const paymentRes = (await getPayment()(req)) as NextResponse;
    return withSecurity(paymentRes);
  }

  return withSecurity(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/|.*\\.).*)"],
};
