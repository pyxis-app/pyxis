import { NextResponse } from "next/server";
import { issueAuthNonce } from "@/lib/repos/nonces";

export async function GET() {
  const nonce = await issueAuthNonce();
  return NextResponse.json({ nonce });
}
