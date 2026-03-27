import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/gate", "/api/"],
      },
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/gate", "/api/"],
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: ["/gate", "/api/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/gate", "/api/"],
      },
    ],
    sitemap: "https://matthewrmckenzie.com/sitemap.xml",
  };
}
