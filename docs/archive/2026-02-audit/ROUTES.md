# Route Inventory

## Framework and Routing
- Framework: Next.js 15.5.12
- Router: App Router (`src/app`)
- Route types present: static pages, API routes, metadata routes (`robots`, `sitemap`), not-found boundary
- Dynamic page segments: none found in `src/app`

## Page Routes

| Route | Source file | Purpose | Title tag | Primary H1 | Duplication notes |
|---|---|---|---|---|---|
| `/` | `src/app/page.tsx` | Desktop OS style homepage that preloads markdown and renders desktop shell. | `Matthew McKenzie` | `Welcome` (from `readme.md` auto-open window on mobile) | Overlaps with `/about` and `/now` for personal intro content. |
| `/about` | `src/app/about/page.tsx` | Static SEO-friendly About page rendering `about.md`. | `About - Matthew McKenzie` | `About` | Overlaps heavily with `/now` narrative and homepage README intro. |
| `/work` | `src/app/work/page.tsx` | Static Work landing page from `work.md`. | `Work - Matthew McKenzie` | `Work` | Overlaps with `/projects` and Resume app content. |
| `/projects` | `src/app/projects/page.tsx` | Static projects listing from `projects.md`. | `Projects - Matthew McKenzie` | `Projects` | Placeholder-heavy and overlaps with `/work`. |
| `/writing` | `src/app/writing/page.tsx` | Static writing landing page from `writing.md`. | `Writing - Matthew McKenzie` | `Writing` | Depends on Essays doc content not linked as route. |
| `/contact` | `src/app/contact/page.tsx` | Static contact page from `contact.md`. | `Contact - Matthew McKenzie` | `Contact` | Overlaps with Contact app in desktop OS. |
| `/privacy` | `src/app/privacy/page.tsx` | Privacy policy page with inline JSX content. | `Privacy Policy - Matthew McKenzie` | `Privacy Policy` | Not present in static top nav or sitemap. |
| `/gate` | `src/app/gate/page.tsx` | Site lock login page. | `Matthew McKenzie` | `McKENZIE_OS` | Access gateway, not linked from nav. |
| `/<not-found>` | `src/app/not-found.tsx` | Custom 404 boundary page. | `Matthew McKenzie` | `404` | Reuses static page layout and nav. |

## Metadata and Utility Routes

| Route | Source file | Notes |
|---|---|---|
| `/robots.txt` | `src/app/robots.ts` | Allows all, points to sitemap URL. |
| `/sitemap.xml` | `src/app/sitemap.ts` | Includes `/`, `/about`, `/work`, `/projects`, `/writing`, `/contact`. Omits `/privacy`. |

## API Routes

| Route | Methods | Source file | Notes |
|---|---|---|---|
| `/api/auth` | `POST` | `src/app/api/auth/route.ts` | Handles site lock auth cookie issue. |
| `/api/contact` | `POST` | `src/app/api/contact/route.ts` | Inserts contact form into Supabase. Build currently fails if Supabase env vars are missing. |
| `/api/guestbook` | `GET`, `POST`, `PATCH` | `src/app/api/guestbook/route.ts` | Guestbook read/submit/moderation endpoints. |
| `/api/whoop/status` | `GET` | `src/app/api/whoop/status/route.ts` | WHOOP connection status. |
| `/api/whoop/data` | `GET` | `src/app/api/whoop/data/route.ts` | WHOOP dashboard aggregated data. |
| `/api/whoop/auth/start` | `GET` | `src/app/api/whoop/auth/start/route.ts` | Starts WHOOP OAuth flow. |
| `/api/whoop/auth/callback` | `GET` | `src/app/api/whoop/auth/callback/route.ts` | WHOOP OAuth callback handler. |
| `/api/whoop/auth/disconnect` | `POST` | `src/app/api/whoop/auth/disconnect/route.ts` | Clears WHOOP tokens and cache. |

## Route/Navigation Mismatches
- `src/data/fs.ts` exposes a `now` item but no static `/now` route exists.
- No `/about-me` route exists.
- `src/components/ui/StaticPageLayout.tsx` nav omits `/privacy`.
- `src/app/sitemap.ts` omits `/privacy`.
- Desktop dock/menu includes many app surfaces (Now, Guestbook, Recipes, Health, etc.) that have no SEO route equivalents.
