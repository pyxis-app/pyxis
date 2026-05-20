import { NextResponse } from "next/server";
import { runPipeline } from "@/lib/probes/pipeline";
import {
  insertSession,
  findRecentDuplicate,
} from "@/lib/repos/research-sessions";
import { recordPaymentNonce } from "@/lib/repos/nonces";
import { verifyJwt } from "@/lib/siwe";
import { verifyUsdcPayment } from "@/lib/payment-verify";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

function parseCookie(req: Request, name: string): string | null {
  const c = req.headers.get("cookie");
  if (!c) return null;
  for (const part of c.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

export async function POST(req: Request) {
  let body: { topic?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const topic = body.topic?.trim();
  if (!topic || topic.length < 3 || topic.length > 200) {
    return NextResponse.json(
      { error: "topic must be 3-200 chars" },
      { status: 400 },
    );
  }

  // SIWE is mandatory. The payer is derived ONLY from the cryptographically-
  // verified session cookie — never from a client header. This closes the IDOR
  // where a spoofed X-PAYER-ADDRESS let anyone write research into another
  // wallet's history. No valid session → no research.
  const sessionJwt = parseCookie(req, "pyxis_session");
  const payer = sessionJwt ? verifyJwt(sessionJwt) : null;
  if (!payer) {
    return NextResponse.json({ error: "sign in required" }, { status: 401 });
  }

  // Payment proof. In free beta no payment occurs, so never persist a tx. When
  // paid, only store a tx hash we've actually confirmed on-chain (correct USDC
  // amount → our pay-to address); a claimed-but-unverified hash is dropped/
  // rejected so it can't be rendered as a fake basescan "proof of payment".
  let paymentTx: string | null = null;
  if (!env.X402_FREE_MODE()) {
    const claimedTx = req.headers.get("X-PAYMENT-TX");
    if (claimedTx) {
      if (!(await verifyUsdcPayment(claimedTx))) {
        return NextResponse.json(
          { error: "payment not verified" },
          { status: 402 },
        );
      }
      paymentTx = claimedTx.toLowerCase();
    }
  }
  const paymentNonce = req.headers.get("X-PAYMENT-NONCE") ?? null;

  // Replay protection: payment nonce must be unique
  if (paymentNonce && !(await recordPaymentNonce(paymentNonce, payer))) {
    return NextResponse.json(
      { error: "duplicate payment nonce" },
      { status: 409 },
    );
  }

  // Idempotency: return existing recent session if same wallet+topic within 60s
  const recent = await findRecentDuplicate(payer, topic, 60_000);
  if (recent) {
    logger.info("research.idempotent_hit", { wallet: payer, id: recent.id });
    return NextResponse.json({
      id: recent.id,
      topic: recent.topic,
      briefing: recent.briefing.briefing,
      confidence: recent.briefing.confidence,
      sources: recent.briefing.sources,
      partial: recent.briefing.partial,
      topicType: recent.briefing.topicType ?? null,
      freshness: recent.briefing.freshness ?? [],
      createdAt: new Date(recent.createdAt).toISOString(),
      idempotent: true,
    });
  }

  logger.info("research.start", { wallet: payer, topic });
  const result = await runPipeline(topic);

  await insertSession({
    id: result.id,
    walletAddress: payer,
    topic: result.topic,
    briefing: {
      briefing: result.briefing,
      confidence: result.confidence,
      sources: result.sources,
      partial: result.partial,
      topicType: result.topicType,
      freshness: result.freshness,
    },
    paymentTx,
  });

  logger.info("research.done", {
    wallet: payer,
    id: result.id,
    partial: result.partial,
    sources: result.sources,
  });
  return NextResponse.json(result);
}
