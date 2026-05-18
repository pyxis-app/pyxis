import { describe, it, expect } from "vitest";
import { rateLimit } from "../ratelimit";

describe("rateLimit", () => {
  it("allows N requests, then blocks", () => {
    const key = "ip-1";
    for (let i = 0; i < 5; i++) expect(rateLimit(key, 5, 60_000).ok).toBe(true);
    expect(rateLimit(key, 5, 60_000).ok).toBe(false);
  });

  it("different keys do not interfere", () => {
    expect(rateLimit("a", 1, 60_000).ok).toBe(true);
    expect(rateLimit("a", 1, 60_000).ok).toBe(false);
    expect(rateLimit("b", 1, 60_000).ok).toBe(true);
  });
});
