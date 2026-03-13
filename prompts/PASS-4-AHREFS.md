# Ahrefs Health Score Pass — matthewrmckenzie.com

> **Purpose:** Fix every issue that tanks the Ahrefs Site Health score. Target: 90+ from any starting point.
> **Execute with:** `claude --dangerously-skip-permissions`
> **Target site:** matthewrmckenzie.com (single domain, English only)
> **Estimated time:** 20–40 minutes

---

## Preamble

```
Read CLAUDE.md from the project root for full project context.

This is a retro Mac OS X 10.3 Panther desktop personal website built with Next.js 15 App Router, TypeScript, and Tailwind CSS. Single domain, English only.

This prompt specifically targets the Ahrefs Site Health scoring algorithm. Ahrefs weighs these categories:
1. Broken pages (4xx, 5xx) — heaviest penalty
2. Redirect chains/loops — heavy penalty
3. Missing/duplicate meta tags — medium penalty
4. Missing/incomplete sitemap — medium penalty
5. Orphan pages — medium penalty
6. Missing alt text — light penalty
7. Slow pages — light penalty

The site has static page routes (/about, /work, /contact, /writing, /privacy, /projects) that Ahrefs will crawl, plus a client-side desktop experience (/) that Ahrefs may partially index. The /gate route is admin-only and should be excluded from crawling.
```

---

## Wave 0 — Find Every Broken Page (Highest Impact on Score)

Broken pages are the #1 score killer in Ahrefs.

### Step 1: Build a complete URL inventory

```bash
# Get all routes from the codebase
find src/app -name "page.tsx" -type f | sed 's|src/app/||;s|/page.tsx||' | sort

# Get all URLs from sitemap
curl -s https://matthewrmckenzie.com/sitemap.xml | grep -oP '(?<=<loc>)[^<]+' | sort
```

### Step 2: Check every route for HTTP errors

```bash
# Test each route from sitemap
curl -s https://matthewrmckenzie.com/sitemap.xml | grep -oP '(?<=<loc>)[^<]+' | while read url; do
  status=$(curl -o /dev/null -s -w "%{http_code}" "$url")
  if [ "$status" != "200" ]; then
    echo "ERROR $status: $url"
  fi
done

# Also check known routes not in sitemap
for path in /gate /privacy /projects; do
  status=$(curl -o /dev/null -s -w "%{http_code}" "https://matthewrmckenzie.com$path")
  echo "$path: HTTP $status"
done
```

### Step 3: Check for soft 404s

Some pages return HTTP 200 but display "Not Found" content (soft 404). Ahrefs detects these.

```bash
for path in / /about /work /contact /writing /privacy /projects; do
  content=$(curl -s "https://matthewrmckenzie.com$path")
  if echo "$content" | grep -qi "not found\|404\|page doesn't exist"; then
    echo "SOFT 404: $path"
  fi
done
```

### Fix all broken pages

For each broken page:
- If the route should exist → fix the code
- If the route was removed → add a proper 301 redirect in next.config.ts
- If it's a false positive → verify the page renders correctly

**Commit:** `fix(ahrefs): resolve all broken pages and HTTP errors`

---

## Wave 1 — Eliminate Redirect Chains

Redirect chains are the #2 score killer.

### Step 1: Find potential redirect triggers

```bash
# Check for trailing slash handling
grep -rn "trailingSlash" next.config.ts next.config.js

# Check middleware for any redirects
cat src/middleware.ts

# Check next.config for redirects
grep -rn "redirect" next.config.ts next.config.js | head -20
```

### Step 2: Test for redirect chains

```bash
# Test each public route for redirect chains
for path in / /about /work /contact /writing /privacy /projects; do
  status=$(curl -o /dev/null -s -w "%{http_code}" "https://matthewrmckenzie.com$path")
  location=$(curl -o /dev/null -s -w "%{redirect_url}" "https://matthewrmckenzie.com$path")
  if [ "$status" != "200" ]; then
    echo "REDIRECT $status: $path → $location"
  fi
done

# Check for http→https redirect chain
curl -sIL "http://matthewrmckenzie.com" 2>&1 | grep -i "location:"

# Check for www→non-www redirect chain
curl -sIL "http://www.matthewrmckenzie.com" 2>&1 | grep -i "location:"
```

### Step 3: Check internal links for bare paths that redirect

