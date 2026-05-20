"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DOC_NAV, isActiveDoc } from "./nav-data";

export function DocsSidebar({ open, onNavigate }: { open: boolean; onNavigate: () => void }) {
  const pathname = usePathname();
  return (
    <aside
      className={`fixed bottom-0 left-0 top-[54px] z-50 w-[280px] max-w-[84vw] overflow-auto border-r border-[var(--hair)] bg-[var(--background)] px-[18px] py-7 shadow-2xl transition-transform md:sticky md:z-0 md:h-[calc(100vh-54px)] md:w-auto md:max-w-none md:translate-x-0 md:shadow-none ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {DOC_NAV.map((group) => (
        <div key={group.label} className="mb-6">
          <div className="mb-2.5 pl-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
            {group.label}
          </div>
          {group.items.map((item) => {
            const active = !item.external && isActiveDoc(item.href, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13.5px] ${
                  active
                    ? "bg-[rgba(91,143,255,0.10)] font-medium text-[var(--accent)]"
                    : "text-[var(--muted)] hover:bg-[rgba(229,233,240,0.03)] hover:text-[var(--foreground)]"
                }`}
              >
                {item.title}
                {item.external && <span className="ml-auto text-[11px]">↗</span>}
              </Link>
            );
          })}
        </div>
      ))}
    </aside>
  );
}
