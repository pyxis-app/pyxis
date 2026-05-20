import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import { Callout, AgentCard, AgentGrid, HonestGap } from "@/components/docs/mdx-ui";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (p) => (
      <h1
        className="mb-3 font-[family-name:var(--font-fraunces)] text-3xl font-semibold tracking-tight md:text-[40px] md:leading-[1.1]"
        {...p}
      />
    ),
    h2: (p) => (
      <h2
        className="mb-4 mt-10 font-[family-name:var(--font-fraunces)] text-2xl font-semibold tracking-tight"
        {...p}
      />
    ),
    h3: (p) => <h3 className="mb-2 mt-8 font-mono text-base font-medium" {...p} />,
    p: (p) => <p className="mb-3.5 max-w-[64ch] leading-relaxed text-[var(--foreground)]/80" {...p} />,
    a: ({ href = "", ...rest }) => (
      <Link href={href} className="text-[var(--accent)] underline-offset-2 hover:underline" {...rest} />
    ),
    ul: (p) => <ul className="mb-4 max-w-[64ch] list-disc space-y-1.5 pl-5 text-[var(--foreground)]/80" {...p} />,
    ol: (p) => <ol className="mb-4 max-w-[64ch] list-decimal space-y-1.5 pl-5 text-[var(--foreground)]/80" {...p} />,
    li: (p) => <li className="leading-relaxed" {...p} />,
    strong: (p) => <strong className="font-semibold text-[var(--foreground)]" {...p} />,
    code: (p) => (
      <code className="rounded bg-[var(--card)] px-1.5 py-0.5 font-mono text-[0.85em] text-[var(--scout)]" {...p} />
    ),
    hr: () => <hr className="my-8 border-[var(--hair)]" />,
    table: (p) => <table className="my-5 w-full border-collapse text-sm" {...p} />,
    th: (p) => (
      <th
        className="border-b border-[var(--hair)] px-3 py-2 text-left font-mono text-[11px] uppercase tracking-wider text-[var(--muted)]"
        {...p}
      />
    ),
    td: (p) => <td className="border-b border-[var(--hair)] px-3 py-2 text-[var(--foreground)]/80" {...p} />,
    Callout,
    AgentCard,
    AgentGrid,
    HonestGap,
    ...components,
  };
}
