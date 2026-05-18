import { describe, it, expect, vi } from "vitest";
import { withRetry } from "../retry";

describe("withRetry", () => {
  it("returns the value on first success", async () => {
    const fn = vi.fn().mockResolvedValue("ok");
    expect(await withRetry(fn, 3, 1)).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries up to N times before throwing", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("boom"));
    await expect(withRetry(fn, 2, 1)).rejects.toThrow("boom");
    expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
  });

  it("succeeds on a later attempt", async () => {
    let n = 0;
    const fn = vi.fn(async () => {
      if (++n < 2) throw new Error("flaky");
      return "ok";
    });
    expect(await withRetry(fn, 3, 1)).toBe("ok");
    expect(n).toBe(2);
  });
});
