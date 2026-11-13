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
  jobTitle: "Senior Vice President, Capital Formation",
  worksFor: [
    {
      "@type": "Organization",
      name: "Menlo Equities",
      url: "https://www.menloequities.com",
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
    {
      // Past employer, 2016 to 2026.
      "@type": "Organization",
      name: "Civitas Capital Group",
      url: "https://civitascapital.com",
    },
  ],
  knowsAbout: [
    "Capital Formation",
    "Private Wealth",
    "Investor Relations",
    "Family Offices",
    "Registered Investment Advisors",
    "Real Estate Investment",
    "Alternative Investments",
    "Strength Training",
    "Sourdough Baking",
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
    "Personal site of Matthew McKenzie. Capital formation at Menlo Equities, plus health, fitness, cooking, and baking.",
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
    jobTitle: "Senior Vice President, Capital Formation",
    description:
      "Capital formation across the private wealth channel at Menlo Equities, working with high net worth investors, family offices, and RIAs.",
  },
  dateCreated: "2026-01-01",
  dateModified: "2026-11-12",
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
  articleBody?: string;
}) {
  const schema: Record<string, unknown> = {
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
      jobTitle: "Senior Vice President, Capital Formation",
      worksFor: {
        "@type": "Organization",
        name: "Menlo Equities",
        url: "https://www.menloequities.com",
      },
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
    image: `https://matthewrmckenzie.com/writing/${opts.slug}/opengraph-image`,
  };
  if (opts.articleBody) {
    schema.articleBody = opts.articleBody;
  }
  return schema;
}
