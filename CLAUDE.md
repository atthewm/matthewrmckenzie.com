# matthewrmckenzie.com — working notes

Next.js 15 App Router, React 19, TypeScript, Tailwind 3. Deployed on Vercel;
every push to `main` triggers a production deploy.

## Verify before every push (non-negotiable)

```bash
cd /Users/matthewmckenzie/matthewrmckenzie.com && npm run verify
```

`verify` = `tsc --noEmit` + `lint:ci`.

**`tsc` alone is NOT enough.** Vercel's `next build` fails the deploy on ESLint
*errors*, which `tsc` never sees. A real example that broke production: using
`<a href="/">` instead of `next/link` trips `@next/next/no-html-link-for-pages`,
which is an ESLint error, not a type error. Type-check passed, deploy failed.

`lint:ci` runs the project's ESLint directly:

```bash
ESLINT_USE_FLAT_CONFIG=false eslint src --ext .ts,.tsx
```

The env var is required because the repo still uses legacy `.eslintrc.json` while
ESLint 9 defaults to flat config. This command reproduces Vercel's lint gate
exactly. Warnings are fine; **errors block the deploy**.

`npm run ship` = `verify` + `build` + `git push origin main`.

## Agent sandbox constraints

When Claude runs in a Linux sandbox with this repo mounted:

- **`next build` and `next lint` do not work.** Next tries to download a
  platform-native SWC binary and the sandbox has no network access to the npm
  registry. Use `npm run verify` instead — it is pure Node and works fine.
- **`git commit` needs an external index.** The mount denies file deletion inside
  `.git`, so git cannot clear `.git/index.lock`. Work around it with:

  ```bash
  export GIT_INDEX_FILE=/tmp/repo.index
  cp .git/index /tmp/repo.index
  git add <paths> && git commit -m "..."
  ```

  The `unable to unlink .git/objects/**/tmp_obj_*` warnings are harmless.
- **`git push` cannot work from the sandbox** — credentials live in the macOS
  keychain. The push is always a human step. Claude should commit, then hand
  over a single command.

## Identity is centralized

`src/config/profile.ts` is the single source of truth for role, employer,
contact details, offices, and bio. Metadata, JSON-LD, the `/card` page, and the
vCard all read from it. Update the role there, not in twelve files.

**Privacy rule:** `profile.mobile` must never be rendered in page HTML. It is
written only into the vCard at `/card/vcard` so it reaches people who scan the
conference QR without being exposed to scrapers. `directPhone` is public.

## App registry

Desktop apps are wired in three places, all of which must agree:

1. `src/data/fs.ts` — the `FSItem` entry (and `dockItemIds` for dock presence)
2. `src/components/desktop/WindowContent.tsx` — import + `appComponents` map
3. the component itself in `src/components/apps/`

## Content sources

- Markdown in `src/content/` (about, work, now, resume, recipes, essays)
- Notion sync via `src/lib/notion/` — nutrition, films, TV, audiobooks
- WHOOP via `src/lib/whoop/` — activity, workouts, recovery

## Style

No em dashes in code or user-facing copy. Keep files under ~400 lines.
Respect the Server vs Client component boundary; `"use client"` only when the
file actually needs state, effects, refs, or event handlers.
