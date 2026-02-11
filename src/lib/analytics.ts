// ============================================================================
// ANALYTICS PLACEHOLDER
// ============================================================================
// Stub for analytics. Wire up your preferred service (Vercel Analytics,
// Plausible, PostHog, etc.) by replacing these functions.
// ============================================================================

export function trackPageView(path: string) {
  if (typeof window === "undefined") return;
  // TODO: Send to your analytics service
  if (process.env.NODE_ENV === "development") {
    console.log(`[analytics] pageview: ${path}`);
  }
}

export function trackEvent(name: string, data?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  // TODO: Send to your analytics service
  if (process.env.NODE_ENV === "development") {
    console.log(`[analytics] event: ${name}`, data);
  }
}
