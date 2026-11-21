import type { NextConfig } from "next";

// Old URLs that still get requests. Each one answers with a single 308 hop.
// The site has no projects section; that work now lives on /work.
const LEGACY_REDIRECTS: ReadonlyArray<{ source: string; destination: string }> = [
  { source: "/health", destination: "/" },
  { source: "/kitchen", destination: "/" },
  { source: "/food-room", destination: "/" },
  { source: "/desktop", destination: "/" },
  { source: "/hobbies", destination: "/about" },
  { source: "/projects", destination: "/work" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    const redirects = [...LEGACY_REDIRECTS];
    if (process.env.VERCEL_BACKGROUND_BUILD === "1") {
      redirects.push({
        source: "/backgrounds/video/:path*",
        destination: "https://media.matthewrmckenzie.com/backgrounds/video/:path*",
      });
    }
    return redirects.map((redirect) => ({ ...redirect, permanent: true }));
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/favicon.svg",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/icons/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/opengraph-image",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, s-maxage=86400" },
        ],
      },
      {
        source: "/writing/:slug*/opengraph-image",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, s-maxage=86400" },
        ],
      },
    ];
  },
};

export default nextConfig;
