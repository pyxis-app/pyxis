import { describe, it, expect, beforeAll } from "vitest";

beforeAll(() => {
  process.env.SIWE_JWT_SECRET = "test-secret-32-bytes-test-test-test";
});

describe("siwe jwt", () => {
  it("issued jwt can be verified and returns wallet", async () => {
    const { issueJwt, verifyJwt } = await import("../siwe");
    const token = issueJwt("0xABC");
    expect(verifyJwt(token)).toBe("0xabc");
  });

  it("garbage token returns null", async () => {
    const { verifyJwt } = await import("../siwe");
    expect(verifyJwt("not-a-jwt")).toBeNull();
  });
});
