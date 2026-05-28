import { describe, it, expect, beforeAll, beforeEach } from "vitest";

beforeAll(() => {
  process.env.SIWE_JWT_SECRET ||= "test-secret-32-bytes-test-test-test";
});

import { POST, PUT, __resetPendingForTests } from "../route";
import { issueJwt } from "@/lib/siwe";
import { createHash, randomBytes } from "node:crypto";

const TEST_WALLET = "0x347f000000000000000000000000000000000000";

function reqWithBody(body: unknown, cookie?: string, method = "POST"): Request {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (cookie) headers["cookie"] = cookie;
  return new Request("http://localhost/api/cli/token", {
    method,
    headers,
    body: JSON.stringify(body),
  });
}

function genChallengeAndVerifier() {
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

describe("/api/cli/token POST (reserve)", () => {
  beforeEach(() => __resetPendingForTests());

  it("returns 401 when no session cookie", async () => {
    const { challenge } = genChallengeAndVerifier();
    const res = await POST(reqWithBody({ challenge }));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("sign in required");
  });

  it("returns wallet + exp on valid cookie and challenge, stores entry", async () => {
    const { challenge } = genChallengeAndVerifier();
    const token = issueJwt(TEST_WALLET);
    const res = await POST(reqWithBody({ challenge }, `pyxis_session=${token}`));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.wallet).toBe(TEST_WALLET);
    expect(typeof json.exp).toBe("number");
  });

  it("rejects malformed challenge (too short)", async () => {
    const token = issueJwt(TEST_WALLET);
    const res = await POST(reqWithBody({ challenge: "tooshort" }, `pyxis_session=${token}`));
    expect(res.status).toBe(400);
  });
});

describe("/api/cli/token PUT (exchange)", () => {
  beforeEach(() => __resetPendingForTests());

  async function reserve(challenge: string, wallet = TEST_WALLET) {
    const token = issueJwt(wallet);
    return POST(reqWithBody({ challenge }, `pyxis_session=${token}`));
  }

  it("returns token on valid verifier match", async () => {
    const { verifier, challenge } = genChallengeAndVerifier();
    await reserve(challenge);
    const res = await PUT(reqWithBody({ code: challenge, verifier }, undefined, "PUT"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(typeof json.token).toBe("string");
    expect(json.wallet).toBe(TEST_WALLET);
  });

  it("rejects on verifier mismatch (401)", async () => {
    const { challenge } = genChallengeAndVerifier();
    const { verifier: wrongVerifier } = genChallengeAndVerifier();
    await reserve(challenge);
    const res = await PUT(reqWithBody({ code: challenge, verifier: wrongVerifier }, undefined, "PUT"));
    expect(res.status).toBe(401);
  });

  it("deletes entry on successful exchange (one-shot replay protection)", async () => {
    const { verifier, challenge } = genChallengeAndVerifier();
    await reserve(challenge);
    const res1 = await PUT(reqWithBody({ code: challenge, verifier }, undefined, "PUT"));
    expect(res1.status).toBe(200);
    const res2 = await PUT(reqWithBody({ code: challenge, verifier }, undefined, "PUT"));
    expect(res2.status).toBe(401);
  });

  it("rejects exchange when no entry exists (401)", async () => {
    const { verifier, challenge } = genChallengeAndVerifier();
    const res = await PUT(reqWithBody({ code: challenge, verifier }, undefined, "PUT"));
    expect(res.status).toBe(401);
  });
});
