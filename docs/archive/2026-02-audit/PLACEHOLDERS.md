# Placeholder Audit

## Scope
- Code scan: `src/**`, `README.md`, `.env.local.example`
- Rendered scan: `audit/SCREENSHOTS/dom/*.html` from routes `/`, `/about`, `/work`, `/projects`, `/writing`, `/contact`, `/privacy`, `/gate`, `/nonexistent-audit-test`

## A) Codebase Scan

| Placeholder text (exact) | File + line | Context snippet | Confidence |
|---|---|---|---|
| `Content coming soon.` | `src/app/about/page.tsx:23` | fallback paragraph when markdown fails | Likely placeholder |
| `Content coming soon.` | `src/app/work/page.tsx:23` | fallback paragraph when markdown fails | Likely placeholder |
| `Content coming soon.` | `src/app/projects/page.tsx:23` | fallback paragraph when markdown fails | Likely placeholder |
| `Content coming soon.` | `src/app/writing/page.tsx:23` | fallback paragraph when markdown fails | Likely placeholder |
| `Content coming soon.` | `src/app/contact/page.tsx:23` | fallback paragraph when markdown fails | Likely placeholder |
| `Project One` | `src/content/projects.md:5` | heading for stub project | Confirmed placeholder |
| `Project Two` | `src/content/projects.md:11` | heading for stub project | Confirmed placeholder |
| `Project Three` | `src/content/projects.md:17` | heading for stub project | Confirmed placeholder |
| `Another project placeholder. Add real content here.` | `src/content/projects.md:15` | project body copy | Confirmed placeholder |
| `More projects coming soon. This section will grow as I add case studies and demos.` | `src/content/projects.md:25` | footer note | Confirmed placeholder |
| `Essay Title One` | `src/content/essays.md:5` | heading | Confirmed placeholder |
| `A placeholder for your first essay.` | `src/content/essays.md:9` | first paragraph | Confirmed placeholder |
| `Essay Title Two` | `src/content/essays.md:11` | heading | Confirmed placeholder |
| `Another placeholder. The best personal sites have real writing. This is your space.` | `src/content/essays.md:15` | second paragraph | Confirmed placeholder |
| `More essays coming. This section will grow over time.` | `src/content/essays.md:19` | footer note | Confirmed placeholder |
| `Placeholder resume - replace with your actual experience.` | `src/content/resume.md:5` | resume subtitle | Confirmed placeholder |
| `Company Name` | `src/content/resume.md:9` | experience org | Confirmed placeholder |
| `Previous Company` | `src/content/resume.md:14` | experience org | Confirmed placeholder |
| `University Name` | `src/content/resume.md:21` | education org | Confirmed placeholder |
| `Year` | `src/content/resume.md:22` | education date | Confirmed placeholder |
| `Description of responsibilities and achievements.` | `src/content/resume.md:12` | work description | Confirmed placeholder |
| `Description of responsibilities and achievements.` | `src/content/resume.md:17` | work description | Confirmed placeholder |
| `totalTime: "TBD"` | `src/content/recipes/index.ts:59` | brownies metadata | Likely placeholder |
| `totalTime: "TBD"` | `src/content/recipes/index.ts:68` | tortillas metadata | Likely placeholder |
| `totalTime: "TBD"` | `src/content/recipes/index.ts:77` | meatballs metadata | Likely placeholder |
| `totalTime: "TBD"` | `src/content/recipes/index.ts:86` | chicken tenders metadata | Likely placeholder |
| `total_time: TBD` | `src/content/recipes/brownies-9x13.md:5` | frontmatter | Likely placeholder |
| `total_time: TBD` | `src/content/recipes/high-protein-heirloom-blue-corn-tortillas.md:5` | frontmatter | Likely placeholder |
| `total_time: TBD` | `src/content/recipes/mamas-healthy-meatballs.md:5` | frontmatter | Likely placeholder |
| `total_time: TBD` | `src/content/recipes/parmesan-crusted-baked-chicken-tenders.md:5` | frontmatter | Likely placeholder |
| `ANALYTICS PLACEHOLDER` | `src/lib/analytics.ts:2` | file header comment | Confirmed placeholder |
| `TODO: Send to your analytics service` | `src/lib/analytics.ts:10` | tracking stub | Confirmed placeholder |
| `TODO: Send to your analytics service` | `src/lib/analytics.ts:18` | tracking stub | Confirmed placeholder |
| `const placeholders = Array.from({ length: 9 }, (_, i) => i + 1);` | `src/components/apps/GalleryApp.tsx:11` | synthetic photo tiles | Confirmed placeholder |
| `Add photos to populate the gallery` | `src/components/apps/GalleryApp.tsx:55` | gallery footer text | Confirmed placeholder |
| `WHOOP logo placeholder` | `src/components/apps/whoop/GetWhoopApp.tsx:29` | comment | Likely placeholder |
| `More coming soon.` | `src/content/secrets-readme.md:17` | hidden content footer | Likely placeholder |
| `your-admin-password` | `.env.local.example:14` | auth env template value | Confirmed placeholder |
| `your-guest-password` | `.env.local.example:16` | auth env template value | Confirmed placeholder |
| `https://your-project.supabase.co` | `.env.local.example:24` | Supabase URL template | Confirmed placeholder |
| `your-anon-key-here` | `.env.local.example:25` | Supabase anon key template | Confirmed placeholder |
| `your-client-id-here` | `.env.local.example:32` | WHOOP client id template | Confirmed placeholder |
| `your-client-secret-here` | `.env.local.example:33` | WHOOP client secret template | Confirmed placeholder |
| `generate-a-64-hex-char-key-here` | `.env.local.example:38` | encryption key template | Confirmed placeholder |
| `https://your-kv-instance.upstash.io` | `.env.local.example:42` | KV URL template | Confirmed placeholder |
| `your-kv-rest-api-token` | `.env.local.example:43` | KV token template | Confirmed placeholder |
| `Your name` | `src/components/apps/ContactApp.tsx:129` | input placeholder | Likely placeholder |
| `Your email` | `src/components/apps/ContactApp.tsx:142` | input placeholder | Likely placeholder |
| `Your message...` | `src/components/apps/ContactApp.tsx:154` | textarea placeholder | Likely placeholder |
| `Your name` | `src/components/apps/GuestbookApp.tsx:209` | input placeholder | Likely placeholder |
| `Leave a message...` | `src/components/apps/GuestbookApp.tsx:221` | textarea placeholder | Likely placeholder |
| `Type a note...` | `src/components/apps/StickiesApp.tsx:172` | note textarea placeholder | Likely placeholder |

