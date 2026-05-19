import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SmoothScroll } from "@/components/shared/smooth-scroll";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.usepyxis.com"),
  title: "Pyxis — Web3 Intelligence Swarm",
  description:
    "Five-agent research pipeline. Free during beta. Wallet-gated workspace.",
  icons: {
    icon: [
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/icon-192.png",
    apple: "/icon-192.png",
  },
  openGraph: {
    type: "website",
    url: "https://www.usepyxis.com",
    siteName: "Pyxis",
    title: "Pyxis — Web3 Intelligence Swarm",
    description:
      "Five-agent research pipeline. Free during beta. Wallet-gated workspace.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pyxis — Web3 Intelligence Swarm",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pyxis — Web3 Intelligence Swarm",
    description:
      "Five-agent research pipeline. Free during beta. Wallet-gated workspace.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased dark`}
    >
      <body
        className="min-h-screen bg-[var(--background)]"
        suppressHydrationWarning
      >
        <SmoothScroll />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
