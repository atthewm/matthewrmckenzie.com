// FILE SYSTEM DATA MODEL
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

export const fileSystem: FSItem[] = [
  { id: "about", name: "About", type: "app", icon: "User", appComponent: "AboutApp", contentPath: "about.md", staticRoute: "/about", description: "About Matthew McKenzie.", defaultSize: { width: 640, height: 520 } },
  { id: "work", name: "Work", type: "folder", icon: "Briefcase", staticRoute: "/work", description: "Professional work, projects, and case studies.", children: [
    { id: "projects", name: "Projects", type: "app", icon: "Layers", appComponent: "ProjectsApp", contentPath: "projects.md", staticRoute: "/projects", description: "Selected projects and case studies.", defaultSize: { width: 720, height: 560 } },
    { id: "resume", name: "Resume", type: "app", icon: "FileText", appComponent: "ResumeApp", description: "Professional resume and experience.", defaultSize: { width: 560, height: 640 } },
  ]},
  { id: "writing", name: "Writing", type: "folder", icon: "PenTool", staticRoute: "/writing", description: "Essays, notes, and long-form writing.", children: [
    { id: "essays", name: "Essays", type: "document", icon: "BookOpen", contentPath: "essays.md", description: "Collected essays and reflections.", defaultSize: { width: 640, height: 560 } },
  ]},
  { id: "photos", name: "Photos", type: "app", icon: "Image", appComponent: "InstagramApp", description: "Photos currently mirror Instagram.", defaultSize: { width: 480, height: 560 } },
  { id: "music", name: "Music", type: "app", icon: "Headphones", appComponent: "SoundCloudPlayer", description: "SoundCloud player.", defaultSize: { width: 420, height: 500 } },
  { id: "videos", name: "Videos", type: "app", icon: "Disc3", appComponent: "YouTubeWinampPlayer", description: "YouTube playlist player.", defaultSize: { width: 320, height: 360 } },
  { id: "apple-music", name: "Apple Music", type: "app", icon: "ListMusic", appComponent: "AppleMusicFolder", description: "Apple Music playlists.", defaultSize: { width: 480, height: 420 } },
  { id: "contact", name: "Contact", type: "app", icon: "Mail", appComponent: "ContactApp", contentPath: "contact.md", staticRoute: "/contact", description: "Get in touch.", defaultSize: { width: 480, height: 400 } },
  { id: "health", name: "Health", type: "folder", icon: "Heart", description: "WHOOP health metrics, workout splits, and fitness data.", children: [
    { id: "whoop-dashboard", name: "WHOOP Dashboard", type: "app", icon: "Activity", appComponent: "WhoopDashboardApp", description: "Health and fitness dashboard powered by WHOOP.", defaultSize: { width: 520, height: 640 } },
    { id: "whoop-splits", name: "WHOOP Splits", type: "folder", icon: "FolderHeart", description: "Strength Trainer workout splits.", children: [
      { id: "whoop-split-arms-abs", name: "GunsAndGuts.whoop", type: "app", icon: "Dumbbell", appComponent: "WhoopSplitApp", description: "Arms & Abs split.", defaultSize: { width: 380, height: 480 } },
      { id: "whoop-split-back", name: "BatCaveBack.whoop", type: "app", icon: "Dumbbell", appComponent: "WhoopSplitApp", description: "Back split.", defaultSize: { width: 380, height: 480 } },
      { id: "whoop-split-chest", name: "ChestDayLikeIts2009.whoop", type: "app", icon: "Dumbbell", appComponent: "WhoopSplitApp", description: "Chest split.", defaultSize: { width: 380, height: 480 } },
      { id: "whoop-split-legs", name: "LegsOfRegret.whoop", type: "app", icon: "Dumbbell", appComponent: "WhoopSplitApp", description: "Legs split.", defaultSize: { width: 380, height: 480 } },
      { id: "whoop-split-shoulders", name: "BoulderProtocol.whoop", type: "app", icon: "Dumbbell", appComponent: "WhoopSplitApp", description: "Shoulders split.", defaultSize: { width: 380, height: 480 } },
    ]},
    { id: "get-whoop", name: "Get WHOOP", type: "app", icon: "ExternalLink", appComponent: "GetWhoopApp", description: "Try WHOOP with a referral link.", defaultSize: { width: 340, height: 440 } },
  ]},
  { id: "recipes", name: "Recipes", type: "folder", icon: "UtensilsCrossed", description: "Tried and true recipes from the kitchen.", children: [
    { id: "rye-starter", name: "Rye Starter", type: "app", icon: "FileText", appComponent: "RecipeViewer", contentPath: "recipes/rye-starter.md", description: "6-day rye starter build plus a low-waste daily maintenance plan", defaultSize: { width: 600, height: 640 } },
    { id: "city-loaf-master-recipe", name: "City Loaf Master Recipe", type: "app", icon: "FileText", appComponent: "RecipeViewer", contentPath: "recipes/city-loaf-master-recipe.md", description: "Two 950 g loaves baked in a Dutch oven", defaultSize: { width: 600, height: 640 } },
    { id: "strawberry-jam-honey", name: "Strawberry Jam with Honey", type: "app", icon: "FileText", appComponent: "RecipeViewer", contentPath: "recipes/strawberry-jam-honey.md", description: "No refined sugar, thickened naturally (optional chia)", defaultSize: { width: 600, height: 640 } },
    { id: "cinnamon-protein-overnight-oats", name: "Cinnamon Protein Overnight Oats", type: "app", icon: "FileText", appComponent: "RecipeViewer", contentPath: "recipes/cinnamon-protein-overnight-oats.md", description: "1 serving, thicker texture, revised liquid ratio", defaultSize: { width: 600, height: 640 } },
    { id: "brownies-9x13", name: "Brownies (9x13)", type: "app", icon: "FileText", appComponent: "RecipeViewer", contentPath: "recipes/brownies-9x13.md", description: "Recipe card version, English walnuts", defaultSize: { width: 600, height: 640 } },
    { id: "high-protein-heirloom-blue-corn-tortillas", name: "High-Protein Blue Corn Tortillas", type: "app", icon: "FileText", appComponent: "RecipeViewer", contentPath: "recipes/high-protein-heirloom-blue-corn-tortillas.md", description: "High-protein tortillas using blue corn masa and vital wheat gluten", defaultSize: { width: 600, height: 640 } },
    { id: "mamas-healthy-meatballs", name: "Mama's Healthy Meatballs", type: "app", icon: "FileText", appComponent: "RecipeViewer", contentPath: "recipes/mamas-healthy-meatballs.md", description: "Lean, high-protein meatballs with beef, lamb, and venison", defaultSize: { width: 600, height: 640 } },
    { id: "parmesan-crusted-baked-chicken-tenders", name: "Parmesan Crusted Baked Chicken Tenders", type: "app", icon: "FileText", appComponent: "RecipeViewer", contentPath: "recipes/parmesan-crusted-baked-chicken-tenders.md", description: "Higher-protein baked tenders with Parmesan crust", defaultSize: { width: 600, height: 640 } },
  ]},
  { id: "settings", name: "Settings", type: "app", icon: "Settings", appComponent: "SettingsApp", description: "Appearance, sound, and typography settings.", defaultSize: { width: 420, height: 540 } },
  { id: "browser", name: "Browser", type: "app", icon: "Globe", appComponent: "BrowserApp", description: "In-OS web browser.", defaultSize: { width: 800, height: 600 } },
  { id: "start-here", name: "Start Here", type: "folder", icon: "Sparkles", description: "Welcome! Start here to explore.", children: [
    { id: "readme", name: "README", type: "document", icon: "FileText", contentPath: "readme.md", description: "Welcome to matthewrmckenzie.com", defaultSize: { width: 560, height: 480 } },
    { id: "linkedin", name: "LinkedIn", type: "link", icon: "Linkedin", href: "https://www.linkedin.com/in/mrmckenzie/", description: "Connect on LinkedIn." },
    { id: "github", name: "GitHub", type: "link", icon: "Github", href: "https://github.com/atthewm", description: "View code on GitHub." },
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

export function getRootItems(): FSItem[] {
  return fileSystem;
}

// ---------------------------------------------------------------------------
// Dock items - defines what appears in the bottom dock and in what order.
// Each entry is an fsItem id. A "|" string represents a visual separator.
// ---------------------------------------------------------------------------

export const dockItemIds: (string | "|")[] = [
  "start-here",
  "about",
  "|",
  "work",
  "writing",
  "photos",
  "|",
  "music",
  "videos",
  "apple-music",
  "|",
  "contact",
  "health",
  "recipes",
  "settings",
];
