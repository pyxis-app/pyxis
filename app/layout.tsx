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

// JetBrains Mono loaded via raw <link> below, NOT next/font/google.
// Reason: next/font/google subsets the woff2 to ["latin"] only, which
// strips box-drawing chars (U+2500-U+257F) needed for the PYXIS wordmark.
// Google's regular CSS endpoint serves multiple unicode-range woff2 files
// including the box-drawing range, so chars like ╔╗╝╚═║ render correctly.

const SITE_TITLE = "Pyxis — Web3 Intelligence Swarm with Live API Citations";
const SITE_DESCRIPTION =
  "Five-agent research pipeline for any Web3 topic. Every number sampled from a live API, cited inline with a freshness timestamp. Free during beta.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.usepyxis.com"),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
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
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
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
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@700&display=swap"
        />
      </head>
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
