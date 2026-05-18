"use client";

import { SiweMessage } from "siwe";
import { signMessage } from "wagmi/actions";
import type { Config } from "wagmi";

export async function signInWithEthereum(opts: {
  config: Config;
  address: `0x${string}`;
  chainId: number;
}) {
  // 1. ask server for a nonce
  const nonceRes = await fetch("/api/auth/nonce");
  if (!nonceRes.ok) throw new Error("nonce fetch failed");
  const { nonce } = await nonceRes.json();

  // 2. build SIWE message
  const message = new SiweMessage({
    domain: window.location.host,
    address: opts.address,
    statement: "Sign in to Pyxis to access your research history.",
    uri: window.location.origin,
    version: "1",
    chainId: opts.chainId,
    nonce,
    issuedAt: new Date().toISOString(),
  }).prepareMessage();

  // 3. sign via wallet
  const signature = await signMessage(opts.config, { message });

  // 4. verify on server → sets session cookie
  const verifyRes = await fetch("/api/auth/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, signature }),
  });
  if (!verifyRes.ok) throw new Error("verify failed");
  return await verifyRes.json();
}

export async function signOut() {
  // Server doesn't track sessions other than cookie expiry; client clears cookie by setting empty
  document.cookie = "pyxis_session=; Path=/; Max-Age=0; SameSite=Strict";
}
