import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Marcellus, Newsreader, Space_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import JsonLd, { personSchema, websiteSchema, profilePageSchema } from "@/components/ui/JsonLd";
import HeroIntroScript from "@/components/home/HeroIntroScript";
import "./globals.css";
import "@/styles/site.css";
import "@/styles/site-prose.css";
import "@/styles/board.css";
import "@/styles/board-cards.css";
import "@/styles/board-chrome.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

// Reading site display face: variable, with the optical size axis so large
// headlines and small captions each get the right cut.
const newsreader = Newsreader({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-newsreader",
  axes: ["opsz"],
  adjustFontFallback: true,
});

// Reading site numbers, dates and small labels.
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
  preload: false,
  adjustFontFallback: true,
});

// Marcellus and Space Mono are kept only for the Mac OS X desktop at /desktop
// (boards, phone view). They are not preloaded, so reading pages never fetch them.
const marcellus = Marcellus({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: "400",
  preload: false,
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "700"],
  preload: false,
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
    "Matthew McKenzie, Senior Vice President, Capital Formation at Menlo Equities. I work with high net worth investors, family offices, and RIAs. This site also covers my training, cooking, and baking.",
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
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${newsreader.variable} ${jetbrainsMono.variable} ${marcellus.variable} ${spaceMono.variable}`}>
      <head>
        <HeroIntroScript />
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
