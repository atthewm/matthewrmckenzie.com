import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import JsonLd, { personSchema, websiteSchema, profilePageSchema } from "@/components/ui/JsonLd";
import "./globals.css";

// ============================================================================
// ROOT LAYOUT
// ============================================================================

export const metadata: Metadata = {
  metadataBase: new URL("https://matthewrmckenzie.com"),
  title: {
    default: "Matthew McKenzie | Capital Formation & Growth Strategy",
    template: "%s | Matthew McKenzie",
  },
  description:
    "Matthew McKenzie structures capital partnerships and growth strategy for real asset backed businesses. Vice President of Investor Relations at Civitas Capital Group. Head of Capital Formation at Remote Coffee.",
  keywords: [
    "Matthew McKenzie",
    "capital formation",
    "growth strategy",
    "investor relations",
    "real estate",
    "alternative investments",
    "Civitas Capital Group",
    "Remote Coffee",
    "family office",
    "UHNW investors",
    "AI operations",
    "MCP server",
  ],
  authors: [{ name: "Matthew McKenzie" }],
  creator: "Matthew McKenzie",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://matthewrmckenzie.com",
    siteName: "Matthew McKenzie",
    title: "Matthew McKenzie | Capital Formation & Growth Strategy",
    description:
      "Matthew McKenzie structures capital partnerships and growth strategy for real asset backed businesses. Civitas Capital Group. Remote Coffee.",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Matthew McKenzie | Capital Formation & Growth Strategy",
    description:
      "Matthew McKenzie structures capital partnerships and growth strategy for real asset backed businesses. Civitas Capital Group. Remote Coffee.",
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
    { media: "(prefers-color-scheme: light)", color: "#f5f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#1d1d1f" },
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
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="alternate" type="application/rss+xml" title="Matthew McKenzie" href="/feed.xml" />
        <link rel="alternate" type="text/plain" title="LLM Context" href="/llms.txt" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="preload"
          href="https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
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
