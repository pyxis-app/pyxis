import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NavShell } from "@/components/shared/nav-shell";
import { DotGridProvider } from "@/components/shared/dot-grid-context";
import { DotGridCanvas } from "@/components/shared/dot-grid-canvas";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pyxis — Web3 Intelligence Swarm",
  description:
    "Five-agent research pipeline. $0.25 USDC per session on Base Sepolia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-screen bg-[var(--background)]">
        <DotGridProvider>
          <DotGridCanvas />
          <NavShell>{children}</NavShell>
        </DotGridProvider>
      </body>
    </html>
  );
}
