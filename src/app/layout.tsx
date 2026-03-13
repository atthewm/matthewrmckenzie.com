import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import JsonLd, { personSchema, websiteSchema } from "@/components/ui/JsonLd";
import "./globals.css";

// ============================================================================
// ROOT LAYOUT
// ============================================================================

export const metadata: Metadata = {
  metadataBase: new URL("https://matthewrmckenzie.com"),
  title: {
    default: "Matthew McKenzie",
    template: "%s - Matthew McKenzie",
  },
  description:
    "Personal site of Matthew McKenzie — capital formation, growth strategy, and real asset backed consumer platforms. Explore projects, writing, recipes, and more.",
  keywords: ["Matthew McKenzie", "personal site", "portfolio", "projects", "writing"],
  authors: [{ name: "Matthew McKenzie" }],
  creator: "Matthew McKenzie",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://matthewrmckenzie.com",
    siteName: "Matthew McKenzie",
    title: "Matthew McKenzie",
    description:
      "Personal site of Matthew McKenzie — capital formation, growth strategy, and real asset backed consumer platforms.",
    images: [
      {
        url: "https://matthewrmckenzie.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Matthew McKenzie — Capital Formation & Growth Strategy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Matthew McKenzie",
    description:
      "Personal site of Matthew McKenzie — capital formation, growth strategy, and real asset backed consumer platforms.",
    images: ["https://matthewrmckenzie.com/og-image.png"],
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
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased">
        <JsonLd data={personSchema} />
        <JsonLd data={websiteSchema} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
