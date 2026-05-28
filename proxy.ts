import { NextResponse, type NextRequest } from "next/server";
import { paymentMiddleware } from "x402-next";
import type { Address } from "viem";
import { x402Config } from "@/lib/x402";
import { env } from "@/lib/env";
import { rateLimit, clientIp } from "@/lib/ratelimit";
import { docsRewrite } from "@/lib/docs-rewrite";

const freeMode = env.X402_FREE_MODE();

// Baseline CSP directives shipped in v3.3.0 as REPORT-ONLY. The connect-src
// allowlist covers WalletConnect (Web3 wallet bridge) + Vercel analytics +
// self. 'unsafe-inline' / 'unsafe-eval' on script-src reflect what Next.js
// 16 + Turbopack emit at runtime; will tighten when violations data lets us.
// frame-ancestors is set per-route from the X-Frame-Options value below.
const CSP_REPORT_ONLY_BASE = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' wss://*.walletconnect.com wss://*.walletconnect.org https://*.walletconnect.com https://*.walletconnect.org https://api.web3modal.com https://explorer-api.walletconnect.com https://va.vercel-scripts.com https://vitals.vercel-insights.com",
  "frame-src 'self' https://verify.walletconnect.com https://verify.walletconnect.org",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "report-uri /api/csp-report",
];

// Apply baseline security headers to every response. Tightened from Vercel
// defaults: explicit XCTO / Referrer-Policy / Permissions-Policy / HSTS with
// includeSubDomains, plus a Report-Only CSP that pipes violations to
// /api/csp-report for later policy refinement before enforce mode flips on.
function withSecurity(
  res: NextResponse,
  opts: { frameOptions?: "DENY" | "SAMEORIGIN" } = {},
): NextResponse {
  const xfo = opts.frameOptions ?? "SAMEORIGIN";
  res.headers.set("X-Frame-Options", xfo);
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
  // CSP — Report-Only. frame-ancestors aligned to the route's XFO value.
  const frameAncestors = xfo === "DENY" ? "'none'" : "'self'";
  const csp = [...CSP_REPORT_ONLY_BASE, `frame-ancestors ${frameAncestors}`].join("; ");
  res.headers.set("Content-Security-Policy-Report-Only", csp);
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

  // Rate limit on /api/csp-report. CSP violation reports can be high-volume
  // (every page load if policy is broken). Silently drop above the cap —
  // returning 429 would just generate more reports because browsers retry.
  if (req.nextUrl.pathname === "/api/csp-report") {
    const ip = clientIp(req);
    const { ok } = rateLimit(`csp-report:${ip}`, 200, 60_000);
    if (!ok) {
      return withSecurity(new NextResponse(null, { status: 204 }));
    }
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
