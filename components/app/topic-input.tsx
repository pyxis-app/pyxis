"use client";

import { useEffect, useState } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
}

const PLACEHOLDER_CYCLE = [
  "hyperliquid",
  "$BERA rotation",
  "restaking risk",
  "memecoin szn?",
  "ethereum",
];

export function TopicInput({ value, onChange, onSubmit, disabled, placeholder }: Props) {
  const [phIdx, setPhIdx] = useState(0);

  useEffect(() => {
    if (placeholder) return;
    const t = setInterval(
      () => setPhIdx((i) => (i + 1) % PLACEHOLDER_CYCLE.length),
      3000,
    );
    return () => clearInterval(t);
  }, [placeholder]);

  const livePlaceholder = placeholder ?? PLACEHOLDER_CYCLE[phIdx];

  return (
    <div>
      <div className="term-block active flex items-center gap-3 px-4 sm:px-5 py-3">
        <span className="term-p-prefix text-[18px] leading-none shrink-0">P›</span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !disabled) onSubmit();
          }}
          placeholder={`research ${livePlaceholder}`}
          className="flex-1 min-w-0 bg-transparent font-mono text-[14px] sm:text-[15px] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none disabled:opacity-50"
          disabled={disabled}
          maxLength={200}
        />
        <button
          onClick={onSubmit}
          disabled={disabled || value.trim().length < 3}
          className="term-cta shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          start
          <span className="text-[16px] leading-none translate-y-[-1px]">›</span>
        </button>
      </div>
      <p className="mt-3 font-mono text-[11px] text-[var(--muted)]">
        tip: try a token, chain, protocol, or narrative · 5 runs/day on free beta
      </p>
    </div>
  );
}
