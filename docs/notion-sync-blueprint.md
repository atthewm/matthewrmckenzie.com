# Notion → matthewrmckenzie.com Sync — Blueprint & Scaffold

_Last updated: 2026-06-06_

This document is the plan **and** the map for pulling pieces of the HQ Notion
workspace into the site as native ryOS "apps." It pairs with working scaffold
code (already committed in this branch) that you wire up by adding a Notion token
and running one sync.

---

## 1. What we're building

Bring living slices of Notion onto the desktop as apps, kept fresh automatically:

| Piece | Source (Notion) | App on site | Visibility |
|---|---|---|---|
| **Nutrition dashboard** | Daily Logs (Nutrition OS) | `Health ▸ Nutrition` | Public (daily macro totals only) |
| **Top foods** | Meal Entries (Nutrition OS) | `Top Foods` | Public (**aggregate only**) |
| **Movies** | Films (Media Library) | `Media ▸ Movies` | Public (notes hidden) |
| **TV shows** | TV Shows (Media Library) | `Media ▸ TV Shows` | Public (notes hidden) |
| **Audiobooks** | Books where `Format = Audiobook` / `Source = Audible` | `Media ▸ Audiobooks` | Public (notes hidden) |
| **Favorite foods** | Recipe Booklet (`Favorite = true`) | _(config only; UI optional)_ | Public |
| Recipes _(already on site)_ | Recipe Booklet | existing `RecipeViewer` | Public |
| Moving checklist _(future)_ | Moving Checklist | _(add one registry entry)_ | Private |

The split honors the rule: **sensitive data private, everything else public**
(e.g. ratings, posters, "where to watch," favorite foods are public; personal
notes, reviews, and the whole nutrition log are private).

---

## 2. Notion inventory (what's there)

The workspace is a full "operating system" under a top page called **HQ**:

- **HQ**
  - **Home** — daily command center
  - **Nutrition OS** (under Health) — the food system
    - **Daily Logs** ← _nutrition dashboard source_ (calories, protein gross +
      bioavailable, fat, carbs, fiber, targets, variances, day type, status)
    - Meal Entries, Recipe Booklet, Meal Components, Pantry, Label Booklet,
      Grocery Lists, Supplements, Health Stats (Apple Health + Eight Sleep)
    - A "Whoop-style" live dashboard already exists in Cowork
  - **Media Library** — Apple-TV-clean / Letterboxd-deep
    - **Films**, **TV Shows**, **Music**, **Books** databases (rich: ratings,
      critics/audience/IMDB/Letterboxd/Metacritic, where-to-watch, trailers,
      moods, awards, parent guides), plus People, Lists, Watchlist, Hall of Fame
    - A daily "Enrichment QA" pipeline keeps it fresh
  - **Core DBs**: Projects (17), Tasks (GTD), Notes & Chats (2,600+ imported
    conversations), Decisions
  - **Supporting DBs**: Areas, Prompt Library, Resources, Deliverables,
    People & Orgs (CRM)
  - **Marketplace Opportunity Dashboard** — demand pipeline (signals → gaps)
  - **Moving Checklist** — Austin relocation (Task, Category, Timeline, Status)

The databases are clean and well-typed, which makes them ideal sync sources.

---

## 3. Architecture

The site **already** does this exact shape for WHOOP: external source → cache →
a retro dashboard app. We reuse that pattern for Notion.

```
        ┌─────────────┐   hourly cron    ┌────────────────────┐
        │   Notion    │◀──────────────── │ /api/notion/sync   │   (server, secret-gated)
        │  databases  │   REST query     │  runSync()         │
        └─────────────┘ ───────────────▶ └─────────┬──────────┘
                                                    │ normalize + split public/private
                                                    ▼
                                          ┌────────────────────┐
                                          │ Supabase           │
                                          │  notion_cache table│
                                          └─────────┬──────────┘
                                                    │ read (public-safe / +private if authed)
                                                    ▼
                       ┌────────────────────────────────────────────┐
   browser  ◀───────── │ /api/notion/data?dataset=…  (gated)         │
   (app fetch)         └────────────────────────────────────────────┘
                                                    ▲
                                                    │ fetch on mount
                              NutritionApp / MediaShelfApp (client apps)
```

