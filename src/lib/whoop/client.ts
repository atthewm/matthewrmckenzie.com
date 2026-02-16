// ============================================================================
// WHOOP API CLIENT
// ============================================================================
// Typed client for the official WHOOP Developer API. All calls are
// server-side only. Includes retry logic with exponential backoff.
// ============================================================================

import { WHOOP_API_BASE, WHOOP_ENDPOINTS, CACHE_TTL } from "./config";
import { getValidAccessToken } from "./tokens";
import { kvGet, kvSet } from "./kv";

// ---------------------------------------------------------------------------
// Response types (based on official WHOOP API v1 schemas)
// ---------------------------------------------------------------------------

export interface WhoopProfile {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export interface WhoopBodyMeasurement {
  height_meter: number;
  weight_kilogram: number;
  max_heart_rate: number;
}

export interface WhoopCycleScore {
  strain: number;
  kilojoule: number;
  average_heart_rate: number;
  max_heart_rate: number;
}

export interface WhoopCycle {
  id: number;
  user_id: number;
  start: string;
  end: string | null;
  score_state: "SCORED" | "PENDING_SCORE" | "UNSCORABLE";
  score?: WhoopCycleScore;
}

export interface WhoopRecoveryScore {
  user_calibrating: boolean;
  recovery_score: number;
  resting_heart_rate: number;
  hrv_rmssd_milli: number;
  spo2_percentage?: number;
  skin_temp_celsius?: number;
}

export interface WhoopRecovery {
  cycle_id: number;
  sleep_id: number;
  user_id: number;
  score_state: "SCORED" | "PENDING_SCORE" | "UNSCORABLE";
  score?: WhoopRecoveryScore;
}

export interface WhoopSleepScore {
  stage_summary: {
    total_in_bed_time_milli: number;
    total_awake_time_milli: number;
    total_no_data_time_milli: number;
    total_light_sleep_time_milli: number;
    total_slow_wave_sleep_time_milli: number;
    total_rem_sleep_time_milli: number;
    sleep_cycle_count: number;
    disturbance_count: number;
  };
  sleep_needed: {
    baseline_milli: number;
    need_from_sleep_debt_milli: number;
    need_from_recent_strain_milli: number;
    need_from_recent_nap_milli: number;
  };
  respiratory_rate?: number;
  sleep_performance_percentage?: number;
  sleep_consistency_percentage?: number;
  sleep_efficiency_percentage?: number;
}

export interface WhoopSleep {
  id: number;
  user_id: number;
  start: string;
  end: string;
  score_state: "SCORED" | "PENDING_SCORE" | "UNSCORABLE";
  score?: WhoopSleepScore;
  nap: boolean;
}

export interface WhoopWorkoutScore {
  strain: number;
  average_heart_rate: number;
  max_heart_rate: number;
  kilojoule: number;
  percent_recorded: number;
  zone_duration?: {
    zone_zero_milli?: number;
    zone_one_milli?: number;
    zone_two_milli?: number;
    zone_three_milli?: number;
    zone_four_milli?: number;
    zone_five_milli?: number;
  };
}

export interface WhoopWorkout {
  id: number;
  user_id: number;
  start: string;
  end: string;
  sport_id: number;
  score_state: "SCORED" | "PENDING_SCORE" | "UNSCORABLE";
  score?: WhoopWorkoutScore;
}

export interface PaginatedResponse<T> {
  records: T[];
  next_token?: string;
}

// ---------------------------------------------------------------------------
// Aggregated dashboard data (what the UI consumes)
// ---------------------------------------------------------------------------

export interface WhoopDashboardData {
  connected: true;
  lastSynced: string; // ISO timestamp
  profile: WhoopProfile | null;
  bodyMeasurement: WhoopBodyMeasurement | null;
  latestRecovery: WhoopRecovery | null;
  latestCycle: WhoopCycle | null;
  latestSleep: WhoopSleep | null;
  recentWorkouts: WhoopWorkout[];
}

export interface WhoopDisconnected {
  connected: false;
}

export type WhoopDataResponse = WhoopDashboardData | WhoopDisconnected;

// ---------------------------------------------------------------------------
// API fetch helper with retry
// ---------------------------------------------------------------------------

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

async function whoopFetch<T>(
  endpoint: string,
  accessToken: string,
  params?: Record<string, string>,
): Promise<T | null> {
  const url = new URL(`${WHOOP_API_BASE}${endpoint}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (res.status === 429) {
        // Rate limited; back off
        const retryAfter = res.headers.get("Retry-After");
        const waitMs = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : RETRY_DELAY_MS * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }

      if (res.status === 404) {
        // Resource not found (e.g. no recovery for current cycle)
        return null;
      }

      if (!res.ok) {
        return null;
      }

      return (await res.json()) as T;
    } catch {
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * Math.pow(2, attempt)));
        continue;
      }
      return null;
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Fetch all dashboard data
// ---------------------------------------------------------------------------

const CACHE_KEY = "whoop:dashboard_cache";

export async function fetchDashboardData(): Promise<WhoopDataResponse> {
  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    return { connected: false };
  }

  // Check cache first
  try {
    const cached = await kvGet(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as WhoopDashboardData;
      // Check if cache is still fresh (within TTL)
      const cacheAge = (Date.now() - new Date(parsed.lastSynced).getTime()) / 1000;
      if (cacheAge < CACHE_TTL) {
        return parsed;
      }
    }
  } catch {
    // Cache miss or parse error, fetch fresh
  }

  // Fetch all data in parallel
  const [profile, bodyMeasurement, cyclesResponse, sleepResponse, workoutsResponse] =
    await Promise.all([
      whoopFetch<WhoopProfile>(WHOOP_ENDPOINTS.profile, accessToken),
      whoopFetch<WhoopBodyMeasurement>(WHOOP_ENDPOINTS.bodyMeasurement, accessToken),
      whoopFetch<PaginatedResponse<WhoopCycle>>(
        WHOOP_ENDPOINTS.cycles,
        accessToken,
        { limit: "1" },
      ),
      whoopFetch<PaginatedResponse<WhoopSleep>>(
        WHOOP_ENDPOINTS.sleep,
        accessToken,
        { limit: "1" },
      ),
      whoopFetch<PaginatedResponse<WhoopWorkout>>(
        WHOOP_ENDPOINTS.workout,
        accessToken,
        { limit: "5" },
      ),
    ]);

  // Get recovery from latest cycle
  let latestRecovery: WhoopRecovery | null = null;
  const latestCycle = cyclesResponse?.records?.[0] ?? null;
  if (latestCycle?.id) {
    latestRecovery = await whoopFetch<WhoopRecovery>(
      WHOOP_ENDPOINTS.cycleRecovery(String(latestCycle.id)),
      accessToken,
    );
  }

  const latestSleep = sleepResponse?.records?.find((s) => !s.nap) ?? null;

  const dashboardData: WhoopDashboardData = {
    connected: true,
    lastSynced: new Date().toISOString(),
    profile,
    bodyMeasurement,
    latestRecovery,
    latestCycle,
    latestSleep,
    recentWorkouts: workoutsResponse?.records ?? [],
  };

  // Cache the result
  try {
    await kvSet(CACHE_KEY, JSON.stringify(dashboardData), CACHE_TTL);
  } catch {
    // Cache write failure is non-fatal
  }

  return dashboardData;
}

/**
 * Clear cached dashboard data (called on disconnect).
 */
export async function clearDashboardCache(): Promise<void> {
  try {
    const { kvDel } = await import("./kv");
    await kvDel(CACHE_KEY);
  } catch {
    // Non-fatal
  }
}
