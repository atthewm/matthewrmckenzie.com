// ============================================================================
// SITE CONFIG
// ============================================================================
// Centralized configuration for external links and site-wide settings.
// ============================================================================

export const siteConfig = {
  domain: "matthewrmckenzie.com",
  notionRecipesUrl:
    process.env.NEXT_PUBLIC_NOTION_RECIPES_URL ||
    "https://www.notion.so/309a53a9b4e6817286f0fa85ef82b389",
  instagram: {
    handle: "mrem",
    url: "https://www.instagram.com/mrem/",
  },
} as const;
