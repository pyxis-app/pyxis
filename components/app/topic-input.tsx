"use client";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function TopicInput({ value, onChange, onSubmit, disabled }: Props) {
  return (
    <div className="flex gap-3 max-w-3xl">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !disabled) onSubmit();
        }}
        placeholder="What do you want a briefing on?"
        className="flex-1 px-4 py-3 rounded-md bg-[var(--card)] border border-[var(--card-border)] focus:border-[var(--accent)] focus:outline-none text-sm"
        disabled={disabled}
        maxLength={200}
      />
      <button
        onClick={onSubmit}
        disabled={disabled || value.trim().length < 3}
        className="px-5 py-3 rounded-md text-sm font-medium text-white bg-gradient-to-r from-[#3b82f6] to-[#1e40af] disabled:opacity-50"
      >
        Start research →
      </button>
    </div>
  );
}
