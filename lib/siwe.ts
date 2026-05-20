import { SiweMessage } from "siwe";
import jwt from "jsonwebtoken";
import { env } from "./env";

export async function verifySiweMessage(
  message: string,
  signature: string,
  expectedNonce: string,
): Promise<string> {
  const siwe = new SiweMessage(message);
  // Bind the signature to OUR domain + nonce + current time. Without `domain`,
  // a message signed for any origin would verify here, enabling a phishing
  // relay (EIP-4361's whole point is domain binding). `time` makes siwe enforce
  // the message's expirationTime/notBefore if present.
  const result = await siwe.verify({
    signature,
    nonce: expectedNonce,
    domain: env.SIWE_DOMAIN(),
    time: new Date().toISOString(),
  });
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
    const decoded = jwt.verify(token, env.SIWE_JWT_SECRET(), {
      algorithms: ["HS256"],
    }) as {
      sub?: string;
    };
    return decoded.sub ? decoded.sub.toLowerCase() : null;
  } catch {
    return null;
  }
}
