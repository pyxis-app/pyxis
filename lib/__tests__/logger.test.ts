import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger, redact } from "../logger";

describe("redact", () => {
  it("masks signature-like strings", () => {
    const long = "0x" + "a".repeat(130);
    expect(redact(long)).toMatch(/^0xa{4}\.\.\.a{4}$/);
  });

  it("leaves short strings unchanged", () => {
    expect(redact("hello")).toBe("hello");
  });

  it("redacts X-PAYMENT header value field", () => {
    const headers = {
      "X-PAYMENT": "base64encodedlongpayload" + "x".repeat(200),
    };
    const out = logger.formatHeaders(headers);
    expect(out["X-PAYMENT"]).toMatch(/\.\.\./);
  });
});

describe("logger.info", () => {
  beforeEach(() => vi.spyOn(console, "log").mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it("writes a JSON line", () => {
    logger.info("event", { foo: "bar" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const logged = (console.log as any).mock.calls[0][0];
    const parsed = JSON.parse(logged);
    expect(parsed.level).toBe("info");
    expect(parsed.event).toBe("event");
    expect(parsed.foo).toBe("bar");
  });
});
