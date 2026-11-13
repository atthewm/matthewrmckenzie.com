import type { Metadata, Viewport } from "next";
import { Inter, Marcellus, Space_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import JsonLd, { personSchema, websiteSchema, profilePageSchema } from "@/components/ui/JsonLd";
import "./globals.css";
import "@/styles/board.css";
import "@/styles/board-cards.css";
import "@/styles/board-chrome.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

const marcellus = Marcellus({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: "400",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "700"],
});

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
    "MCP server",
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
    { media: "(prefers-color-scheme: light)", color: "#f4f2ee" },
    { media: "(prefers-color-scheme: dark)", color: "#151619" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${marcellus.variable} ${spaceMono.variable}`}>
      <head>
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
