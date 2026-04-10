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
  image: "https://matthewrmckenzie.com/headshot.jpg",
  jobTitle: "Vice President, Investor Relations",
  worksFor: [
    {
      "@type": "Organization",
      name: "Civitas Capital Group",
      url: "https://civitascapital.com",
    },
    {
      "@type": "Organization",
      name: "Remote Coffee",
      url: "https://www.remotecoffee.com",
    },
  ],
  alumniOf: [
    {
      "@type": "CollegeOrUniversity",
      name: "Southern Methodist University",
    },
    {
      "@type": "CollegeOrUniversity",
      name: "Villanova University",
    },
  ],
  knowsAbout: [
    "Capital Formation",
    "Investor Relations",
    "Growth Strategy",
    "Real Estate Investment",
    "Alternative Investments",
    "AI Operations",
    "MCP Servers",
    "Restaurant Technology",
  ],
  sameAs: [
    "https://www.linkedin.com/in/mrmckenzie/",
    "https://github.com/atthewm",
    "https://www.instagram.com/mrem/",
  ],
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Matthew McKenzie",
  url: "https://matthewrmckenzie.com",
  description:
    "Personal site of Matthew McKenzie. Capital formation, growth strategy, and real asset backed consumer platforms.",
  publisher: {
    "@type": "Person",
    name: "Matthew McKenzie",
    url: "https://matthewrmckenzie.com",
  },
};

export const profilePageSchema = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  mainEntity: {
    "@type": "Person",
    name: "Matthew McKenzie",
    url: "https://matthewrmckenzie.com",
    jobTitle: "Vice President, Investor Relations",
    description: "Capital formation, growth strategy, and AI operations tooling. Structures investor partnerships for real asset backed businesses.",
  },
  dateCreated: "2026-01-01",
  dateModified: "2026-04-01",
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

export function blogPostingSchema(opts: {
  title: string;
  description: string;
  slug: string;
  datePublished: string;
  dateModified?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: opts.title,
    description: opts.description,
    url: `https://matthewrmckenzie.com/writing/${opts.slug}`,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified || opts.datePublished,
    author: {
      "@type": "Person",
      name: "Matthew McKenzie",
      url: "https://matthewrmckenzie.com",
    },
    publisher: {
      "@type": "Person",
      name: "Matthew McKenzie",
      url: "https://matthewrmckenzie.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://matthewrmckenzie.com/writing/${opts.slug}`,
    },
    image: "https://matthewrmckenzie.com/headshot.jpg",
  };
}
