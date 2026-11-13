// FILE SYSTEM DATA MODEL
import { recipes } from "@/content/recipes/index";

export type FSItemType = "folder" | "app" | "document" | "link";

export interface FSItem {
  id: string;
  name: string;
  /** Shorter label for tight spots such as the phone springboard. */
  shortName?: string;
  type: FSItemType;
  icon: string;
  children?: FSItem[];
  contentPath?: string;
  appComponent?: string;
  href?: string;
  description?: string;
  staticRoute?: string;
  defaultSize?: { width: number; height: number };
  hidden?: boolean;
  /** Ids of items elsewhere in the tree to also pin on this folder's board */
  pins?: string[];
}

export const fileSystem: FSItem[] = [
  // Main sections. This list drives the desktop, the phone springboard,
  // the File > Open menu and Spotlight.
  { id: "start-here", name: "Start Here", type: "app", icon: "Sparkles", appComponent: "StartHereApp", description: "A quick tour of the site.", defaultSize: { width: 560, height: 600 }, children: [
    { id: "readme", name: "README", type: "document", icon: "FileText", contentPath: "readme.md", description: "Welcome to matthewrmckenzie.com.", defaultSize: { width: 560, height: 480 } },
    { id: "linkedin", name: "LinkedIn", type: "link", icon: "Linkedin", href: "https://www.linkedin.com/in/mrmckenzie/", description: "Connect on LinkedIn." },
    { id: "github", name: "GitHub", type: "link", icon: "Github", href: "https://github.com/atthewm", description: "My GitHub profile." },
  ]},
  { id: "about", name: "About", type: "app", icon: "User", appComponent: "AboutApp", contentPath: "about.md", staticRoute: "/about", description: "About Matthew McKenzie.", defaultSize: { width: 640, height: 560 } },
  { id: "work", name: "Work", type: "folder", icon: "Briefcase", staticRoute: "/work", description: "Capital formation, experience, and resume.", pins: ["about", "card", "contact", "schedule", "linkedin"], children: [
    { id: "work-overview", name: "Work Overview", type: "app", icon: "Briefcase", appComponent: "WorkOverviewApp", contentPath: "work.md", description: "Capital formation at Menlo Equities and prior experience.", defaultSize: { width: 640, height: 600 } },
    { id: "resume", name: "Resume", type: "app", icon: "FileText", appComponent: "ResumeApp", contentPath: "resume.md", description: "Professional resume and experience.", defaultSize: { width: 580, height: 640 } },
    { id: "capital-formation-overview", name: "Capital Formation Overview.pdf", type: "link", icon: "FileText", href: "/Matthew_McKenzie_Capital_Formation_Overview.pdf", description: "One page capital formation overview (PDF)." },
    { id: "working-with", name: "Working With Matthew.pdf", type: "link", icon: "FileText", href: "/Matthew_McKenzie_Working_With.pdf", description: "How I work with partners (PDF)." },
  ]},
  { id: "health", name: "Health", type: "folder", icon: "Heart", staticRoute: "/health", description: "Training, recovery, sleep, and nutrition.", children: [
    { id: "health-overview", name: "Overview", type: "document", icon: "FileText", contentPath: "health.md", description: "How I train, recover, and eat.", defaultSize: { width: 600, height: 560 } },
    { id: "life", name: "Life", type: "app", icon: "Activity", appComponent: "LifeDashboardApp", description: "Health and diet dashboard: what I eat, calories burned, and workouts.", defaultSize: { width: 560, height: 720 } },
    { id: "whoop-dashboard", name: "WHOOP Dashboard", type: "app", icon: "Activity", appComponent: "WhoopDashboardApp", description: "Strain, recovery, and sleep from WHOOP.", defaultSize: { width: 520, height: 640 } },
    { id: "nutrition", name: "Nutrition", type: "app", icon: "Activity", appComponent: "NutritionApp", description: "Daily macros, targets, and streaks, synced from Notion.", defaultSize: { width: 560, height: 680 } },
    { id: "top-foods", name: "Top Foods", type: "app", icon: "Trophy", appComponent: "TopFoodsApp", description: "The foods I log most, with average macros per serving.", defaultSize: { width: 620, height: 620 } },
    { id: "whoop-splits", name: "WHOOP Splits", type: "folder", icon: "FolderHeart", description: "Strength Trainer workout splits.", children: [
      { id: "whoop-split-arms-abs", name: "GunsAndGuts.whoop", type: "app", icon: "Dumbbell", appComponent: "WhoopSplitApp", description: "Arms and abs split.", defaultSize: { width: 380, height: 480 } },
      { id: "whoop-split-back", name: "BatCaveBack.whoop", type: "app", icon: "Dumbbell", appComponent: "WhoopSplitApp", description: "Back split.", defaultSize: { width: 380, height: 480 } },
      { id: "whoop-split-chest", name: "ChestDayLikeIts2009.whoop", type: "app", icon: "Dumbbell", appComponent: "WhoopSplitApp", description: "Chest split.", defaultSize: { width: 380, height: 480 } },
      { id: "whoop-split-legs", name: "LegsOfRegret.whoop", type: "app", icon: "Dumbbell", appComponent: "WhoopSplitApp", description: "Legs split.", defaultSize: { width: 380, height: 480 } },
      { id: "whoop-split-shoulders", name: "BoulderProtocol.whoop", type: "app", icon: "Dumbbell", appComponent: "WhoopSplitApp", description: "Shoulders split.", defaultSize: { width: 380, height: 480 } },
    ]},
    { id: "get-whoop", name: "Get WHOOP", type: "app", icon: "ExternalLink", appComponent: "GetWhoopApp", description: "Try WHOOP with a referral link.", defaultSize: { width: 340, height: 440 } },
  ]},
  { id: "recipes", name: "Recipes", type: "folder", icon: "UtensilsCrossed", staticRoute: "/recipes", description: "Cooking and baking: sourdough, family recipe cards, and high protein cooking.", children: recipes.map((r) => ({
    id: r.slug,
    name: r.title,
    type: "app" as const,
    icon: "FileText",
    appComponent: "RecipeViewer",
    contentPath: r.filePath,
    staticRoute: `/recipes/${r.slug}`,
    description: r.subtitle,
    defaultSize: { width: 620, height: 680 },
  })) },
  { id: "food-room", name: "Food Room", type: "app", icon: "Utensils", appComponent: "FoodRoomApp", staticRoute: "/food-room", description: "The foods I eat most, as characters on a table.", defaultSize: { width: 860, height: 640 } },
  { id: "hobbies", name: "Hobbies", type: "app", icon: "Trophy", appComponent: "HobbiesApp", staticRoute: "/hobbies", description: "Training, tennis, cooking, DJing, photography and Rematch.", defaultSize: { width: 580, height: 660 } },
  { id: "turntable", name: "Turntable", type: "app", icon: "Disc3", appComponent: "TurntableApp", description: "My Apple Music playlists on a turntable.", defaultSize: { width: 720, height: 600 } },
  { id: "contact", name: "Contact", type: "app", icon: "Mail", appComponent: "ContactApp", staticRoute: "/contact", description: "Get in touch.", defaultSize: { width: 500, height: 560 } },
  { id: "card", name: "Business Card", shortName: "Card", type: "app", icon: "Contact", appComponent: "BusinessCardApp", staticRoute: "/card", description: "Digital business card. Save contact, call, or email.", defaultSize: { width: 400, height: 640 } },
  { id: "linktree", name: "Links", type: "app", icon: "Link", appComponent: "LinktreeApp", description: "All links in one place.", defaultSize: { width: 420, height: 620 } },
  { id: "now", name: "Now", type: "document", icon: "Zap", contentPath: "now.md", staticRoute: "/now", description: "What I'm up to right now.", defaultSize: { width: 520, height: 460 } },
  { id: "more", name: "More", type: "folder", icon: "Folder", description: "Music, photos, media, games, and desktop extras.", children: [
    { id: "photos", name: "Photos", type: "app", icon: "Image", appComponent: "InstagramApp", description: "Photos currently mirror Instagram.", defaultSize: { width: 480, height: 560 } },
    { id: "music", name: "Music", type: "app", icon: "Headphones", appComponent: "SoundCloudPlayer", description: "SoundCloud player.", defaultSize: { width: 420, height: 500 } },
    { id: "videos", name: "Zune", type: "app", icon: "Music", appComponent: "ZunePlayer", description: "Zune style music player.", defaultSize: { width: 380, height: 560 } },
    { id: "apple-music", name: "Apple Music", type: "app", icon: "ListMusic", appComponent: "AppleMusicFolder", description: "Apple Music playlists.", defaultSize: { width: 480, height: 420 } },
    { id: "media", name: "Media", type: "folder", icon: "Image", description: "Films, TV, and audiobooks synced from my Notion Media Library.", children: [
      { id: "media-movies", name: "Movies", type: "app", icon: "Disc3", appComponent: "MediaShelfApp", description: "Films I've watched, rated, and queued.", defaultSize: { width: 660, height: 600 } },
      { id: "media-tv", name: "TV Shows", type: "app", icon: "Image", appComponent: "MediaShelfApp", description: "TV I'm watching and recommend.", defaultSize: { width: 660, height: 600 } },
      { id: "media-audiobooks", name: "Audiobooks", type: "app", icon: "Headphones", appComponent: "MediaShelfApp", description: "Recent Audible listens and ratings.", defaultSize: { width: 660, height: 600 } },
    ]},
    { id: "guestbook", name: "Guestbook", type: "app", icon: "BookOpen", appComponent: "GuestbookApp", description: "Sign the guestbook.", defaultSize: { width: 560, height: 500 } },
    { id: "ichat", name: "iChat", type: "app", icon: "MessageSquare", appComponent: "IChatApp", description: "Ask a question about Matthew.", defaultSize: { width: 400, height: 500 } },
    { id: "photo-booth", name: "Photo Booth", type: "app", icon: "Camera", appComponent: "PhotoBoothApp", description: "Take retro photos with effects.", defaultSize: { width: 520, height: 480 } },
    { id: "chess", name: "Chess", type: "app", icon: "Crown", appComponent: "ChessApp", description: "Classic chess against the computer.", defaultSize: { width: 480, height: 560 } },
    { id: "minesweeper", name: "Minesweeper", type: "app", icon: "Grid3X3", appComponent: "MinesweeperApp", description: "Classic minesweeper puzzle game.", defaultSize: { width: 420, height: 480 } },
    { id: "terminal", name: "Terminal", type: "app", icon: "Terminal", appComponent: "TerminalApp", description: "Command line interface.", defaultSize: { width: 640, height: 420 } },
    { id: "stickies", name: "Stickies", type: "app", icon: "StickyNote", appComponent: "StickiesApp", description: "Sticky notes for quick thoughts.", defaultSize: { width: 520, height: 400 } },
    { id: "browser", name: "Browser", type: "app", icon: "Globe", appComponent: "BrowserApp", description: "In-OS web browser.", defaultSize: { width: 800, height: 600 } },
    { id: "whats-new", name: "What's New", type: "app", icon: "Sparkles", appComponent: "WhatsNewApp", description: "Changelog and release history for McKenzie OS.", defaultSize: { width: 460, height: 560 } },
    { id: "schedule", name: "Schedule", type: "app", icon: "Calendar", appComponent: "ScheduleApp", description: "Book a meeting.", defaultSize: { width: 800, height: 600 } },
  ]},
  { id: "settings", name: "Settings", type: "app", icon: "Settings", appComponent: "SettingsApp", description: "Appearance, sound, and typography settings.", defaultSize: { width: 440, height: 560 } },
  // Hidden items
  { id: "writing", name: "Writing", type: "folder", icon: "PenTool", staticRoute: "/writing", hidden: true, description: "Essays, notes, and long form writing.", children: [
    { id: "essays", name: "Essays", type: "document", icon: "BookOpen", description: "Collected essays and reflections.", defaultSize: { width: 640, height: 560 } },
  ]},
  { id: "secrets", name: "Secrets", type: "folder", icon: "Lock", hidden: true, description: "You found the hidden folder.", children: [
    { id: "secrets-readme", name: "README", type: "document", icon: "FileText", contentPath: "secrets-readme.md", description: "Secrets of McKenzie OS.", defaultSize: { width: 480, height: 400 } },
  ]},
];

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

export function getRootItems(showHidden = false): FSItem[] {
  if (showHidden) return fileSystem;
  return fileSystem.filter((item) => !item.hidden);
}

// ---------------------------------------------------------------------------
// Dock items - defines what appears in the bottom dock and in what order.
// Each entry is an fsItem id. A "|" string represents a visual separator.
// ---------------------------------------------------------------------------

export const dockItemIds: (string | "|")[] = [
  "start-here",
  "about",
  "work",
  "|",
  "health",
  "recipes",
  "food-room",
  "hobbies",
  "|",
  "turntable",
  "contact",
  "card",
  "linktree",
  "|",
  "more",
  "settings",
];

/** Desktop icons, laid out from the top right corner, down then left. */
export const desktopIconIds: string[] = [
  "now",
  "work",
  "health",
  "recipes",
  "food-room",
  "turntable",
  "apple-music",
  "chess",
  "photo-booth",
  "terminal",
];
