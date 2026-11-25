# Project instructions

## What this is

Matthew McKenzie's personal site presents his work, writing and recipes. Visitors use a retro desktop on large screens and a phone springboard on small screens. Matthew works at Menlo Equities in Austin.

## Live URLs

https://matthewrmckenzie.com

## Repo, local folder and deploy target

GitHub repo [atthewm/matthewrmckenzie.com](https://github.com/atthewm/matthewrmckenzie.com). The primary checkout is at `~/matthewrmckenzie.com`. Vercel project `matthewrmckenzie.com` deploys main to production. Both the deployment filter and ignore command in vercel.json skip all other branches, including screenshot and QA asset branches.

## Stack and versions

Next.js 15.5.12 App Router, React 19.2.4 and TypeScript 5.9.3 from the lockfile. Tailwind CSS 3, ESLint 9 with legacy configuration, and Vitest 5.1.0.

## Commands

Install with `npm ci`. Develop with `npm run dev`. Test with `npm test`. Run `npm run verify` before pushing. Build with `npm run build` and serve the result with `npm start`.

`npm run verify` runs TypeScript with no emit and then `npm run lint:ci`. Legacy ESLint requires `ESLINT_USE_FLAT_CONFIG=false eslint src --ext .ts,.tsx`. Warnings pass. Errors such as internal links implemented with plain anchors can fail the production build even when TypeScript passes.

GitHub Actions runs verify, tests and the production-style build. The postbuild audit checks the rendered metadata on every indexable page.

The historical `npm run ship` unlocks Git, verifies, builds, then pushes directly to main. Ship this pass through a reviewed PR under the merge rule below.

## Env vars

Use Vercel project environment settings for deployment and an ignored .env.local for local development. The inventory names variables only.

* Vercel production has the app and site settings ANTHROPIC_API_KEY, CRON_SECRET, NEXT_PUBLIC_BASE_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, OWNER_COOKIE_SECRET, OWNER_MOBILE_E164, SITE_LOCK_ADMIN_USER, SITE_LOCK_ADMIN_PASSWORD, SITE_LOCK_COOKIE_VALUE, NOTION_SYNC_SECRET and NOTION_TOKEN.
* Vercel production has WHOOP_CLIENT_ID, WHOOP_CLIENT_SECRET, WHOOP_ENCRYPTION_KEY, WHOOP_REDIRECT_URI, KV_REST_API_URL, KV_REST_API_TOKEN, KV_REST_API_READ_ONLY_TOKEN, KV_URL and REDIS_URL. These support the optional WHOOP and storage integrations.
* Optional site and Notion overrides in code are NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_NOTION_RECIPES_URL, NOTION_DB_BOOKS, NOTION_DB_FILMS, NOTION_DB_MEAL_ENTRIES, NOTION_DB_MOVING, NOTION_DB_NUTRITION, NOTION_DB_PEOPLE, NOTION_DB_RECIPES and NOTION_DB_TV. Guest gate variables are SITE_LOCK_GUEST_USER and SITE_LOCK_GUEST_PASSWORD. Configure optional overrides locally or in Vercel for the feature.
* The media upload script uses R2_S3_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET and optional R2_BACKGROUNDS_PREFIX in its local environment. NEXT_PUBLIC_BACKGROUNDS_BASE_URL selects the public media origin when configured at build time. Vercel supplies VERCEL_ENV and VERCEL_URL. Node supplies NODE_ENV.

## Data and services

The local Supabase URL references project `uqnsrangpdzbzxqtqvvk`. src/lib/notion/ connects nutrition, films, TV and audiobooks. The Vercel cron requests /api/notion/sync daily at 12:00 UTC. src/lib/whoop/ reads activity, workouts and recovery. The Life app is for the owner cookie only. Treat the historical public dashboard plan as superseded.

The dedicated Cloudflare R2 bucket is matthewrmckenzie-backgrounds. Its public custom domain is media.matthewrmckenzie.com. The upload script selects the bucket with R2_BUCKET. NEXT_PUBLIC_BACKGROUNDS_BASE_URL names the public backgrounds directory. Vercel stages the 34 source videos outside public/ and serves the old video paths with a permanent redirect. An ordinary local build or development session restores the source videos.

src/config/profile.ts owns role, employer, public contact details, offices and bio. Metadata, JSON-LD, /card and the vCard read it. Keep the personal mobile number in OWNER_MOBILE_E164. Only src/lib/owner-contact.ts should read it for /card/vcard. Keep it out of page HTML, client bundles, public PDFs and the repo. directPhone is public.

Markdown in src/content/ covers about, work, now, resume, recipes and essays. Recipe frontmatter uses title, subtitle, yield, total_time, tags, category, source and updated. `npm run recipes`, also invoked by predev and prebuild, rebuilds index.ts and mirrors Markdown into public/recipes/. The desktop folder, /recipes, sitemap and llms.txt use that index.

## Rules for this repo

The office is 510 Baylor Street, Austin, Texas 78703. There is no projects section. Keep the prohibited recruiting and side-project language out of public copy. Do not change testimonials, the $800M+ figures or alumniOf without Matthew's review. Never merge or close PR 15.

Keep source files near 400 lines or less. Add a client component boundary only for state, effects, refs or event handlers. Desktop app changes must agree in src/data/fs.ts (including dockItemIds), src/components/desktop/WindowContent.tsx (appComponents), and src/components/apps/. Keep the old audits under docs/archive/.

Use one robots policy. Allow Googlebot, Bingbot, Applebot, DuckDuckBot, AhrefsBot, AhrefsSiteAudit, OAI-SearchBot, ChatGPT-User, GPTBot, PerplexityBot, Perplexity-User, Claude-SearchBot, Claude-User, ClaudeBot, Google-Extended and Applebot-Extended. Block CCBot, Bytespider, Diffbot, Meta-ExternalAgent, Amazonbot, cohere-ai, ImagesiftBot, Omgilibot and PetalBot completely. Build each allowed group from the same private path list as the wildcard. Allow the Open Graph image and publish one sitemap line.

Keep public pages static or use incremental static regeneration. Keep Vercel Web Analytics on and Vercel on Pro. Never enable a send flag, a sending cron or any outreach during this pass. Ask Matthew before infrastructure, domain, DNS or billing changes covered by his rules. Do not commit local environment files.

Rebase on origin/main before pushing. Build only main on Vercel. Collect review screenshots from a local production build. Merge changes with no visual effect in batches after the tests, build and site checks pass. Check production immediately after each batch. Leave visual PRs open until Matthew approves the 390 and 1440 pixel screenshots in both themes.

### Session handoff

1. At the start of a session, read AGENTS.md, then docs/agents/HANDOFF.md, the newest 10 entries in docs/agents/LOG.md, and all of docs/agents/DECISIONS.md.
2. Before ending a session, replace HANDOFF.md with the current state. Add one entry at the top of LOG.md. Append any new decision Matthew made to DECISIONS.md. Commit these with the work, in the same pull request when there is one.
3. Use one tool per branch at a time. Start branch names with `codex/` or `claude/`.
4. A prompt already handed to a tool counts as sent. Send changes as a follow-on prompt.
5. Change facts in AGENTS.md only. Correct a wrong fact there and record the correction in LOG.md.

## Brand and design rules

Use a responsive retro desktop with positive nostalgia and a phone springboard at 390 pixels. Phones use MobileView. Static reading routes use StaticPageLayout with the .site slate and gold tokens from globals.css, shared with mckm.at. Preserve a persistent Graphite dark appearance, use one icon per app, and play the boot chime only after a tap. Respect reduced motion. Do not add paid fonts, icons or stock media.

## Owner rules

<!-- BEGIN OWNER RULES v1 -->
Write plain and direct. Put the bottom line first. Use plain words for jargon. Leave out filler, quips, em dashes and en dashes.

Do the research and checking yourself before asking Matthew anything you could look up.

Ask Matthew before any purchase, plan or billing change, DNS or domain change, deletion that cannot be undone, or anything sent to another person. Show Matthew drafts before anything goes out in his name.

Never commit or print secrets.

Show Matthew every design change at 1440 and 390 pixels wide, in light and dark, before merging.

Work a task through to a conclusion, including shelving it. Finish or explicitly shelve work before opening more projects.

Matthew works at Menlo Equities. Civitas Capital is a past employer. Use past tense for Civitas Capital.

Design every asset for a phone first. Use an iPhone sized viewport of 390 pixels.
<!-- END OWNER RULES v1 -->

## Where state lives

Read [the handoff](docs/agents/HANDOFF.md) for current work, [the session log](docs/agents/LOG.md) for prior checks and [Matthew's decisions](docs/agents/DECISIONS.md) for the rules he gave.

## Background docs

The [original working notes](https://github.com/atthewm/matthewrmckenzie.com/blob/0624f4679f8159b838d73c79585df42ca223d652/CLAUDE.md) are preserved at the parent commit. [Claude's archived audit](docs/archive/CLAUDE_AUDIT_LOG.md), [open decisions](docs/OPEN_ITEMS_punchlist.md), [tech debt review](docs/OPEN_ITEMS_techdebt.md), [design system](docs/design-system/README.md) and [Notion sync notes](docs/notion-sync-blueprint.md) supply historical context.

## Codex only

## Local release checks

Run `npm run ci:local` from the repository root to run the checks in `.github/workflows/verify.yml` in order. Use Node 22. A failing command stops the run. Use a clean checkout without production credentials. Before merging, rebase on the current `origin/main`, run this command and the site checks, and paste the full pass/fail summary and tested Git SHA into the pull request. See [the handoff](docs/agents/HANDOFF.md) for the job inventory and runner-minute estimate.
