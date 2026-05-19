import { NextResponse } from "next/server";
import { runPipeline } from "@/lib/probes/pipeline";
import {
  insertSession,
  findRecentDuplicate,
} from "@/lib/repos/research-sessions";
import { recordPaymentNonce } from "@/lib/repos/nonces";
import { logger } from "@/lib/logger";

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

  // Payer address: in production this comes from x402-next's request context,
  // header here as fallback / dev path.
  const payer = (
    req.headers.get("X-PAYER-ADDRESS") ??
    (req as unknown as { payer?: { address?: string } }).payer?.address ??
    ""
  ).toLowerCase();
  if (!payer.startsWith("0x") || payer.length !== 42) {
    return NextResponse.json({ error: "no payer" }, { status: 402 });
  }
  const paymentTx = req.headers.get("X-PAYMENT-TX") ?? null;
  const paymentNonce = req.headers.get("X-PAYMENT-NONCE") ?? null;

  // Replay protection: payment nonce must be unique
  if (paymentNonce && !recordPaymentNonce(paymentNonce, payer)) {
    return NextResponse.json(
      { error: "duplicate payment nonce" },
      { status: 409 },
    );
  }

  // Idempotency: return existing recent session if same wallet+topic within 60s
  const recent = findRecentDuplicate(payer, topic, 60_000);
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

  insertSession({
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
