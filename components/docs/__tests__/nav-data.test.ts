import { describe, it, expect } from "vitest";
import { DOC_NAV, isActiveDoc } from "@/components/docs/nav-data";

describe("docs nav-data", () => {
  it("has three groups and nine entries total", () => {
    expect(DOC_NAV).toHaveLength(3);
    expect(DOC_NAV.flatMap((g) => g.items)).toHaveLength(9);
  });

  it("Introduction is active only at /docs exactly", () => {
    expect(isActiveDoc("/docs", "/docs")).toBe(true);
    expect(isActiveDoc("/docs", "/docs/agents")).toBe(false);
  });

  it("a sub-page is active on its own path", () => {
    expect(isActiveDoc("/docs/agents", "/docs/agents")).toBe(true);
    expect(isActiveDoc("/docs/agents", "/docs")).toBe(false);
  });
});