```bash
# Find all internal href values
grep -rnoP 'href="(/[^"]*)"' src/ --include="*.tsx" | sort -t: -k3 -u
```

### Fix all redirect chains

- Ensure all internal links point to final destination URLs
- Collapse any multi-hop redirects into single 301s
- Ensure http→https and www→non-www are single-hop

**Commit:** `fix(ahrefs): eliminate all redirect chains`

---

## Wave 2 — Meta Tag Completeness

Ahrefs checks every crawlable page for complete meta tags.

### Step 1: Audit every page for meta completeness

For each page in the sitemap, check:

| Check | Target |
|-------|--------|
| `<title>` | Present, 30–65 chars, unique |
| `<meta name="description">` | Present, 70–160 chars, unique |
| `<link rel="canonical">` | Present, absolute URL |
| `<meta property="og:title">` | Present |
| `<meta property="og:description">` | Present |
| `<meta property="og:image">` | Present, valid URL |
| `<h1>` | Exactly 1 per page |

### Step 2: Check for duplicates

```bash
# Extract all titles from static pages
for path in / /about /work /contact /writing /privacy /projects; do
  title=$(curl -s "https://matthewrmckenzie.com$path" | grep -oP '(?<=<title>)[^<]+')
  echo "$title | $path"
done | sort
```

Any duplicate titles → fix them to be unique.

### Fix all meta issues

- Add missing titles, descriptions, og:image
- Fix duplicate titles by making each unique
- Ensure exactly 1 H1 per page
- Add default og:image in root layout as fallback

**Commit:** `fix(ahrefs): complete meta tags — titles, descriptions, OG`

---

## Wave 3 — Sitemap + robots.txt

### Sitemap checks

```bash
cat src/app/sitemap.ts
```

Verify:
- Every public page is in the sitemap
- `<lastmod>` dates are present
- No gated/private pages in the sitemap (/gate)
- No broken URLs in the sitemap
- Sitemap URL count matches actual public route count

### robots.txt checks

```bash
cat src/app/robots.ts
```

Verify:
- Sitemap directive points to correct absolute URL
- Private routes blocked (/gate, /api)
- Public routes NOT blocked
- No overly broad Disallow rules that block important pages

### Fix sitemap and robots

- Add any missing pages to sitemap
- Remove /gate from sitemap if present
- Fix robots.txt directives

**Commit:** `fix(ahrefs): fix sitemap and robots.txt`

---

## Wave 4 — Images + Remaining Issues

### Images without alt text

```bash
grep -rn '<img\|<Image' src/ --include="*.tsx" | grep -v 'alt=' | grep -v 'alt=""'
# Also check for empty alt (which is OK for decorative images only)
grep -rn 'alt=""' src/ --include="*.tsx"
```

Fix: Add descriptive alt text to all content images. Decorative images can keep `alt=""`.

### Orphan pages

Check for pages that exist in routes but are NOT linked from any other page and NOT in the sitemap:

```bash
# Get all routes
find src/app -name "page.tsx" -not -path "*/gate/*" | sed 's|src/app/||;s|/page.tsx||' | sort > /tmp/routes.txt

# Get all internal link targets in static pages
grep -rnoP 'href="(/[^"]*)"' src/app/ --include="*.tsx" | sed 's|.*href="||;s|"||' | sort -u > /tmp/linked.txt

# Find orphans
comm -23 /tmp/routes.txt /tmp/linked.txt
```

Fix: Add links to orphan pages from relevant pages (nav, footer, or inline).

### noindex on /gate

Ensure the admin login page has noindex:

```bash
grep -rn "robots\|noindex" src/app/gate/ --include="*.tsx" --include="*.ts"
```

**Commit:** `fix(ahrefs): add alt text, link orphan pages, noindex gate`

---

## Gate Check

```bash
npx tsc --noEmit
npm run build
```

**Ahrefs-specific verification checklist:**
- [ ] Zero pages return 4xx or 5xx
- [ ] Zero soft 404s
- [ ] Zero redirect chains
- [ ] Every page has: title, description, canonical, og:image, h1
- [ ] No duplicate titles or descriptions
- [ ] Sitemap covers ALL public pages
- [ ] robots.txt has correct Sitemap directive
- [ ] /gate has noindex and is excluded from sitemap
- [ ] All content images have alt text
- [ ] No orphan pages (every page is linked from somewhere)
- [ ] Build succeeds with zero errors

**Expected Ahrefs score after this pass: 90+**
