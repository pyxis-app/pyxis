import type { Metadata } from "next";
import { DocsShell } from "@/components/docs/docs-shell";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: { default: "Docs — Pyxis", template: "%s — Pyxis Docs" },
  description: "How to use Pyxis and how it produces source-stamped Web3 research briefings.",
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DocsShell>{children}</DocsShell>
      <Footer />
    </>
  );
}
