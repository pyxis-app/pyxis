"use client";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function TopicInput({ value, onChange, onSubmit, disabled, placeholder }: Props) {
  return (
    <div className="hairline-bottom focus-within:border-b-[var(--gold)]/60 transition-colors">
      <div className="flex items-baseline gap-4 py-3">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !disabled) onSubmit();
          }}
          placeholder={placeholder ?? "What do you want a briefing on?"}
          className="flex-1 bg-transparent font-display text-[24px] sm:text-[30px] leading-tight text-[var(--foreground)] placeholder:text-[var(--muted)] placeholder:italic focus:outline-none disabled:opacity-50"
          style={{ fontVariationSettings: '"opsz" 144' }}
          disabled={disabled}
          maxLength={200}
        />
        <button
          onClick={onSubmit}
          disabled={disabled || value.trim().length < 3}
          className="group inline-flex items-baseline gap-2.5 px-5 py-3 bg-[var(--foreground)] text-[var(--background)] font-mono uppercase text-[10px] tracking-[0.22em] hover:bg-[var(--gold)] transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[var(--foreground)]"
        >
          Start
          <span className="font-display text-[14px] leading-none translate-y-[1px] group-hover:translate-x-0.5 transition-transform">
            →
          </span>
        </button>
      </div>
    </div>
  );
}
