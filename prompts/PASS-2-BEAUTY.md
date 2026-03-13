# Beauty Pass — matthewrmckenzie.com

> **Purpose:** Visual polish, CSS consistency, responsive design, spacing, color contrast, animations, and UI refinement across every component.
> **Execute with:** `claude --dangerously-skip-permissions`
> **Target site:** matthewrmckenzie.com (single domain, English only)
> **Estimated time:** 30–60 minutes

---

## Preamble

```
Read CLAUDE.md from the project root for full project context.

This is a retro Mac OS X 10.3 Panther desktop personal website built with Next.js 15 App Router, TypeScript, and Tailwind CSS. The visual identity is a faithful recreation of the Mac OS X 10.3 Panther Aqua interface: brushed metal window chrome, pinstripe backgrounds, glossy buttons, shadow effects, and a translucent dock.

Key visual elements:
- Window manager with draggable, resizable windows
- Panther-style menu bar at top
- Magnifying dock at bottom
- Desktop icons with Panther PNG icons
- Ambient video backgrounds (18 themes in Settings)
- Floating sticky notes on desktop
- Boot sequence animation

This prompt audits and fixes every visual element: spacing, alignment, color contrast, responsive breakpoints, font consistency, hover/focus states, animations, window chrome, and component polish. The goal is a visually cohesive, authentic Panther Aqua experience that is also accessible and responsive.
```

---

## Wave 0 — Visual Audit

### Step 1: Identify the design system

```bash
# Find Tailwind config
cat tailwind.config.ts || cat tailwind.config.js

# Find global styles
cat src/app/globals.css

# Find all component files
find src/components -name "*.tsx" -type f | sort

# Check the Panther icon system
head -50 src/components/desktop/PantherIcons.tsx

# Check the window chrome
head -80 src/components/desktop/Window.tsx
```

Document:
- Color palette (Panther Aqua blues, brushed metal grays, pinstripe)
- Typography scale (font families, sizes, weights)
- Window chrome conventions (title bar, buttons, borders, shadows)
- Spacing patterns
- Border radius conventions (Panther used ~5px corners on windows)
- Shadow conventions

### Step 2: Audit each component by reading the code

For each component, check:

**A. Panther Authenticity**
- Window chrome matches Mac OS X 10.3 style (brushed metal gradient, traffic light buttons)
- Buttons look like Aqua gel buttons where appropriate
- Scrollbars, form inputs, and dropdowns have Panther styling
- Icon sizes are consistent (32×32 for desktop, 48×48 for dock)
- Menu bar has the correct semi-transparent Aqua look

**B. Spacing & Alignment**
- Consistent padding/margin between sections
- Content containers have consistent max-width within windows
- Vertical rhythm — consistent spacing between headings, paragraphs, cards
- Window content has appropriate padding from chrome

**C. Color & Contrast**
- Text on background meets WCAG AA (4.5:1 for body text, 3:1 for large text)
- Muted/secondary text is still readable
- Interactive elements have distinct colors from static text
- Hover states have visible color change
- Focus rings visible on all interactive elements (keyboard accessibility)

**D. Typography**
- Font sizes follow a consistent scale
- Line heights appropriate for readability (1.5–1.75 for body, 1.2–1.3 for headings)
- Font weights used consistently
- No text truncation without ellipsis or tooltip
- Long content doesn't overflow window boundaries

**E. Responsive Design**
- Desktop view (>1024px): Full Panther desktop experience
- Tablet (768–1024px): Functional but possibly simplified
- Mobile (<768px): MobileView.tsx takes over — check this works well
- No horizontal scroll at any viewport width
- Touch targets are at least 44×44px on mobile
- Video backgrounds handle mobile gracefully (poster fallback)

**F. Component Consistency**
- All buttons within apps follow the same sizing/padding pattern
- Cards have consistent border radius, shadow, padding
- Form inputs have consistent height, border, focus style
- Icons are same size within context
- Loading states and skeletons exist and match layout

