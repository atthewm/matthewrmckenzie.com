import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@/lib/whoop/client", () => ({ fetchDashboardData: vi.fn() }));

import { GET } from "./route";
import { fetchDashboardData, type WhoopDashboardData } from "@/lib/whoop/client";
import { OWNER_COOKIE, ownerCookieValue } from "@/lib/owner";

const OWNER_SECRET = "owner-secret-owner-secret-owner-secret-00";

/**
 * A full WHOOP payload. Every value is an obvious placeholder (a test name,
 * round numbers), never anyone's real data. The private values are also
 * distinct from the public ones, so the leak test below can tell them apart.
 */
const FULL = {
  connected: true,
  lastSynced: "2026-11-17T11:00:00.000Z",
  profile: { user_id: 1000, email: "test@example.com", first_name: "Test", last_name: "User" },
  bodyMeasurement: { height_meter: 1.5, weight_kilogram: 50, max_heart_rate: 200 },
  latestRecovery: {
    cycle_id: 101,
    sleep_id: 202,
    user_id: 1000,
    score_state: "SCORED",
    score: { user_calibrating: false, recovery_score: 70, resting_heart_rate: 40, hrv_rmssd_milli: 60, spo2_percentage: 95, skin_temp_celsius: 30 },
  },
  latestCycle: {
    id: 101,
    user_id: 1000,
    start: "2026-11-17T05:00:00.000Z",
    end: null,
    score_state: "SCORED",
    score: { strain: 10, kilojoule: 8000, average_heart_rate: 65, max_heart_rate: 150 },
  },
  latestSleep: {
    id: 202,
    user_id: 1000,
    start: "2026-11-16T04:00:00.000Z",
    end: "2026-11-16T12:00:00.000Z",
    score_state: "SCORED",
    nap: false,
    score: {
      stage_summary: {
        total_in_bed_time_milli: 28800000,
        total_awake_time_milli: 1800000,
        total_no_data_time_milli: 0,
        total_light_sleep_time_milli: 14400000,
        total_slow_wave_sleep_time_milli: 5400000,
        total_rem_sleep_time_milli: 7200000,
        sleep_cycle_count: 4,
        disturbance_count: 12,
      },
      sleep_needed: { baseline_milli: 27000000, need_from_sleep_debt_milli: 600000, need_from_recent_strain_milli: 300000, need_from_recent_nap_milli: 0 },
      respiratory_rate: 15,
      sleep_performance_percentage: 90,
      sleep_consistency_percentage: 80,
      sleep_efficiency_percentage: 95,
    },
  },
  recentWorkouts: [
    {
      id: 303,
      user_id: 1000,
      start: "2026-11-17T01:00:00.000Z",
      end: "2026-11-17T02:00:00.000Z",
      timezone_offset: "-06:00",
      sport_id: 1,
      score_state: "SCORED",
      score: { strain: 8, average_heart_rate: 120, max_heart_rate: 170, kilojoule: 2000, percent_recorded: 100 },
    },
  ],
} as unknown as WhoopDashboardData;

/** Every value in the payload that only the owner may see (0 and false are left out: too common). */
const PRIVATE_VALUES: unknown[] = [
  "test@example.com", "Test", "User", 1000, 1.5, 50, 200, 101, 202, 303, 1,
  40, 60, 95, 30, 65, 150, 28800000, 1800000, 14400000, 5400000, 7200000, 4, 12,
  27000000, 600000, 300000, 15, 80, 120, 170, 100,
  "2026-11-17T05:00:00.000Z", "2026-11-16T04:00:00.000Z", "2026-11-16T12:00:00.000Z",
  "2026-11-17T01:00:00.000Z", "2026-11-17T02:00:00.000Z", "-06:00", "SCORED",
];

/** Every leaf value in a parsed JSON body. */
function leaves(value: unknown, into: unknown[] = []): unknown[] {
  if (Array.isArray(value)) value.forEach((v) => leaves(v, into));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => leaves(v, into));
  else into.push(value);
  return into;
}

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
  test("the card view sends only a current Day Strain, with no cache or cycle timestamps", async () => {
    const now = "2026-11-17T18:00:00Z";
    const clock = vi.spyOn(Date, "now").mockReturnValue(Date.parse(now));
    vi.mocked(fetchDashboardData).mockResolvedValue({
      ...FULL,
      lastSynced: now,
      latestCycle: { ...FULL.latestCycle!, updated_at: now, timezone_offset: "-06:00" },
    });
    try {
      const response = await GET(get("/api/whoop/data?view=day-strain"));
      expect(response.headers.get("cache-control")).toBe("private, no-store");
      expect(await response.json()).toEqual({ dayStrain: 10 });
    } finally {
      clock.mockRestore();
    }
  });

  test("the card view hides a stale cycle even when the dashboard has just synced", async () => {
    vi.mocked(fetchDashboardData).mockResolvedValue({ ...FULL, lastSynced: new Date().toISOString() });
    expect(await (await GET(get("/api/whoop/data?view=day-strain"))).json()).toEqual({ dayStrain: null });
  });

  test("an unavailable card reading carries only null and cannot be cached", async () => {
    vi.mocked(fetchDashboardData).mockRejectedValue(new Error("unavailable fixture"));
    const response = await GET(get("/api/whoop/data?view=day-strain"));
    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(await response.json()).toEqual({ dayStrain: null });
  });

  test("serves the headline scores only", async () => {
    const response = await GET(get("/api/whoop/data"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      connected: true,
      scope: "public",
      lastSynced: "2026-11-17T11:00:00.000Z",
      profile: null,
      bodyMeasurement: null,
      latestRecovery: { score: { recovery_score: 70 } },
      latestCycle: { score: { strain: 10, kilojoule: 8000 } },
      latestSleep: { score: { sleep_performance_percentage: 90 } },
      recentWorkouts: [{ id: 0, day: "2026-11-16", score: { strain: 8, kilojoule: 2000 } }],
    });
  });

  test("leaks no private value anywhere in the body", async () => {
    const text = await (await GET(get("/api/whoop/data"))).text();
    for (const word of ["test@example.com", "Test", "User", "T01:00", "T02:00", "T04:00", "T05:00", "T12:00"]) {
      expect(text, word).not.toContain(word);
    }
    const values = leaves(JSON.parse(text));
    for (const value of PRIVATE_VALUES) {
      expect(values, String(value)).not.toContain(value);
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
