import { ClientAuthFlow } from "./ClientAuthFlow";

export const dynamic = "force-dynamic";

function isValidState(s: string | undefined): boolean {
  return !!s && /^[a-f0-9]{32}$/.test(s);
}
function isValidPort(s: string | undefined): boolean {
  if (!s) return false;
  const n = Number(s);
  return Number.isInteger(n) && n >= 1024 && n <= 65535;
}
function isValidChallenge(s: string | undefined): boolean {
  return !!s && /^[A-Za-z0-9_-]{43}$/.test(s);
}

export default async function CliAuthPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string; port?: string; challenge?: string }>;
}) {
  const params = await searchParams;
  const valid =
    isValidState(params.state) &&
    isValidPort(params.port) &&
    isValidChallenge(params.challenge);

  if (!valid) {
    return (
      <main className="mx-auto max-w-md p-8">
        <h1 className="font-display text-2xl text-[var(--foreground)]">
          Invalid CLI auth link
        </h1>
        <p className="mt-2 font-mono text-[13px] text-[var(--muted)] leading-[1.6]">
          The link is missing or malformed parameters. Start over by running{" "}
          <code className="term-chip" style={{ cursor: "default" }}>pyxis login</code>{" "}
          in your terminal.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="font-display text-2xl text-[var(--foreground)]">
        Authorize Pyxis CLI
      </h1>
      <p className="mt-2 font-mono text-[13px] text-[var(--muted)] leading-[1.6]">
        Grant terminal access to this device. The token expires in 24 hours.
      </p>
      <ClientAuthFlow
        state={params.state!}
        port={Number(params.port!)}
        challenge={params.challenge!}
      />
    </main>
  );
}
