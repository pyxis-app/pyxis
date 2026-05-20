import type { ReactNode } from "react";

const AGENTS = {
  commander: { label: "Commander", color: "var(--accent)" },
  scout: { label: "Scout", color: "var(--scout)" },
  analyst: { label: "Analyst", color: "var(--analyst)" },
  sentinel: { label: "Sentinel", color: "var(--sentinel)" },
  synthesizer: {
    label: "Synthesizer",
    color: "linear-gradient(90deg, var(--scout), var(--sentinel))",
  },
} as const;

export type AgentKey = keyof typeof AGENTS;

export function Callout({ type = "info", children }: { type?: "info" | "warn"; children: ReactNode }) {
  const warn = type === "warn";
  const border = warn ? "border-[rgba(245,158,11,0.32)]" : "border-[rgba(91,143,255,0.28)]";
  const bg = warn ? "bg-[rgba(245,158,11,0.05)]" : "bg-[rgba(91,143,255,0.06)]";
  const fg = warn ? "text-[var(--sentinel)]" : "text-[var(--accent)]";
  return (
    <div className={`my-6 flex gap-3 rounded-xl border px-[18px] py-4 ${border} ${bg}`}>
      <span className={`shrink-0 font-mono text-sm font-semibold ${fg}`} aria-hidden>
        {warn ? "!" : "i"}
      </span>
      <div className="text-[var(--foreground)]/85 [&>p]:m-0 [&>p:not(:last-child)]:mb-2">{children}</div>
    </div>
  );
}

export function AgentGrid({ children }: { children: ReactNode }) {
  return <div className="my-6 grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>;
}

export function AgentCard({
  agent,
  full = false,
  children,
}: {
  agent: AgentKey;
  full?: boolean;
  children: ReactNode;
}) {
  const a = AGENTS[agent];
  return (
    <div
      className={`rounded-xl border border-[var(--hair)] bg-[var(--card)] px-4 py-4 ${full ? "sm:col-span-2" : ""}`}
    >
      <div className="mb-1.5 flex items-center gap-2 font-mono text-[13px] font-medium">
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: a.color }} aria-hidden />
        {a.label}
      </div>
      <div className="text-[12.5px] leading-relaxed text-[var(--muted)]">{children}</div>
    </div>
  );
}

export function HonestGap({ title = "What Pyxis does not claim", children }: { title?: string; children: ReactNode }) {
  return (
    <div className="my-6 rounded-xl border border-[rgba(245,158,11,0.32)] bg-[rgba(245,158,11,0.05)] px-[18px] py-4">
      <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--sentinel)]">{title}</div>
      <div className="text-sm text-[var(--foreground)]/75 [&>p]:m-0 [&>p:not(:last-child)]:mb-2">{children}</div>
    </div>
  );
}
