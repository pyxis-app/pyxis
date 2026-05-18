import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="relative">
      <div className="max-w-[1280px] mx-auto px-8 py-20 lg:py-28">
        {/* Top: brand mark + colophon */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-12 lg:gap-16 mb-20">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <Image src="/logo.png" alt="" width={32} height={32} className="opacity-90" />
              <span className="font-display text-[26px] leading-none">Pyxis</span>
            </div>
            <p className="font-display italic text-[18px] leading-snug text-[var(--muted)] max-w-xs" style={{ fontVariationSettings: '"opsz" 9' }}>
              An instrument for navigating Web3 — five agents, one briefing, settled on-chain.
            </p>
          </div>

          <FooterCol
            label="Product"
            links={[
              { href: "/research", text: "Research" },
              { href: "/history", text: "History" },
              { href: "/settings", text: "Settings" },
            ]}
          />
          <FooterCol
            label="Resources"
            links={[
              { href: "#method", text: "Method" },
              { href: "#briefing", text: "Specimen briefing" },
              { href: "#pricing", text: "Cover price" },
            ]}
          />
          <FooterCol
            label="Connect"
            links={[
              { href: "https://github.com/pyxis-boop/app", text: "GitHub", external: true },
              { href: "https://x.com/pyxisbase", text: "X · @pyxisbase", external: true },
            ]}
          />
        </div>

        {/* Bottom: colophon strip */}
        <div className="hairline-top pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] font-mono uppercase tracking-[0.22em] text-[var(--gold-soft)]">
          <div>
            Issued by Pyxis &nbsp;·&nbsp; Volume I &nbsp;·&nbsp; MMXXVI
          </div>
          <div className="opacity-70">
            Made for crypto-native researchers
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
      <div className="eyebrow mb-5">{label}</div>
      <ul className="space-y-2.5">
        {links.map((l) =>
          l.external ? (
            <li key={l.href}>
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[14px] text-[var(--foreground)] editorial-link"
              >
                {l.text}
              </a>
            </li>
          ) : (
            <li key={l.href}>
              <Link href={l.href} className="text-[14px] text-[var(--foreground)] editorial-link">
                {l.text}
              </Link>
            </li>
          )
        )}
      </ul>
    </div>
  );
}
