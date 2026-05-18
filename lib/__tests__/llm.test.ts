import { describe, it, expect, vi, beforeEach } from "vitest";

describe("complete", () => {
  beforeEach(() => {
    process.env.OPENROUTER_API_KEY = "test";
    process.env.NEXT_PUBLIC_APP_URL = "https://pyxis.test";
    vi.resetModules();
  });

  it("calls OpenRouter with locked model and attribution headers", async () => {
    const create = vi.fn().mockResolvedValue({
      choices: [{ message: { content: "hello world" } }],
    });
    vi.doMock("openai", () => ({
      default: vi
        .fn()
        .mockImplementation(() => ({ chat: { completions: { create } } })),
    }));

    const { complete, MODEL } = await import("../llm");
    const out = await complete({ system: "S", user: "U", maxTokens: 100 });

    expect(out).toBe("hello world");
    expect(MODEL).toBe("openai/gpt-4o-mini");
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "openai/gpt-4o-mini",
        max_tokens: 100,
        messages: [
          { role: "system", content: "S" },
          { role: "user", content: "U" },
        ],
      }),
    );
  });
});
