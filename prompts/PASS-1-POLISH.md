# Polish Pass — matthewrmckenzie.com

> **Purpose:** Content quality, copy consistency, grammar, tone alignment, and messaging polish across every public-facing page and component.
> **Execute with:** `claude --dangerously-skip-permissions`
> **Target site:** matthewrmckenzie.com (single domain, English only)
> **Estimated time:** 20–40 minutes

---

## Preamble

```
Read CLAUDE.md from the project root for full project context.

This is a retro Mac OS X 10.3 Panther desktop personal website built with Next.js 15 App Router, TypeScript, and Tailwind CSS. It serves as Matthew McKenzie's portfolio, personal hub, and creative expression.

The site features a desktop metaphor: a window manager, dock, menu bar, and apps (About, Work, Contact, Guestbook, Terminal, Stickies, Photos, Music, Videos, Settings, etc.). Content lives in both component files and markdown files (src/content/).

This prompt audits and fixes every public-facing text element: headings, body copy, CTAs, labels, error messages, footer text, nav items, meta descriptions, alt text, and app-internal copy. The goal is professional, consistent, publication-ready copy.
```

---

## Wave 0 — Inventory + Audit

### Step 1: Build a page and component inventory

```bash
# Find all page.tsx files (these are your routes)
find src/app -name "page.tsx" -type f | sort

# Find all layout.tsx files
find src/app -name "layout.tsx" -type f | sort

# Find all app component files (the "apps" inside the desktop)
find src/components/apps -name "*.tsx" -type f | sort

# Find all desktop shell components with visible text
find src/components/desktop -name "*.tsx" -type f | sort

# Find all markdown content files
find src/content -name "*.md" -type f | sort

# Find all data/config files with user-facing text
cat src/data/fs.ts
```

Read every file. For each, note:
- Page title (from metadata or layout)
- H1/heading text
- All visible headings (H2, H3, H4)
- CTA button text
- Any hardcoded body copy
- Descriptions in fs.ts items
- Markdown content in src/content/

### Step 2: Audit for polish issues

Check every page and component for these categories:

**A. Grammar & Spelling**
- Typos, misspellings, double spaces
- Subject-verb agreement
- Sentence fragments in body copy (OK in headings, not in paragraphs)

**B. Tone & Voice Consistency**
- Personal, approachable but professional — this is a creative personal site
- Consistent use of first person ("I" not "we" or passive voice)
- CTAs should be concise and action-oriented
- Desktop metaphor language should be consistent (e.g., "app" not "page" within the OS)

**C. Terminology Consistency**
- "McKenzie OS" or "McKENZIE_OS" — pick one and use it everywhere
- App names should match exactly between fs.ts, dock, menu bar, and component titles
- Window title bars should match fs.ts item names

**D. Heading Hierarchy**
- Each static page route (about, work, contact, etc.) has exactly 1 H1
- H2s follow H1, H3s follow H2s — no skipped levels
- Headings are descriptive, not generic

**E. CTA Consistency**
- All primary CTAs use the same pattern
- Button text is action-oriented and specific
- No dead-end pages (every page has a clear next action)

**F. Meta Content**
- Every page route has a unique meta description (120–160 chars)
- Every page route has a unique title (40–65 chars)
- No duplicate titles or descriptions
- Titles follow consistent pattern (e.g., "Topic — Matthew McKenzie")

**G. Microcopy**
- Form labels are clear and consistent (Contact form, Guestbook form)
- Error messages are helpful and on-brand
- Empty states have guidance text
- Loading states have context
- Dock tooltips and menu items are accurate
- Terminal command responses are consistent

### Step 3: Create the fix list

For each issue found, log:
```
FILE: src/components/apps/AboutApp.tsx
LINE: 42
ISSUE: Inconsistent app name — "About Me" in component vs "About" in fs.ts
FIX: Standardize to "About" everywhere
```

---

## Wave 1 — Fix All Issues

Work through the fix list file by file. Group fixes by file to minimize context switching.

**Priority order:**
1. Terminology and naming consistency (fs.ts → component titles → menu bar → dock)
2. Grammar and spelling fixes
3. Tone alignment (personal, creative, approachable)
4. CTA text improvements
5. Meta title/description fixes
6. Heading hierarchy fixes
7. Microcopy improvements (forms, errors, empty states)

**Rules:**
- Never change meaning — only improve clarity and consistency
- Keep the playful Mac OS X Panther personality
- All app names in fs.ts are the source of truth — components and menus must match

Commit after each logical group:
```
fix(copy): standardize app names and terminology across OS
fix(copy): fix grammar issues in content and components
fix(copy): align tone — personal, approachable, creative
fix(copy): fix meta titles and descriptions for uniqueness
fix(copy): improve microcopy — error messages, empty states, labels
```

---

## Wave 2 — Markdown Content Files

### Step 1: Audit markdown files

```bash
find src/content -name "*.md" -type f | sort
```

### Step 2: Check each markdown file

- Is the content up-to-date and accurate?
- Does it match the tone of the rest of the site?
- Are there any broken links or references?
- Is frontmatter (title, date) present and correct?

### Step 3: Fix content files

- Update any stale or placeholder content
- Fix formatting inconsistencies
- Ensure all links work

**Commit:** `fix(content): polish markdown content files`

---

## Gate Check

```bash
npx tsc --noEmit
npm run build
```

**Verification checklist:**
- [ ] All app names match between fs.ts, dock, menu bar, and window titles
- [ ] Every page route has unique meta title and description
- [ ] No duplicate titles or descriptions across the site
- [ ] All CTAs follow consistent voice pattern
- [ ] No typos or grammar issues remain
- [ ] Form labels and error messages are clear and helpful
- [ ] Markdown content is polished and current
- [ ] Build succeeds with zero errors
