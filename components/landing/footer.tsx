import Link from "next/link";
import Image from "next/image";
import { HealthStatus } from "@/components/shared/health-status";

export function Footer() {
  return (
    <footer className="relative border-t border-[var(--hair)] mt-12">
      <div className="max-w-[1080px] mx-auto px-6 lg:px-8 py-16">
        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10 lg:gap-12">
          {/* Brand col */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <Image
                src="/logo.png"
                alt=""
                width={30}
                height={30}
                className="opacity-95"
              />
              <span className="font-mono text-[22px] leading-none text-[var(--foreground)]">
                pyxis
              </span>
            </div>
            <p className="font-mono text-[13px] leading-[1.7] text-[var(--muted)] max-w-xs">
              an instrument for navigating web3 — five agents, one briefing.
            </p>
            <div className="mt-4">
              <span className="term-chip" style={{ cursor: "default" }}>
                [ free beta · v3.3.0 ]
              </span>
            </div>
          </div>

          <FooterCol
            label="// product"
            links={[
              { href: "/research", text: "research" },
              { href: "/history", text: "history" },
              { href: "/settings", text: "settings" },
            ]}
          />
          <FooterCol
            label="// resources"
            links={[
              { href: "https://docs.usepyxis.com", text: "docs" },
              { href: "#method", text: "method" },
              { href: "#briefing", text: "briefing" },
              { href: "#pricing", text: "pricing" },
              { href: "/changelog", text: "changelog" },
            ]}
          />
          <FooterCol
            label="// connect"
            links={[
              { href: "https://github.com/pyxis-app/pyxis", text: "github", external: true },
              { href: "https://x.com/pyxisbase", text: "x · @pyxisbase", external: true },
            ]}
          />
        </div>

        {/* Bottom row */}
        <div className="border-t border-[var(--hair)] pt-6 mt-12 flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">
          <div className="flex items-center gap-4">
            <HealthStatus />
            <span>issued by pyxis · vol I · MMXXVI · agpl-3.0</span>
          </div>
          <div className="opacity-70">
            made for crypto-native researchers · made with terminal energy
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  label,
  links,
}: {
  label: string;
  links: Array<{ href: string; text: string; external?: boolean }>;
}) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--muted)] mb-4">
        {label}
      </div>
      <ul className="space-y-1">
        {links.map((l) =>
          l.external ? (
            <li key={l.href}>
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[13px] text-[var(--foreground)] hover:text-[var(--accent)] block py-1 transition-colors"
              >
                {l.text}
              </a>
            </li>
          ) : (
            <li key={l.href}>
              <Link
                href={l.href}
                className="font-mono text-[13px] text-[var(--foreground)] hover:text-[var(--accent)] block py-1 transition-colors"
              >
                {l.text}
              </Link>
            </li>
          )
        )}
      </ul>
    </div>
  );
}
