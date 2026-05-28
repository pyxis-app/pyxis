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
    // Tab-2 case: some wallet extensions redirect back to /cli-auth with a
    // truncated query string (state only, missing port/challenge) as part of
    // their connect flow. Help the user notice their original tab is still
    // waiting rather than panicking that login broke.
    const isPartial = !!params.state && (!params.port || !params.challenge);
    return (
      <main className="mx-auto max-w-md p-8">
        <h1 className="font-display text-2xl text-[var(--foreground)]">
          {isPartial ? "Duplicate auth tab" : "Invalid CLI auth link"}
        </h1>
        <p className="mt-2 font-mono text-[13px] text-[var(--muted)] leading-[1.6]">
          {isPartial ? (
            <>
              This tab is missing the <code className="term-chip" style={{ cursor: "default" }}>port</code> and{" "}
              <code className="term-chip" style={{ cursor: "default" }}>challenge</code> params — likely a
              redirect from your wallet's connect flow. Switch back to the original{" "}
              <code className="term-chip" style={{ cursor: "default" }}>/cli-auth</code> tab (the one with the
              full URL); it&apos;s still waiting for you. You can close this tab safely.
            </>
          ) : (
            <>
              The link is missing or malformed parameters. Start over by running{" "}
              <code className="term-chip" style={{ cursor: "default" }}>pyxis login</code>{" "}
              in your terminal.
            </>
          )}
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
