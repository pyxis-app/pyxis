import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { LandingNav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/footer";
import { BackToTop } from "@/components/shared/back-to-top";
import { verifyJwt } from "@/lib/siwe";
import { env } from "@/lib/env";
import { withRetry } from "@/lib/retry";
import {
  getAdminStats,
  listRecentAll,
  topWallets,
} from "@/lib/repos/research-sessions";

// Reads cookies + DB → always dynamic, never cached/prerendered.
export const dynamic = "force-dynamic";

function shortWallet(w: string): string {
  return w.length > 12 ? `${w.slice(0, 6)}…${w.slice(-4)}` : w;
}

function fmtTime(ms: number): string {
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())} UTC`;
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="term-block">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)] mb-2">
        {label}
      </div>
      <div className="font-mono text-[28px] leading-none text-[var(--accent)] tabular-nums">
        {value.toLocaleString()}
      </div>
    </div>
  );
}

export default async function AdminPage() {
  // Gate: only the configured admin wallet, verified via the SIWE session.
  // notFound() (not 403) so the route's existence isn't revealed. Fail-closed:
  // unset ADMIN_WALLET → admin is "" → nobody matches.
  const admin = env.ADMIN_WALLET();
  const jwt = (await cookies()).get("pyxis_session")?.value ?? null;
  const wallet = jwt ? verifyJwt(jwt) : null;
  if (!admin || wallet !== admin) notFound();

  const [stats, recent, top] = await withRetry(
    () => Promise.all([getAdminStats(), listRecentAll(20), topWallets(10)]),
    2,
    300,
  );

  return (
    <main className="relative term-grid-bg min-h-screen flex flex-col">
      <LandingNav />

      <section className="flex-1 w-full max-w-[1000px] mx-auto px-6 lg:px-8 pt-10 lg:pt-14 pb-16">
        <div className="mb-6 flex items-center gap-3">
          <span className="term-section-tag">// admin</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
            usage · read-only · {shortWallet(admin)}
          </span>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
          <StatCard label="total runs" value={stats.total} />
          <StatCard label="unique wallets" value={stats.wallets} />
          <StatCard label="last 24h" value={stats.last24h} />
          <StatCard label="last 7d" value={stats.last7d} />
          <StatCard label="partial / failed" value={stats.partial} />
        </div>

        {/* Recent runs */}
        <div className="term-block mb-8">
          <div className="term-block-head">
            <span>
              <span className="dim">╭─</span> recent runs{" "}
              <span className="dim">──────────</span>
            </span>
            <span className="live-pill">[ last {recent.length} ]</span>
          </div>
          {recent.length === 0 ? (
            <p className="font-mono text-[13px] text-[var(--muted)]">
              no runs yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-[12.5px] border-collapse">
                <thead>
                  <tr className="text-[var(--muted)] text-[10px] uppercase tracking-[0.16em]">
                    <th className="text-left font-normal py-1.5 pr-4">time</th>
                    <th className="text-left font-normal py-1.5 pr-4">wallet</th>
                    <th className="text-left font-normal py-1.5 pr-4">topic</th>
                    <th className="text-left font-normal py-1.5">status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r) => (
                    <tr
                      key={r.id}
                      className="border-t border-[var(--hair)] align-top"
                    >
                      <td className="py-2 pr-4 text-[var(--muted)] whitespace-nowrap tabular-nums">
                        {fmtTime(r.createdAt)}
                      </td>
                      <td className="py-2 pr-4 text-[var(--muted)] whitespace-nowrap">
                        {shortWallet(r.walletAddress)}
                      </td>
                      <td className="py-2 pr-4 text-[var(--foreground)]">
                        <Link
                          href={`/b/${r.id}`}
                          className="hover:text-[var(--accent)] transition-colors"
                        >
                          {r.topic}
                        </Link>
                      </td>
                      <td className="py-2 whitespace-nowrap">
                        {r.partial ? (
                          <span style={{ color: "var(--danger)" }}>partial</span>
                        ) : (
                          <span className="text-[var(--scout)]">ok</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top wallets */}
        <div className="term-block">
          <div className="term-block-head">
            <span>
              <span className="dim">╭─</span> top wallets{" "}
              <span className="dim">──────────</span>
            </span>
            <span className="live-pill">[ by runs ]</span>
          </div>
          {top.length === 0 ? (
            <p className="font-mono text-[13px] text-[var(--muted)]">
              no wallets yet.
            </p>
          ) : (
            <table className="w-full max-w-[420px] font-mono text-[12.5px] border-collapse">
              <tbody>
                {top.map((w) => (
                  <tr
                    key={w.walletAddress}
                    className="border-t border-[var(--hair)]"
                  >
                    <td className="py-2 pr-4 text-[var(--muted)]">
                      {shortWallet(w.walletAddress)}
                    </td>
                    <td className="py-2 text-[var(--accent)] tabular-nums">
                      {w.count.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <Footer />
      <BackToTop />
    </main>
  );
}
