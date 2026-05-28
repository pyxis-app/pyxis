import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/repos/csp-violations");
vi.mock("@/lib/ratelimit", () => ({ clientIp: () => "1.2.3.4" }));
vi.mock("@/lib/logger", () => ({ logger: { warn: vi.fn() } }));

import { POST } from "../route";
import { insertCspViolation } from "@/lib/repos/csp-violations";

function makeReq(body: unknown, contentType = "application/json"): Request {
  return new Request("http://localhost/api/csp-report", {
    method: "POST",
    headers: { "Content-Type": contentType },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("/api/csp-report POST", () => {
  beforeEach(() => {
    vi.mocked(insertCspViolation).mockReset();
    vi.mocked(insertCspViolation).mockResolvedValue(undefined);
  });

  it("returns 204 on malformed JSON without crashing", async () => {
    const res = await POST(makeReq("not-json"));
    expect(res.status).toBe(204);
    expect(insertCspViolation).not.toHaveBeenCalled();
  });

  it("returns 204 on empty object without inserting", async () => {
    vi.mocked(insertCspViolation).mockClear();
    const res = await POST(makeReq({}));
    expect(res.status).toBe(204);
    // {} is parsed as a single report with violatedDirective="unknown" — still gets recorded
    expect(insertCspViolation).toHaveBeenCalledOnce();
  });

  it("inserts report from old format (csp-report wrapper)", async () => {
    const report = {
      "violated-directive": "script-src",
      "blocked-uri": "https://evil.example.com/x.js",
      "document-uri": "https://usepyxis.com/",
      "line-number": 42,
    };
    const res = await POST(makeReq({ "csp-report": report }));
    expect(res.status).toBe(204);
    expect(insertCspViolation).toHaveBeenCalledOnce();
    const arg = vi.mocked(insertCspViolation).mock.calls[0]?.[0];
    expect(arg?.violatedDirective).toBe("script-src");
    expect(arg?.blockedUri).toBe("https://evil.example.com/x.js");
    expect(arg?.lineNumber).toBe(42);
    expect(arg?.clientIp).toBe("1.2.3.4");
  });

  it("inserts each report from new format (Reporting API array)", async () => {
    const res = await POST(
      makeReq([
        {
          type: "csp-violation",
          body: { effectiveDirective: "img-src", blockedURL: "https://evil.example.com/x.png" },
        },
        {
          type: "csp-violation",
          body: { effectiveDirective: "script-src", blockedURL: "https://evil.example.com/y.js" },
        },
      ]),
    );
    expect(res.status).toBe(204);
    expect(insertCspViolation).toHaveBeenCalledTimes(2);
  });

  it("returns 204 even when insert throws (log-only failure mode)", async () => {
    vi.mocked(insertCspViolation).mockRejectedValueOnce(new Error("db down"));
    const res = await POST(
      makeReq({ "csp-report": { "violated-directive": "script-src" } }),
    );
    expect(res.status).toBe(204);
  });
});
