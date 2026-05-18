type Fields = Record<string, unknown>;
type Level = "debug" | "info" | "warn" | "error";

const SENSITIVE_HEADERS = new Set([
  "x-payment",
  "authorization",
  "cookie",
  "set-cookie",
]);

export function redact(value: string, keep = 4): string {
  if (value.length <= keep * 2 + 3) return value;
  return value.slice(0, keep + 2) + "..." + value.slice(-keep);
}

function emit(level: Level, event: string, fields: Fields = {}) {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    event,
    ...fields,
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  debug: (event: string, f?: Fields) => emit("debug", event, f),
  info: (event: string, f?: Fields) => emit("info", event, f),
  warn: (event: string, f?: Fields) => emit("warn", event, f),
  error: (event: string, f?: Fields) => emit("error", event, f),

  formatHeaders(h: Record<string, string>): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(h)) {
      out[k] = SENSITIVE_HEADERS.has(k.toLowerCase()) ? redact(v, 4) : v;
    }
    return out;
  },
};
