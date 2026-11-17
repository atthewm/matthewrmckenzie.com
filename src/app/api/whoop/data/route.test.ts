import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@/lib/whoop/client", () => ({ fetchDashboardData: vi.fn() }));

import { GET } from "./route";
import { fetchDashboardData, type WhoopDashboardData } from "@/lib/whoop/client";
import { OWNER_COOKIE, ownerCookieValue } from "@/lib/owner";

const OWNER_SECRET = "owner-secret-owner-secret-owner-secret-00";

/** A full WHOOP payload with made-up values in every private field. */
const FULL = {
  connected: true,
  lastSynced: "2026-11-17T11:00:00.000Z",
  profile: { user_id: 987654, email: "private@example.com", first_name: "Matthew", last_name: "McKenzie" },
  bodyMeasurement: { height_meter: 1.83, weight_kilogram: 81.6, max_heart_rate: 183 },
  latestRecovery: {
    cycle_id: 111,
    sleep_id: 222,
    user_id: 987654,
    score_state: "SCORED",
    score: { user_calibrating: false, recovery_score: 71, resting_heart_rate: 44, hrv_rmssd_milli: 61.5, spo2_percentage: 97.2, skin_temp_celsius: 33.9 },
  },
  latestCycle: {
    id: 111,
    user_id: 987654,
    start: "2026-11-17T05:30:00.000Z",
    end: null,
    score_state: "SCORED",
    score: { strain: 12.4, kilojoule: 9000, average_heart_rate: 62, max_heart_rate: 151 },
  },
  latestSleep: {
    id: 222,
    user_id: 987654,
    start: "2026-11-16T04:10:00.000Z",
    end: "2026-11-16T11:40:00.000Z",
    score_state: "SCORED",
    nap: false,
    score: {
      stage_summary: {
        total_in_bed_time_milli: 27000000,
        total_awake_time_milli: 1800000,
        total_no_data_time_milli: 0,
        total_light_sleep_time_milli: 12000000,
        total_slow_wave_sleep_time_milli: 6000000,
        total_rem_sleep_time_milli: 7200000,
        sleep_cycle_count: 5,
        disturbance_count: 9,
      },
      sleep_needed: { baseline_milli: 27500000, need_from_sleep_debt_milli: 600000, need_from_recent_strain_milli: 300000, need_from_recent_nap_milli: 0 },
      respiratory_rate: 14.8,
      sleep_performance_percentage: 88,
      sleep_consistency_percentage: 79,
      sleep_efficiency_percentage: 93,
    },
  },
  recentWorkouts: [
    {
      id: 333,
      user_id: 987654,
      start: "2026-11-17T01:15:00.000Z",
      end: "2026-11-17T02:05:00.000Z",
      timezone_offset: "-06:00",
      sport_id: 45,
      score_state: "SCORED",
      score: { strain: 9.8, average_heart_rate: 128, max_heart_rate: 171, kilojoule: 1900, percent_recorded: 100 },
    },
  ],
} as unknown as WhoopDashboardData;

function get(path: string, cookie?: string): Request {
  return new Request(`https://matthewrmckenzie.com${path}`, { headers: cookie ? { cookie } : {} });
}

const ownerCookie = () => `${OWNER_COOKIE}=${ownerCookieValue()}`;

beforeEach(() => {
  vi.stubEnv("OWNER_COOKIE_SECRET", OWNER_SECRET);
  vi.stubEnv("WHOOP_ENCRYPTION_KEY", "");
  vi.mocked(fetchDashboardData).mockReset();
  vi.mocked(fetchDashboardData).mockResolvedValue(FULL);
});

describe("GET /api/whoop/data (public view)", () => {
  test("serves the headline scores only", async () => {
    const response = await GET(get("/api/whoop/data"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      connected: true,
      scope: "public",
      lastSynced: "2026-11-17T11:00:00.000Z",
      profile: null,
      bodyMeasurement: null,
      latestRecovery: { score: { recovery_score: 71 } },
      latestCycle: { score: { strain: 12.4, kilojoule: 9000 } },
      latestSleep: { score: { sleep_performance_percentage: 88 } },
      recentWorkouts: [{ id: 0, day: "2026-11-16", score: { strain: 9.8, kilojoule: 1900 } }],
    });
  });

  test("leaks no private value anywhere in the body", async () => {
    const body = await (await GET(get("/api/whoop/data"))).text();
    for (const secret of ["private@example.com", "987654", "Matthew", "81.6", "1.83", "33.9", "97.2", "61.5", "14.8", "27000000", "T01:15", "T04:10", "\"44\"", ":44,", "171", "151", "183"]) {
      expect(body, secret).not.toContain(secret);
    }
  });

  test("carries the public cache header", async () => {
    const response = await GET(get("/api/whoop/data"));
    expect(response.headers.get("cache-control")).toBe("public, s-maxage=900, stale-while-revalidate=3600");
  });

  test("stays public even for the owner, so the cached copy is safe for everyone", async () => {
    const response = await GET(get("/api/whoop/data", ownerCookie()));
    const body = await response.json();
    expect(body.scope).toBe("public");
    expect(body.profile).toBeNull();
    expect(response.headers.get("cache-control")).toBe("public, s-maxage=900, stale-while-revalidate=3600");
  });

  test("says so when WHOOP is not connected", async () => {
    vi.mocked(fetchDashboardData).mockResolvedValue({ connected: false });
    const response = await GET(get("/api/whoop/data"));
    expect(await response.json()).toEqual({ connected: false });
  });

  test("does not cache a failure or echo its detail", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(fetchDashboardData).mockRejectedValue(new Error("Missing required environment variable: KV_REST_API_TOKEN"));

    const response = await GET(get("/api/whoop/data"));

    expect(response.status).toBe(500);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(await response.json()).toEqual({ connected: false, error: "WHOOP data is unavailable" });
  });
});

describe("GET /api/whoop/data?scope=owner", () => {
  test("is refused without the owner cookie, before WHOOP is asked", async () => {
    for (const cookie of [undefined, `${OWNER_COOKIE}=guess`, `${OWNER_COOKIE}=`, "mckenzie_auth=0123456789abcdef0123456789abcdef"]) {
      const response = await GET(get("/api/whoop/data?scope=owner", cookie));
      expect(response.status, cookie).toBe(403);
      expect(response.headers.get("cache-control")).toBe("private, no-store");
    }
    expect(fetchDashboardData).not.toHaveBeenCalled();
  });

  test("is refused for everyone when no owner secret is configured", async () => {
    vi.stubEnv("OWNER_COOKIE_SECRET", "");
    const response = await GET(get("/api/whoop/data?scope=owner", `${OWNER_COOKIE}=anything`));
    expect(response.status).toBe(403);
  });

  test("gives the owner the full payload and is never cached", async () => {
    const response = await GET(get("/api/whoop/data?scope=owner", ownerCookie()));

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(await response.json()).toEqual(JSON.parse(JSON.stringify(FULL)));
  });
});
