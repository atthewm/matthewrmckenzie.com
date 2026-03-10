# Prioritized Punch List

| Priority | Issue | Route(s) | Source of issue | Effort |
|---|---|---|---|---|
| P0 | Build fails without Supabase env vars (`supabaseUrl is required`) | build-time global | `src/lib/supabase.ts:5`, `src/app/api/contact/route.ts:2`, `src/app/api/guestbook/route.ts:2` | S |
| P1 | Static pages have severe low contrast in current theme state (text on blue background) | `/about`, `/work`, `/projects`, `/writing`, `/contact`, `/privacy`, `/404` | `src/app/globals.css:10-15`, `src/components/ui/StaticPageLayout.tsx:27` | M |
| P1 | Mobile top nav overflows horizontally and clips links | static routes on mobile | `src/components/ui/StaticPageLayout.tsx:37` | S |
| P1 | `/projects` contains public placeholder content | `/projects` | `src/content/projects.md:5-25` | S |
| P1 | Missing canonical strategy and route-level social metadata (OG/Twitter images/titles) | all page routes | `src/app/layout.tsx:8-45` | M |
| P1 | Favicon path mismatch (`/favicon.ico` referenced but only `favicon.svg` exists) | all routes | `src/app/layout.tsx:66`, `public/favicon.svg` | S |
| P1 | `/privacy` is missing from sitemap and static nav discoverability | `/privacy` | `src/app/sitemap.ts:6-43`, `src/components/ui/StaticPageLayout.tsx:16-23` | S |
| P2 | Global `body { overflow: hidden; }` risks clipping long-form page content and keyboard scroll | static pages and policy content | `src/app/globals.css:51-56` | M |
| P2 | Homepage mobile UX opens README window by default and leaves dock overlay pressure with clipped content | `/` mobile | `src/components/desktop/Desktop.tsx:36-47`, `src/components/desktop/Dock.tsx:217-235` | M |
| P2 | Duplicate content model: About and Now themes spread across `/about`, desktop `now.md`, README intro, and resume snippets | `/`, `/about`, desktop apps | `src/content/about.md`, `src/content/now.md`, `src/content/readme.md`, `src/data/fs.ts:20-29` | M |
| P2 | Missing explicit labels on form fields (placeholder-only labeling) | desktop contact and guestbook apps | `src/components/apps/ContactApp.tsx:125-161`, `src/components/apps/GuestbookApp.tsx:205-228` | M |
| P2 | Lint warning: missing dependency in YouTube player effect | desktop player app | `src/components/players/YouTubeWinampPlayer.tsx:72` | S |
| P3 | Gate screen shows bottom blue strip on screenshots (layout bleed) | `/gate` | `src/app/gate/page.tsx:99-137` and global body styling | S |
| P3 | Multi-lockfile root warning adds build noise | build process | Next.js root detection warning, workspace lockfiles | S |