**Why a Supabase cache instead of reading Notion live?**

- Fast reads, no Notion rate limits, and the site still works if Notion is down.
- Matches the stack already in place (`@supabase/supabase-js`, gate, API routes).
- The public read route can be CDN-cached (`s-maxage`) because it's just JSON.

**Freshness:** scheduled (you chose auto-sync). `vercel.json` runs the sync
hourly. Change the cron expression to taste. (Vercel Hobby allows daily crons;
Pro/Team allows hourly — your team project supports hourly.)

**Durability of the scheduled run.** A cron-driven cache fails quietly unless it
is built not to, so the sync makes three guarantees:

1. **Writes never blank the app.** `writeDataset` upserts the fresh rows first
   (stamped with the run's `synced_at`) and only then deletes rows left over
   from an earlier run. The previous delete-then-insert order left the dataset
   empty between statements, so a failed insert or a function timeout in that
   gap took the app down until the next successful run. Now a partial failure
   degrades to stale data instead of no data.
2. **An empty upstream result is treated as a fault, not a deletion.** If Notion
   returns zero rows for a dataset that currently has cached rows — revoked
   integration access, a renamed filter property — the write is refused and the
   run is logged as failed rather than emptying the shelf.
3. **Failures are visible.** Every dataset in every run is recorded in
   `notion_sync_runs` (see the schema file) and readable at
   `GET /api/notion/sync?status=1`. Without it a broken cron looks exactly like
   a quiet week, because the cache keeps answering with data that stopped moving.
   A misconfigured deployment is recorded too, under the `_config` sentinel, and
   the status branch is answered *before* the `NOTION_TOKEN` check so the
   endpoint still explains itself when that is the thing that is missing.
   The one blind spot is a missing `SUPABASE_SERVICE_ROLE_KEY`: the run log
   lives in the database that key opens, so that failure shows up only in the
   route's 503 body and the Vercel logs.

Datasets are isolated: one failing database does not stop the others, and the
route returns `207` when some datasets failed.

---

## 4. Public / private model

Every row is normalized into two payloads at sync time:

- `data` — **public-safe** (title, year, rating, genres, poster, where-to-watch…)
- `private_data` — **admin-only** (personal notes, reviews, parent guide, the
  entire nutrition record)

The read route enforces it:

- **Private datasets** (`nutrition`) → `401` unless the `mckenzie_auth` gate
  cookie is present. Nothing leaks to the public.
- **Public datasets** (`films`, `tv`, `audiobooks`, `favorite-foods`) → always
  return `data`; `private_data` is merged in **only** for an authenticated admin
  (it rides along under `_private`).

This is exactly "sensitive private, the rest public," enforced server-side, and
it reuses your existing `/gate` login + `SITE_LOCK_COOKIE_VALUE`.

---

## 5. Field mapping (per piece)

### Nutrition — Daily Logs → `NutritionDay` (private)
`Log Date`→date · `Calories`/`Calorie Target` · `Protein Gross` ·
`Protein Bioavailable`/`Protein Target` · `Fat` · `Carbs` · `Fiber Food`/`Fiber
Total` · `Day Type` · `Status`. A `hitTargets` flag is computed at sync time
(calories within ±buffer, bioavailable protein ≥ target, fiber ≥ 39). The app
renders today's rings, a 7-day list, and a streak.

### Movies — Films → `MediaItem` (public + private notes)
Public: `Title`, `Year`, `My Rating` (★→0–5), `Status`, `Favorite`, `Genres`,
`Director` (resolved via People), `Cover URL`/`Cover`, `Synopsis`, `Where to
Watch`, `Trailer URL`, `IMDB URL`, first `Streaming`, `Watched Date`.
Private: `Personal Notes`, `My Review`, `Parent Guide`.

### TV — TV Shows → `MediaItem` (public + private notes)
Same shape; `Creator` instead of Director, `Network / Platform`, `Last Watched
Date`. Private adds `Best Episode`.

### Audiobooks — Books filtered to audio → `MediaItem` (public + private notes)
Row filter: `Format` contains **Audiobook** OR `Source = Audible`.
Public: `Title`, `Author` (People), `My Rating`, `Status`, `Genres`, `Cover`,
`Synopsis`, `Source`, `Finished/Started Date`, external link =
`Goodreads / Storygraph URL` or `https://www.audible.com/pd/{ASIN}`.
Private: `Narrator`, `Notes / Highlights`.

> **Audible note:** Audible has **no public "my library" API**. Notion (Books DB,
> `Source = Audible`, with `ASIN`) is the source of truth. Keep logging finished
> audiobooks in Notion and they flow to the site. (If you ever want auto-capture,
> the realistic routes are a Storygraph/Goodreads export or a manual ASIN paste —
> both still land in this same Books DB.)

### Top foods — Meal Entries → `TopFood[]` (public, aggregate only)
Meal Entries is a per-meal food diary (`Item`, `Meal`, `Calories`, `Protein
Gross`, `Fat`, `Carbs`, `Fiber`, plus a `Day` relation back to Daily Logs). That
row-level detail is exactly what should not be public, so this dataset is the
one that **aggregates inside the sync**: `src/lib/notion/foods.ts` reduces the
whole table to a ranked "most logged foods" list and only the rollup is written
to the cache. No per-meal row, note, or date is ever stored or served.

Two details worth knowing:

- **Name normalization.** Item titles are typed by hand and drift badly — the
  live log holds `Egg whites (5)`, `Egg whites`, and `5 egg whites` for one
  food, and four spellings of dark chocolate. `foodKey()` strips parentheticals,
  trailing qualifiers, leading quantities, and prep adjectives, then removes
  separators so `Lesser Evil popcorn` and `LesserEvil popcorn` collapse together.
  A short alias map catches brand shorthand (`Fairlife FF milk`) that
  normalization alone cannot reach. Without this the ranking is meaningless:
  one food splits across six rows and none of them ranks.
- **Averages are per logged serving**, not per 100 g. Portions vary between
  entries, so the number answers "what does a typical serving look like in my
  log". `daysLogged` uses the `Day` relation rather than the row's created time,
  because a lot of history was backfilled in bulk and created times cluster on
  the backfill dates.

### Favorite foods — Recipe Booklet (`Favorite = true`) → `FavoriteFood` (public)
Best-effort field names (`Name`/`Title`, `Notes`/`Description`, `Tags`/`Category`)
— confirm against the live Recipe Booklet schema and adjust the getters in
`src/lib/notion/datasets.ts`. No UI is wired yet; the data is available at
`/api/notion/data?dataset=favorite-foods` for a future "Favorites" panel.

---

## 6. The scaffold (files in this branch)

**New — Notion library** (`src/lib/notion/`)
- `config.ts` — token, sync secret, database IDs (live defaults baked in)
- `client.ts` — dependency-free Notion REST query client (paginates)
- `properties.ts` — null-safe property extractors (`getTitle`, `getNumber`, …)
- `datasets.ts` — the **registry**: one entry per piece + public/private split.
  An entry supplies either `transform` (one page → one row) or `aggregate`
  (all pages → rollup rows, used by top-foods)
- `foods.ts` — food-name normalization + the top-foods rollup
- `cache.ts` — Supabase service-role read/write of `notion_cache`, plus the
  `notion_sync_runs` log
- `sync.ts` — orchestration (`runSync`), People/Day relation maps, per-run
  query memo so Daily Logs is not paginated twice

**New — data model** (`src/data/notion/types.ts`) — `NutritionDay`, `MediaItem`,
`FavoriteFood`, `DatasetResponse`, default targets.

**New — API routes**
- `src/app/api/notion/sync/route.ts` — secret/cron-gated sync trigger
- `src/app/api/notion/data/route.ts` — gated read (public-safe / +private)

**New — apps**
- `src/components/apps/NutritionApp.tsx` — rings + 7-day + streak
- `src/components/apps/MediaShelfApp.tsx` — one component for Movies/TV/Audiobooks
- `src/components/apps/TopFoodsApp.tsx` — ranked foods, sortable and filterable
- `src/components/apps/RecipesApp.tsx` — recipe card grid (opens `RecipeViewer`)

**Edited (additive)**
- `src/components/desktop/WindowContent.tsx` — registered the two apps
- `src/data/fs.ts` — added `Health ▸ Nutrition` and a top-level `Media` folder
- `.env.local.example` — Notion section

**Infra / docs**
- `docs/notion-sync-schema.sql` — `notion_cache` table + RLS
- `vercel.json` — hourly cron for the sync
- `docs/notion-sync-blueprint.md` — this file

Adding a new piece later = **one entry in `datasets.ts`** (+ optionally one app).

---

## 7. Going live (checklist)

1. **Create a Notion integration** at notion.so/my-integrations (internal).
   Copy the token.
2. **Share each source database** with the integration (open DB → ••• →
   Connections → add it): Daily Logs, **Meal Entries**, Films, TV Shows, Books,
   People, and (for favorite foods) Recipe Booklet. Without Meal Entries the
   Top Foods app stays empty; without Daily Logs its "days logged" counts are
   under-reported, since the day comes from the `Day` relation.
3. **Create the cache tables**: run `docs/notion-sync-schema.sql` in Supabase.
   It creates both `notion_cache` and `notion_sync_runs`; re-running it is safe
   (everything is `if not exists`), so apply it again if you set the sync up
   before the run log existed.
4. **Get the Supabase service-role key** (Project Settings → API).
5. **Set env vars** in `.env.local` *and* the Vercel dashboard:
   - `NOTION_TOKEN`, `NOTION_SYNC_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`
   - (`NEXT_PUBLIC_SUPABASE_URL` already set for the guestbook)
6. **Deploy.** The hourly cron in `vercel.json` starts syncing.
7. **First sync now** (optional): `curl -X POST
   https://matthewrmckenzie.com/api/notion/sync -H "Authorization: Bearer
   $NOTION_SYNC_SECRET"` — or one DB: `…/sync?only=films`.
8. Open **Media ▸ Movies** (public) and **Health ▸ Nutrition** (after logging in
   at `/gate`).

Until step 5 is done, the apps render a friendly "not synced yet / private"
state and the build stays green — nothing crashes on missing env.

---

## 8. Cost & limits

- Notion API: free; we paginate and cap at 2,000 rows/DB. Hourly sync of ~5 DBs
  is trivial volume.
- Supabase: a few hundred small JSON rows — negligible.
- Vercel: one short cron invocation per hour.

---

## 9. Roadmap

- **Phase 1 (done):** Nutrition + Movies/TV/Audiobooks, served from the cache on
  the hourly cron.
- **Phase 2 (done):** Top Foods aggregate app; durable cron writes and the
  `notion_sync_runs` log. _Still open:_ favorite-foods panel UI; richer Nutrition
  charts (calendar heatmap of hit-target days, like the Cowork artifact); custom
  retro icons for the new desktop items (add to `PantherIcons`/`RetroIcons`).
- **Phase 3:** Moving Checklist app (private) — add one `datasets.ts` entry +
  a small list view. Projects portfolio (public) from the Projects DB.
- **Phase 4:** Notion webhook → on-demand revalidation for near-instant updates
  (optional; hourly cron is plenty for this content).

---

## 10. Caveats

- **Audible** has no public personal-library API — Notion is the source (see §5).
- **Recipe Booklet** field names for favorite-foods are assumed; confirm/adjust.
- **Relations** (Director/Author/Creator) resolve to names via the People DB; if
  People isn't shared with the integration, those fields are just empty.
- New desktop items use the **fallback icon** until custom icons are added.
- Verify with a local `npm run build` before committing (fast on local disk).
