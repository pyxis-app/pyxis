import { SiweMessage } from "siwe";
import jwt from "jsonwebtoken";
import { env } from "./env";

export async function verifySiweMessage(
  message: string,
  signature: string,
  expectedNonce: string,
): Promise<string> {
  const siwe = new SiweMessage(message);
  const result = await siwe.verify({ signature, nonce: expectedNonce });
  if (!result.success) throw new Error("siwe-verify-failed");
  return result.data.address.toLowerCase();
}

export function issueJwt(wallet: string): string {
  return jwt.sign({ sub: wallet.toLowerCase() }, env.SIWE_JWT_SECRET(), {
    algorithm: "HS256",
    expiresIn: "24h",
  });
}

export function verifyJwt(token: string): string | null {
  try {
    const decoded = jwt.verify(token, env.SIWE_JWT_SECRET()) as {
      sub?: string;
    };
    return decoded.sub ? decoded.sub.toLowerCase() : null;
  } catch {
    return null;
  }
}
