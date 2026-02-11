# matthewrmckenzie.com

Personal website built as a web-based desktop OS experience. Draggable/resizable windows, folder structures, desktop icons, dock, and theme switching — all running on Next.js.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Vercel will auto-detect Next.js. No special config needed.
4. Add your custom domain (`matthewrmckenzie.com`) in the Vercel dashboard under **Settings → Domains**.
5. Done. Vercel handles builds, preview deploys, and SSL.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Desktop experience (home route)
│   ├── layout.tsx          # Root layout with metadata
│   ├── globals.css         # Theme variables + base styles
│   ├── robots.ts           # SEO robots.txt
│   ├── sitemap.ts          # SEO sitemap
│   ├── not-found.tsx       # 404 page
│   ├── about/page.tsx      # Static /about route
│   ├── work/page.tsx       # Static /work route
│   ├── projects/page.tsx   # Static /projects route
│   ├── writing/page.tsx    # Static /writing route
│   └── contact/page.tsx    # Static /contact route
├── components/
│   ├── desktop/            # Desktop OS UI system
│   │   ├── Desktop.tsx     # Main desktop with wallpaper + icons
│   │   ├── DesktopIcon.tsx # Desktop icon component
│   │   ├── DesktopProvider.tsx # State provider + hydration
│   │   ├── DesktopShell.tsx    # Responsive wrapper (desktop vs mobile)
│   │   ├── Dock.tsx        # Taskbar/dock for open windows
│   │   ├── MenuBar.tsx     # Top menu bar with clock + theme
│   │   ├── MobileView.tsx  # Mobile-optimized layout
│   │   ├── Window.tsx      # Draggable/resizable window
│   │   ├── WindowContent.tsx   # Content resolver for windows
│   │   └── WindowManager.tsx   # Renders all open windows
│   ├── apps/               # App components rendered inside windows
│   │   ├── AboutApp.tsx
│   │   ├── ContactApp.tsx
│   │   ├── FolderView.tsx
│   │   ├── GalleryApp.tsx
│   │   ├── MarkdownViewer.tsx
│   │   └── ProjectsApp.tsx
│   └── ui/
│       └── StaticPageLayout.tsx  # Shared layout for static routes
├── content/                # Markdown content files (single source of truth)
│   ├── about.md
│   ├── contact.md
│   ├── essays.md
│   ├── projects.md
│   ├── readme.md
│   ├── resume.md
│   ├── work.md
│   └── writing.md
├── data/
│   └── fs.ts               # File system tree definition
├── hooks/
│   ├── useDesktopStore.ts  # State management (context + reducer)
│   └── useKeyboardShortcuts.ts
└── lib/
    ├── analytics.ts        # Analytics placeholder
    └── content.ts          # Markdown content loader
```

## How to Add Content

### Add a new document

1. Create a markdown file in `src/content/my-doc.md`.
2. Add an entry to the file system tree in `src/data/fs.ts`:

```ts
{
  id: "my-doc",
  name: "My Document",
  type: "document",
  icon: "FileText",        // Any lucide-react icon name
  contentPath: "my-doc.md",
  description: "A brief description.",
  defaultSize: { width: 600, height: 450 },
}
```

3. If you want a static route, add `staticRoute: "/my-doc"` and create `src/app/my-doc/page.tsx`.

### Add a new app (custom component)

1. Create a component in `src/components/apps/MyApp.tsx`.
2. Register it in `src/components/desktop/WindowContent.tsx` in the `appComponents` map.
3. Add an entry in `src/data/fs.ts` with `type: "app"` and `appComponent: "MyApp"`.

### Add a new folder

Add an entry in `src/data/fs.ts` with `type: "folder"` and a `children` array.

### Add external links

Add an entry in `src/data/fs.ts` with `type: "link"` and an `href` URL.

## Customization

### Change wallpaper

Edit the gradient in `src/components/desktop/Desktop.tsx` — look for the "Wallpaper background" comment. You can use any CSS gradient, image, or combination.

### Change theme colors

Edit the CSS variables in `src/app/globals.css` under `:root` (light) and `.dark` (dark).

### Change icons

Icons come from [lucide-react](https://lucide.dev/icons). Set the `icon` property in `fs.ts` to any icon name.

### Change typography

Edit the font imports in `globals.css` and the `fontFamily` config in `tailwind.config.ts`.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Esc` | Close focused window |
| `Cmd/Ctrl + W` | Close focused window |
| `Cmd/Ctrl + M` | Minimize focused window |
| Double-click title bar | Toggle maximize |

## Architecture Notes

- **Server/client split**: The home page is a server component that pre-loads all markdown content, then passes it to the client-side desktop shell. This means content is available immediately without client-side fetching.
- **State management**: Uses React Context + useReducer. No external state library needed.
- **Persistence**: Window positions, open windows, and theme preference are saved to localStorage with a 300ms debounce.
- **Drag/resize**: Custom implementation using pointer events. No external drag library.
- **Mobile**: Detects viewport width and switches to a simplified launcher + full-screen card navigation.
- **Static routes**: Share the same markdown content as the desktop apps (single source of truth).

## Future Enhancements

- [ ] Spotlight / search (Cmd+Space to search files and content)
- [ ] Right-click context menu
- [ ] Window snap to edges
- [ ] File upload and preview
- [ ] Terminal/command line app
- [ ] Music player widget
- [ ] Blog with individual post routes
- [ ] Image gallery with lightbox
- [ ] Analytics integration (Vercel Analytics, Plausible, etc.)
- [ ] RSS feed for writing
- [ ] OG image generation
- [ ] Animated wallpapers
- [ ] Sound effects

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/) (icons)
- [Remark](https://remark.js.org/) (markdown processing)
- Deployed on [Vercel](https://vercel.com/)
