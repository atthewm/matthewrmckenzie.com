import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { THEME_INIT_SCRIPT } from "@/lib/theme-script";
import JsonLd, { personSchema, websiteSchema, profilePageSchema } from "@/components/ui/JsonLd";
import "@/styles/tokens.css";
import "./globals.css";
import "@/styles/aqua.css";
import "@/styles/springboard.css";
import "@/styles/site.css";
import "@/styles/turntable.css";
import "@/styles/duo.css";
import "@/styles/board.css";
import "@/styles/board-cards.css";
import "@/styles/board-chrome.css";

// ============================================================================
// ROOT LAYOUT
// ============================================================================

export const metadata: Metadata = {
  metadataBase: new URL("https://matthewrmckenzie.com"),
  title: {
    default: "Matthew McKenzie | Capital Formation, Menlo Equities",
    template: "%s | Matthew McKenzie",
  },
  description:
    "Matthew McKenzie is Senior Vice President, Capital Formation at Menlo Equities, leading private wealth relationships with high net worth investors, family offices, and RIAs.",
  keywords: [
    "Matthew McKenzie",
    "capital formation",
    "private wealth",
    "investor relations",
    "real estate",
    "alternative investments",
    "Menlo Equities",
    "family office",
    "registered investment advisors",
    "UHNW investors",
    "Austin",
    "health and fitness",
    "sourdough",
  ],
  authors: [{ name: "Matthew McKenzie" }],
  creator: "Matthew McKenzie",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://matthewrmckenzie.com",
    siteName: "Matthew McKenzie",
    title: "Matthew McKenzie | Capital Formation, Menlo Equities",
    description:
      "Senior Vice President, Capital Formation at Menlo Equities. Private wealth, family offices, and RIAs.",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Matthew McKenzie | Capital Formation, Menlo Equities",
    description:
      "Senior Vice President, Capital Formation at Menlo Equities. Private wealth, family offices, and RIAs.",
    images: ["/opengraph-image"],
  },
  alternates: {
    canonical: "https://matthewrmckenzie.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2a62bd" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1626" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Applies the saved Light, Dark or System choice before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="alternate" type="application/rss+xml" title="Matthew McKenzie" href="/feed.xml" />
        <link rel="alternate" type="text/plain" title="LLM Context" href="/llms.txt" />
      </head>
      <body className="antialiased">
        <JsonLd data={personSchema} />
        <JsonLd data={websiteSchema} />
        <JsonLd data={profilePageSchema} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
