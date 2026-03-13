// ============================================================================
// JSON-LD STRUCTURED DATA
// ============================================================================
// Server component that renders JSON-LD structured data in a <script> tag.
// ============================================================================

interface JsonLdProps {
  data: Record<string, unknown>;
}

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ---------------------------------------------------------------------------
// Pre-built structured data objects
// ---------------------------------------------------------------------------

export const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Matthew McKenzie",
  url: "https://matthewrmckenzie.com",
  jobTitle: "Vice President, Investor Relations",
  worksFor: {
    "@type": "Organization",
    name: "Civitas Capital Group",
  },
  sameAs: [
    "https://www.linkedin.com/in/mrmckenzie/",
    "https://github.com/atthewm",
  ],
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Matthew McKenzie",
  url: "https://matthewrmckenzie.com",
  description:
    "Personal site of Matthew McKenzie — capital formation, growth strategy, and real asset backed consumer platforms.",
};

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
