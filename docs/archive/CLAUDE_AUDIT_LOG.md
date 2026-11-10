# Audit Log: matthewrmckenzie.com

**Date:** 2026.03.26
**Auditor:** Claude Opus 4.6
**Stack:** Next.js 15.5.12, React 19, Tailwind CSS 3.4, Vercel
**Build status:** Clean (all 20 pages generated successfully)

## Route Structure

### Public Pages (static)
| Route | Type | Description |
|-------|------|-------------|
| `/` | Static | Homepage, desktop OS shell with sr-only H1 + noscript fallback |
| `/about` | Static | About page with breadcrumb schema |
| `/work` | Static | Professional work with breadcrumb schema |
| `/writing` | Static | Essays and notes with breadcrumb schema |
| `/projects` | Static | Selected projects with breadcrumb schema |
| `/contact` | Static | Contact page with breadcrumb schema |
| `/privacy` | Static | Privacy policy with breadcrumb schema |

### Gated/System Pages
| Route | Type | Description |
|-------|------|-------------|
| `/gate` | Static | Admin login (noindex, nofollow) |
| `/_not-found` | Static | Custom 404 page |

### API Routes (dynamic)
| Route | Purpose |
|-------|---------|
| `/api/auth` | Admin authentication |
| `/api/chat` | AI chat backend |
| `/api/contact` | Contact form handler |
| `/api/guestbook` | Guestbook CRUD |
| `/api/whoop/auth/*` | WHOOP OAuth flow (start, callback, disconnect) |
| `/api/whoop/data` | WHOOP data proxy |
| `/api/whoop/status` | WHOOP connection status |

### Generated Routes
| Route | Purpose |
|-------|---------|
| `/robots.txt` | Search engine directives (includes AI crawler rules) |
| `/sitemap.xml` | XML sitemap with dynamic dates |
| `/opengraph-image` | Dynamic OG image (edge runtime) |

## What Was Broken

### Formatting (Critical, per global rules)
All metadata, content files, and user facing text contained em dashes, en dashes, and hyphens used as separators. These violated the global formatting rule: no dashes of any kind.

**Files affected:** `layout.tsx`, `page.tsx`, `opengraph-image.tsx`, `about/page.tsx`, `work/page.tsx`, `contact/page.tsx`, `writing/page.tsx`, `projects/page.tsx`, `privacy/page.tsx`, `JsonLd.tsx`, `StartHereApp.tsx`, `TerminalApp.tsx`, `about.md`, `work.md`, `now.md`, `resume.md`, `secrets-readme.md`, `essays.md`, `writing.md`

### SEO / Crawlability
1. **Homepage invisible to crawlers.** The entire homepage renders client side via DesktopShell. Crawlers that do not execute JavaScript saw only a single sr-only H1. No fallback content existed.
2. **Sitemap dates were hardcoded** to `2026-03-13` and would never update.
3. **Keywords were generic** ("personal site", "portfolio") instead of domain specific.
4. **Structured data was minimal.** Only Person and WebSite schemas. No ProfilePage, no publisher, no alumni, no knowsAbout.
5. **No explicit rules for AI crawlers** (GPTBot, ClaudeBot, PerplexityBot) in robots.txt.

### Performance / Head Tags
1. **No apple-touch-icon.** iOS bookmarks and share sheets showed a blank icon.
2. **No font preload.** Inter font loaded only via CSS @font-face, causing a layout shift on first paint.
3. **No preconnect hint** for the Google Fonts CDN.
4. **No security headers.** Missing X-Content-Type-Options, X-Frame-Options, Referrer-Policy, and Permissions-Policy.
5. **X-Powered-By header exposed** (Next.js default).
6. **No cache headers** for static assets like favicon and icons.

### Accessibility
1. **No skip-to-content link** on static pages.
2. **No aria-label on nav elements.**
3. **No main content landmark ID** for skip link target.

## What Was Changed

### 1. Dash Removal (All user facing content)
Replaced all em dashes with periods or pipe separators. Replaced en dashes in resume date ranges with "to". Removed hyphens from compound adjectives in content (e.g., "real-asset-backed" to "real asset backed", "long-term" to "long term", "early-stage" to "early stage", "Data-driven" to "Data driven", "daily-use" to "daily use", "Long-form" to "Longer form").

Title template changed from `%s - Matthew McKenzie` to `%s | Matthew McKenzie`.

