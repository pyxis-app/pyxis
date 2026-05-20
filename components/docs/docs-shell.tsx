"use client";

import { useState, type ReactNode } from "react";
import { DocsNav } from "./docs-nav";
import { DocsSidebar } from "./sidebar";

export function DocsShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <DocsNav onMenu={() => setOpen((v) => !v)} />
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 md:grid-cols-[248px_minmax(0,1fr)]">
        <div
          onClick={() => setOpen(false)}
          className={`fixed inset-x-0 bottom-0 top-[54px] z-40 bg-black/55 transition-opacity md:hidden ${
            open ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-hidden
        />
        <DocsSidebar open={open} onNavigate={() => setOpen(false)} />
        <main className="min-w-0 px-5 py-8 md:px-12 md:py-12">{children}</main>
      </div>
    </>
  );
}