## B) Rendered-Page Scan

| Route | Placeholder text detected | Screenshot(s) | Notes |
|---|---|---|---|
| `/` | None visible in initial viewport | `audit/SCREENSHOTS/desktop/home.png`, `audit/SCREENSHOTS/mobile/home.png`, `audit/SCREENSHOTS/tablet/home.png` | Home route visually loads desktop shell and README. Hidden serialized payload includes placeholder strings from essays/projects. |
| `/about` | None | `audit/SCREENSHOTS/desktop/about.png`, `audit/SCREENSHOTS/mobile/about.png`, `audit/SCREENSHOTS/tablet/about.png` | Content appears production-ready. |
| `/work` | `Select a project to see details, or open my resume for a full overview of my experience.` | `audit/SCREENSHOTS/desktop/work.png`, `audit/SCREENSHOTS/mobile/work.png`, `audit/SCREENSHOTS/tablet/work.png` | Teaser copy feels transitional but not explicit placeholder. |
| `/projects` | `Project One`; `Project Two`; `Project Three`; `Another project placeholder. Add real content here.`; `More projects coming soon. This section will grow as I add case studies and demos.` | `audit/SCREENSHOTS/desktop/projects.png`, `audit/SCREENSHOTS/mobile/projects.png`, `audit/SCREENSHOTS/tablet/projects.png` | Confirmed user-facing placeholder content. |
| `/writing` | `Open the Essays document to read what's here so far.` | `audit/SCREENSHOTS/desktop/writing.png`, `audit/SCREENSHOTS/mobile/writing.png`, `audit/SCREENSHOTS/tablet/writing.png` | Transitional copy, points to non-route content. |
| `/contact` | None | `audit/SCREENSHOTS/desktop/contact.png`, `audit/SCREENSHOTS/mobile/contact.png`, `audit/SCREENSHOTS/tablet/contact.png` | Content appears complete. |
| `/privacy` | None | `audit/SCREENSHOTS/desktop/privacy.png`, `audit/SCREENSHOTS/mobile/privacy.png`, `audit/SCREENSHOTS/tablet/privacy.png` | Content appears complete. |
| `/gate` | `Username`; `Password` | `audit/SCREENSHOTS/desktop/gate.png`, `audit/SCREENSHOTS/mobile/gate.png`, `audit/SCREENSHOTS/tablet/gate.png` | These are functional form placeholders, likely intentional. |
| `/nonexistent-audit-test` | None | `audit/SCREENSHOTS/desktop/nonexistent-audit-test.png`, `audit/SCREENSHOTS/mobile/nonexistent-audit-test.png`, `audit/SCREENSHOTS/tablet/nonexistent-audit-test.png` | 404 copy appears intentional. |

## Rendered Placeholder Notables Not Obvious from Static Route UI
- `audit/SCREENSHOTS/dom/home.html` includes serialized desktop content payload with placeholders from:
  - `src/content/essays.md` (`Essay Title One`, `A placeholder for your first essay`, etc.)
  - `src/content/projects.md` (`Project One`, `Project Two`, placeholder body)
  - `src/content/secrets-readme.md` (`More coming soon.`)