### 2. Security Headers (`next.config.ts`)
Added security headers via `async headers()`:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-DNS-Prefetch-Control: on`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(self), microphone=(), geolocation=()`

Set `poweredByHeader: false` to suppress `X-Powered-By`.

Added immutable cache headers for `/favicon.svg` and `/icons/*`.

Enabled `image/avif` and `image/webp` formats in the images config.

### 3. Crawler Visibility (`page.tsx`)
Added `<noscript>` fallback block with:
  - A paragraph summarizing who Matthew McKenzie is
  - Navigation links to all static routes (/about, /work, /writing, /projects, /contact, /privacy)

This ensures search engines and users without JavaScript see real content.

### 4. Structured Data (`JsonLd.tsx`, `layout.tsx`)
Enhanced Person schema:
  - Added `image`, `alumniOf`, `knowsAbout`
  - Added `url` to worksFor Organization

Added WebSite schema `publisher` field.

Added new `ProfilePage` schema (supported by Google for personal sites).

### 5. Sitemap (`sitemap.ts`)
Changed from hardcoded date `"2026-03-13"` to dynamic `new Date().toISOString()` date. Changed homepage frequency from "monthly" to "weekly".

### 6. Robots (`robots.ts`)
Added explicit allow rules for AI crawlers: GPTBot, ClaudeBot, PerplexityBot. These bots can now index all public content.

### 7. Keywords (`layout.tsx`)
Replaced generic keywords ("personal site", "portfolio") with domain specific: "capital formation", "growth strategy", "investor relations", "real estate", "Civitas Capital Group", "Remote Coffee".

### 8. Head Tags (`layout.tsx`)
Added:
  - `<link rel="apple-touch-icon">` pointing to generated 180x180 PNG
  - `<link rel="preconnect">` for `fonts.gstatic.com`
  - `<link rel="preload">` for the Inter font woff2 file

### 9. Apple Touch Icon (`public/icons/apple-touch-icon.png`)
Generated a 180x180 PNG with the same blue rounded rect + white "M" as the SVG favicon.

### 10. Accessibility (`StaticPageLayout.tsx`)
Added:
  - Skip-to-content link (sr-only, visible on focus)
  - `aria-label="Main navigation"` on the header nav
  - `aria-label="Footer navigation"` on the footer nav
  - `id="main-content"` on the `<main>` element

### 11. OG Image (`opengraph-image.tsx`)
Added "Matthew McKenzie" as a separate line between the logo and URL for better social card recognition.

## What Still Needs Live Review

1. **Verify OG image renders correctly.** Test by sharing the URL on LinkedIn, Twitter/X, and iMessage. Use the Facebook Sharing Debugger and Twitter Card Validator.
2. **Test apple-touch-icon.** Add the site to iOS home screen and verify the icon appears correctly.
3. **Lighthouse audit.** Run a full Lighthouse audit on the deployed site to check Core Web Vitals, especially LCP (the boot sequence delays first meaningful paint by design).
4. **Mobile responsive testing.** The MobileView component renders a separate layout. Verify it works across iPhone SE, iPhone 15, and iPad viewports.
5. **Font preload impact.** Verify that the Inter font preload reduces layout shift on first load. Monitor CLS in Chrome DevTools.
6. **Google Search Console.** After deployment, submit the updated sitemap and verify all pages are indexed. Check for any new crawl errors.
7. **Schema validation.** Test the JSON-LD output at schema.org/validate or Google's Rich Results Test.
8. **Content thickness.** The /writing and /projects pages are still thin ("check back soon" placeholder). Consider adding real content as it becomes available.
9. **ESLint warnings.** Three pre-existing warnings remain (useCallback deps in Desktop.tsx and Window.tsx, useEffect deps in YouTubeWinampPlayer.tsx). These are non-critical and should not affect production behavior.
10. **Recipe content hyphens.** Recipe markdown files still contain compound word hyphens in brand names and measurement terms (e.g., "Grass-Fed", "fat-free"). These were left intact since they are product names, but should be reviewed.
11. **Consider self-hosting Inter font.** Using `next/font/google` would eliminate the external CDN request and improve privacy/performance.
12. **Add `twitter.creator` handle.** If you have a Twitter/X handle, adding `twitter: { creator: "@handle" }` to the root metadata would improve Twitter card attribution.
