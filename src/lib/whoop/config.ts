// ============================================================================
// WHOOP API CONFIGURATION
// ============================================================================
// All constants for the official WHOOP Developer API OAuth 2.0 flow and
// REST API endpoints. Nothing secret lives here; secrets come from env vars.
// ============================================================================

export const WHOOP_AUTH_URL = "https://api.prod.whoop.com/oauth/oauth2/auth";
export const WHOOP_TOKEN_URL = "https://api.prod.whoop.com/oauth/oauth2/token";
export const WHOOP_API_BASE = "https://api.prod.whoop.com/developer";

// Scopes to request (space-delimited in the auth URL)
export const WHOOP_SCOPES = [
  "offline",
  "read:profile",
  "read:body_measurement",
  "read:recovery",
  "read:cycles",
  "read:workout",
  "read:sleep",
] as const;

// API endpoint paths (relative to WHOOP_API_BASE)
export const WHOOP_ENDPOINTS = {
  profile: "/v1/user/profile/basic",
  bodyMeasurement: "/v1/user/body_measurement",
  cycles: "/v1/cycle",
  cycleRecovery: (cycleId: string) => `/v1/cycle/${cycleId}/recovery`,
  sleep: "/v1/activity/sleep",
  workout: "/v1/activity/workout",
} as const;

// Cache TTL in seconds (1 hour)
export const CACHE_TTL = 3600;

// Token refresh buffer: refresh if token expires in less than 5 minutes
export const TOKEN_REFRESH_BUFFER_SECONDS = 300;

// Helper to get env vars with validation
export function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
