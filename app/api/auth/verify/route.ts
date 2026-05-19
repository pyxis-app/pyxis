import { NextResponse } from "next/server";
import { SiweMessage } from "siwe";
import { verifySiweMessage, issueJwt } from "@/lib/siwe";
import { consumeAuthNonce } from "@/lib/repos/nonces";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const { message, signature } = (await req.json()) as {
      message?: string;
      signature?: string;
    };
    if (!message || !signature) {
      return NextResponse.json({ error: "missing fields" }, { status: 400 });
    }

    const parsed = new SiweMessage(message);
    if (!(await consumeAuthNonce(parsed.nonce))) {
      return NextResponse.json(
        { error: "invalid or used nonce" },
        { status: 401 },
      );
    }

    const wallet = await verifySiweMessage(message, signature, parsed.nonce);
    const token = issueJwt(wallet);

    const res = NextResponse.json({ ok: true, address: wallet });
    res.cookies.set("pyxis_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
      path: "/",
    });
    return res;
  } catch (err) {
    logger.warn("auth.verify_failed", { err: String(err) });
    return NextResponse.json({ error: "verify failed" }, { status: 401 });
  }
}
