import { describe, it, expect } from "vitest";
import { docsRewrite } from "@/lib/docs-rewrite";

describe("docsRewrite", () => {
  it("rewrites the docs host root to /docs", () => {
    expect(docsRewrite("docs.usepyxis.com", "/")).toBe("/docs");
  });
  it("prefixes other paths on the docs host", () => {
    expect(docsRewrite("docs.usepyxis.com", "/quickstart")).toBe("/docs/quickstart");
  });
  it("ignores a port in the host header", () => {
    expect(docsRewrite("docs.usepyxis.com:443", "/faq")).toBe("/docs/faq");
  });
  it("returns null when already under /docs (no double prefix)", () => {
    expect(docsRewrite("docs.usepyxis.com", "/docs/agents")).toBeNull();
  });
  it("returns null for the apex host", () => {
    expect(docsRewrite("usepyxis.com", "/research")).toBeNull();
  });
  it("returns null when host is missing", () => {
    expect(docsRewrite(null, "/")).toBeNull();
  });
});
