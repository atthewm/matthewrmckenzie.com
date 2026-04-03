// ============================================================================
// ANALYTICS — Vercel Analytics + custom event tracking
// ============================================================================
// Uses Vercel Analytics (already loaded via <Analytics /> in layout).
// The track() function sends custom events to Vercel's dashboard.
// ============================================================================

import { track } from "@vercel/analytics/react";

export function trackPageView(path: string) {
  if (typeof window === "undefined") return;
  // Vercel Analytics handles page views automatically via the <Analytics /> component.
  // This function exists for any manual page view tracking needs.
  if (process.env.NODE_ENV === "development") {
    console.log(`[analytics] pageview: ${path}`);
  }
}

export function trackEvent(name: string, data?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    track(name, data as Record<string, string | number | boolean>);
  } catch {
    // Silently fail if analytics is not available
  }
  if (process.env.NODE_ENV === "development") {
    console.log(`[analytics] event: ${name}`, data);
  }
}
