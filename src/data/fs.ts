// ============================================================================
// FILE SYSTEM DATA MODEL
// ============================================================================
// Single source of truth for all content, folders, and apps.
// To add a new item: add an entry below and create a matching component
// in /src/components/apps/ or content file in /src/content/<id>.md.
// ============================================================================

export type FSItemType = "folder" | "app" | "document" | "link";

export interface FSItem {
  id: string;
  name: string;
  type: FSItemType;
  icon: string;
  children?: FSItem[];
  contentPath?: string;
  appComponent?: string;
  href?: string;
  description?: string;
  staticRoute?: string;
  defaultSize?: { width: number; height: number };
}

// ---------------------------------------------------------------------------
// Root file system tree
// ---------------------------------------------------------------------------

export const fileSystem: FSItem[] = [
  {
    id: "about",
    name: "About",
    type: "app",
    icon: "User",
    appComponent: "AboutApp",
    contentPath: "about.md",
    staticRoute: "/about",
    description: "About Matthew McKenzie.",
    defaultSize: { width: 640, height: 520 },
  },
  {
    id: "work",
    name: "Work",
    type: "folder",
    icon: "Briefcase",
    staticRoute: "/work",
    description: "Professional work, projects, and case studies.",
    children: [
      {
        id: "projects",
        name: "Projects",
        type: "app",
        icon: "Layers",
        appComponent: "ProjectsApp",
        contentPath: "projects.md",
        staticRoute: "/projects",
        description: "Selected projects and case studies.",
        defaultSize: { width: 720, height: 560 },
      },
      {
        id: "resume",
        name: "Resume",
        type: "document",
        icon: "FileText",
        contentPath: "resume.md",
        description: "Professional resume and experience.",
        defaultSize: { width: 600, height: 700 },
      },
    ],
  },
  {
    id: "writing",
    name: "Writing",
    type: "folder",
    icon: "PenTool",
    staticRoute: "/writing",
    description: "Essays, notes, and long-form writing.",
    children: [
      {
        id: "essays",
        name: "Essays",
        type: "document",
        icon: "BookOpen",
        contentPath: "essays.md",
        description: "Collected essays and reflections.",
        defaultSize: { width: 640, height: 560 },
      },
    ],
  },
  {
    id: "photos",
    name: "Photos",
    type: "folder",
    icon: "Image",
    description: "Photography and visual work.",
    children: [
      {
        id: "gallery",
        name: "Gallery",
        type: "app",
        icon: "GalleryHorizontalEnd",
        appComponent: "GalleryApp",
        description: "Photo gallery.",
        defaultSize: { width: 800, height: 600 },
      },
    ],
  },
  {
    id: "music",
    name: "Music",
    type: "app",
    icon: "Headphones",
    appComponent: "SoundCloudPlayer",
    description: "SoundCloud player.",
    defaultSize: { width: 420, height: 500 },
  },
  {
    id: "videos",
    name: "Videos",
    type: "app",
    icon: "Disc3",
    appComponent: "YouTubeWinampPlayer",
    description: "YouTube playlist player.",
    defaultSize: { width: 320, height: 360 },
  },
  {
    id: "apple-music",
    name: "Apple Music",
    type: "app",
    icon: "ListMusic",
    appComponent: "AppleMusicFolder",
    description: "Apple Music playlists.",
    defaultSize: { width: 480, height: 420 },
  },
  {
    id: "contact",
    name: "Contact",
    type: "app",
    icon: "Mail",
    appComponent: "ContactApp",
    contentPath: "contact.md",
    staticRoute: "/contact",
    description: "Get in touch.",
    defaultSize: { width: 480, height: 400 },
  },
  {
    id: "settings",
    name: "Settings",
    type: "app",
    icon: "Settings",
    appComponent: "SettingsApp",
    description: "Appearance, sound, and typography settings.",
    defaultSize: { width: 420, height: 540 },
  },
  {
    id: "start-here",
    name: "Start Here",
    type: "folder",
    icon: "Sparkles",
    description: "Welcome! Start here to explore.",
    children: [
      {
        id: "readme",
        name: "README",
        type: "document",
        icon: "FileText",
        contentPath: "readme.md",
        description: "Welcome to matthewrmckenzie.com",
        defaultSize: { width: 560, height: 480 },
      },
      {
        id: "linkedin",
        name: "LinkedIn",
        type: "link",
        icon: "Linkedin",
        href: "https://www.linkedin.com/in/matthewrmckenzie/",
        description: "Connect on LinkedIn.",
      },
      {
        id: "github",
        name: "GitHub",
        type: "link",
        icon: "Github",
        href: "https://github.com/matthewrmckenzie",
        description: "View code on GitHub.",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function flattenFS(items: FSItem[] = fileSystem): FSItem[] {
  const result: FSItem[] = [];
  for (const item of items) {
    result.push(item);
    if (item.children) result.push(...flattenFS(item.children));
  }
  return result;
}

export function findFSItem(id: string, items: FSItem[] = fileSystem): FSItem | undefined {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findFSItem(id, item.children);
      if (found) return found;
    }
  }
  return undefined;
}

export function getStaticRouteItems(): FSItem[] {
  return flattenFS().filter((item) => item.staticRoute);
}

export function getRootItems(): FSItem[] {
  return fileSystem;
}
