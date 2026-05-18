import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer id="footer" className="border-t border-[var(--card-border)]">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Image src="/logo.png" alt="Pyxis" width={24} height={24} />
            <span className="font-semibold">Pyxis</span>
          </div>
          <p className="text-xs text-[var(--muted)]">
            Web3 Intelligence Swarm
          </p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-[var(--muted)] mb-2">
            Product
          </div>
          <ul className="space-y-1 text-sm">
            <li>
              <Link href="/research">Research</Link>
            </li>
            <li>
              <Link href="/history">History</Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-[var(--muted)] mb-2">
            Resources
          </div>
          <ul className="space-y-1 text-sm text-[var(--muted)]">
            <li>Docs (soon)</li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-[var(--muted)] mb-2">
            Connect
          </div>
          <ul className="space-y-1 text-sm">
            <li>
              <a
                href="https://github.com/pyxis-boop/app"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href="https://x.com/pyxisbase"
                target="_blank"
                rel="noopener noreferrer"
              >
                X (@pyxisbase)
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="text-center text-xs text-[var(--muted)] pb-6">
        © 2026 Pyxis · Made for crypto-native researchers
      </div>
    </footer>
  );
}