**G. Animations & Transitions**
- Hover transitions are smooth (150–300ms, ease-in-out)
- Window open/close/minimize animations
- Dock magnification is smooth
- Boot sequence animation works correctly
- Theme crossfade transitions (700ms opacity)
- Reduced-motion preference respected (`prefers-reduced-motion`)

**H. Desktop Shell**
- Desktop icons align to grid properly
- Dock items are evenly spaced and magnify correctly
- Menu bar dropdowns align correctly
- Right-click context menu (if exists) is styled consistently
- Floating stickies are draggable and don't overlap badly on load

### Step 3: Create the fix list

For each issue:
```
FILE: src/components/desktop/Window.tsx
LINE: 15
ISSUE: Title bar text truncation on narrow windows — no ellipsis
FIX: Add truncate class and max-width to window title
```

---

## Wave 1 — Global Fixes (Apply Once, Fix Everywhere)

### 1. Global CSS / Tailwind Config

- Fix color contrast issues
- Standardize spacing tokens
- Add missing focus-visible styles
- Add reduced-motion media query if missing
- Fix any global typography inconsistencies

**Commit:** `fix(ui): global theme fixes — contrast, spacing, focus styles`

### 2. Desktop Shell Components

Fix components used everywhere:
- Window.tsx (chrome, drag handle, resize handle, traffic lights)
- MenuBar.tsx (dropdown alignment, active states)
- Dock.tsx (magnification, icon sizing, tooltip positioning)
- Desktop.tsx (icon grid, selection, background)
- FloatingStickies.tsx (note sizing, drag behavior, color)

**Commit:** `fix(ui): polish desktop shell — windows, dock, menu bar`

### 3. App Components

Fix the interior of each app window:
- AboutApp, ContactApp, GuestbookApp, ProjectsApp
- TerminalApp (monospace sizing, cursor blink)
- StickiesApp, SettingsApp
- InstagramApp, SoundCloudPlayer, YouTubeWinampPlayer
- BrowserApp, RecipeViewer, MarkdownViewer

**Commit:** `fix(ui): polish app interiors — buttons, cards, inputs, tables`

---

## Wave 2 — Static Page Routes

Check each static page route for visual consistency:

```bash
find src/app -name "page.tsx" -type f | sort
```

- `/` — main desktop (should render DesktopShell)
- `/about` — static about page
- `/work` — static work page
- `/contact` — static contact page
- `/writing` — static writing page
- `/gate` — admin login page
- `/privacy` — privacy policy

Each static page should have consistent layout, spacing, and typography via StaticPageLayout.tsx.

**Commit:** `fix(ui): polish static page routes — layout, typography, spacing`

---

## Wave 3 — Responsive + Mobile QA

After all fixes, do a full responsive sweep:

```bash
# Check for common responsive issues in code
grep -rn "overflow-hidden\|overflow-x\|whitespace-nowrap\|truncate" src/ --include="*.tsx" | head -30

# Check for hardcoded widths that might break on mobile
grep -rn 'w-\[.*px\]\|width:.*px\|min-w-\[' src/ --include="*.tsx" | head -30

# Check MobileView component
cat src/components/desktop/MobileView.tsx | head -60
```

- MobileView.tsx provides mobile fallback — verify it covers all apps
- Verify dock is usable on mobile
- Verify menu bar works on mobile
- Video backgrounds use mobilePoster on mobile

**Commit:** `fix(ui): responsive fixes — mobile layout, overflow, touch targets`

---

## Gate Check

```bash
npx tsc --noEmit
npm run build
```

**Verification checklist:**
- [ ] All text meets WCAG AA contrast ratios
- [ ] All interactive elements have visible focus states
- [ ] Buttons and inputs have consistent sizing
- [ ] Spacing follows a consistent scale
- [ ] No horizontal scroll at any viewport width (320px–2560px)
- [ ] Window chrome is consistent across all apps
- [ ] Dock magnification works smoothly
- [ ] Video backgrounds crossfade correctly
- [ ] MobileView works for all apps
- [ ] Boot sequence animation is smooth
- [ ] Typography scale is consistent across all components
- [ ] Build succeeds with zero errors
