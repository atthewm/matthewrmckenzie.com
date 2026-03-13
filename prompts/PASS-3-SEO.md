# SEO Pass — matthewrmckenzie.com

> **Purpose:** Technical SEO audit and fixes — meta tags, structured data, canonical tags, heading hierarchy, internal linking, robots directives, sitemap, and crawlability.
> **Execute with:** `claude --dangerously-skip-permissions`
> **Target site:** matthewrmckenzie.com (single domain, English only)
> **Estimated time:** 20–40 minutes

---

## Preamble

```
Read CLAUDE.md from the project root for full project context.

This is a retro Mac OS X 10.3 Panther desktop personal website built with Next.js 15 App Router, TypeScript, and Tailwind CSS. The site is single-domain (matthewrmckenzie.com), English-only (no i18n/locales).

The site has two "faces":
1. Static page routes (/about, /work, /contact, /writing, /privacy, /projects) — traditional SSR pages that search engines can crawl
2. Desktop experience (/) — a client-side rendered Mac OS desktop with apps, windows, and a dock. The desktop content is NOT directly crawlable by search engines since it's rendered client-side.

The SEO strategy focuses on the static routes being fully optimized, while the desktop homepage acts as an interactive portfolio experience.

This prompt performs a comprehensive technical SEO audit and fixes every issue. It covers: meta tags, Open Graph, structured data (JSON-LD), sitemap, robots.txt, canonical tags, heading hierarchy, internal linking, image alt text, and crawlability.
```

---

## Wave 0 — Audit Infrastructure

### Step 1: Understand the routing setup

```bash
# List all page routes
find src/app -name "page.tsx" -type f | sort

# Check root layout metadata
cat src/app/layout.tsx | head -80

# Check each page's metadata
for page in about work contact writing privacy projects; do
  echo "=== $page ==="
  head -40 src/app/$page/page.tsx
  echo ""
done
```

Document:
- All static routes
- Default metadata (from layout.tsx)
- Per-page metadata overrides

### Step 2: Audit sitemap.xml

```bash
cat src/app/sitemap.ts
```

Verify:
- Every public static page is in the sitemap
- `<lastmod>` dates are present
- No gated/private pages in the sitemap (no /gate)
- Sitemap URL count matches actual public route count
- URLs are absolute (https://matthewrmckenzie.com/...)

### Step 3: Audit robots.txt

```bash
cat src/app/robots.ts
```

Verify:
- Sitemap directive points to correct absolute URL
- Private routes blocked (gate, api)
- Public routes NOT blocked
- No overly broad Disallow rules

### Step 4: Audit meta tags on every page

For EACH page with metadata, verify:

| Check | Target |
|-------|--------|
| `<title>` | Present, 40–65 chars, unique |
| `<meta name="description">` | Present, 120–160 chars, unique |
| `<link rel="canonical">` | Present, absolute URL |
| `<meta property="og:title">` | Present |
| `<meta property="og:description">` | Present |
| `<meta property="og:image">` | Present (at least inherited from layout default) |
| `<h1>` | Exactly 1 per page |
| `robots` | index,follow for public; noindex for gated |

---

## Wave 1 — Fix Meta Tags + Structured Data

### Fix missing/incomplete meta tags

For each static page route:
1. Ensure unique title (40–65 chars, format: "Topic — Matthew McKenzie")
2. Ensure unique meta description (120–160 chars)
3. Ensure og:image exists (either explicit or inherited from layout default)
4. Ensure canonical is correct and absolute

### Add default og:image in root layout (if missing)

```typescript
openGraph: {
  images: [
    {
      url: 'https://matthewrmckenzie.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Matthew McKenzie — Builder, Thinker, Maker',
    },
  ],
},
```

Check if `/public/og-image.png` exists. If not, note that one needs to be created.

### Add structured data (JSON-LD)

```bash
grep -rn "application/ld+json\|jsonLd\|JsonLd\|structured" src/ --include="*.tsx" --include="*.ts" -l
```

Recommended structured data:
- **Homepage (/):** Person + WebSite
- **About (/about):** Person + BreadcrumbList
- **Work (/work):** ProfilePage + BreadcrumbList
- **Contact (/contact):** ContactPage + BreadcrumbList
- **Writing (/writing):** CollectionPage + BreadcrumbList
- **All pages:** BreadcrumbList

### Fix heading hierarchy

```bash
# Find all H1 usage in static pages
grep -rn "<h1\|<H1" src/app/ --include="*.tsx" | head -30

# Check for heading skips
grep -rn "<h[1-6]" src/app/ --include="*.tsx" -l
```

Rules:
- Exactly 1 H1 per static page
- No heading level skips (H1 → H3 without H2)
- H1 contains the primary keyword for the page

**Commit:** `fix(seo): complete meta tags, structured data, and heading hierarchy`

---

## Wave 2 — Internal Linking + Crawlability

### Check that static pages link to each other

The desktop experience is client-side rendered, so search engines primarily see the static routes. Ensure:
- Each static page has links to other static pages (nav, footer, or inline)
- The static homepage or layout includes navigation to all key pages
- No orphan static pages (every page reachable from at least one other page)

```bash
# Check for internal links in static pages
grep -rn 'href="/' src/app/ --include="*.tsx" | sort
```

### Check for link to /gate in public pages

/gate should NOT be linked from any public page (it's admin-only). Verify:

```bash
grep -rn '/gate' src/ --include="*.tsx" --include="*.ts" | grep -v middleware | grep -v "api/auth"
```

### Check image alt text on static pages

```bash
grep -rn '<img\|<Image' src/app/ --include="*.tsx" | grep -v 'alt='
```

Every `<img>` and `<Image>` on static pages must have meaningful alt text.

### Ensure /gate has noindex

```bash
# Check if gate page has noindex metadata
grep -rn "robots\|noindex" src/app/gate/ --include="*.tsx" --include="*.ts"
```

If not, add:
```typescript
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};
```

**Commit:** `fix(seo): fix internal links, alt text, and crawlability`

---

## Wave 3 — Sitemap + robots.txt Fixes

### Expand sitemap if needed

The sitemap should include all public static routes. Check:

```bash
# Count routes vs sitemap entries
echo "Routes:"
find src/app -name "page.tsx" -not -path "*/gate/*" -type f | wc -l

echo "Sitemap entries:"
cat src/app/sitemap.ts
```

Verify every public route is represented. Add any missing.

### Fix robots.txt

Ensure:
- `/gate` is disallowed
- `/api/` is disallowed
- All static assets are allowed
- Sitemap URL is correct

**Commit:** `fix(seo): expand sitemap, fix robots.txt`

---

## Gate Check

```bash
npx tsc --noEmit
npm run build
```

**Verification checklist:**
- [ ] Every static page has unique title (40–65 chars)
- [ ] Every static page has unique meta description (120–160 chars)
- [ ] Every static page has canonical tag (absolute URL)
- [ ] og:image exists (at least from layout default)
- [ ] Every static page has exactly 1 H1
- [ ] No heading level skips
- [ ] JSON-LD structured data present on key pages
- [ ] Sitemap includes ALL public static pages
- [ ] robots.txt has correct Sitemap directive and blocks /gate, /api
- [ ] /gate has noindex
- [ ] All images on static pages have alt text
- [ ] Static pages link to each other (no orphans)
- [ ] Build succeeds with zero errors
