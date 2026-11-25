import { beforeEach, describe, expect, test, vi } from "vitest";
import { records } from "@/test/session-kv";
import { issueGateSession } from "@/lib/gate-session";

vi.mock("@/lib/whoop/kv", () => import("@/test/session-kv"));

// Recording stand-ins for the two Supabase clients the route may use: the
// anon client (row level security applies) and the service role client.
type Call = { method: string; args: unknown[] };
type Query = { client: "anon" | "service"; calls: Call[] };
const queries: Query[] = [];
let result: { data?: unknown; count?: number | null; error?: { message: string } | null } = { data: [], error: null };
let serviceConfigured = true;

function client(name: Query["client"]) {
  return {
    from: () => {
      const query: Query = { client: name, calls: [] };
      queries.push(query);
      const builder: Record<string, unknown> = {};
      for (const method of ["select", "order", "limit", "eq", "update", "insert", "gte"]) {
        builder[method] = (...args: unknown[]) => {
          query.calls.push({ method, args });
          return builder;
        };
      }
      builder.then = (resolve: (value: unknown) => unknown) => Promise.resolve(result).then(resolve);
      return builder;
    },
  };
}

vi.mock("@/lib/supabase", () => ({ supabase: client("anon") }));
vi.mock("@/lib/supabase-server", () => ({
  getSupabaseAdmin: () => (serviceConfigured ? client("service") : null),
}));

import { GET, PATCH, POST } from "./route";
import { ADMIN_COOKIE, GUEST_COOKIE } from "@/lib/gate";

let guestValue: string;
let adminValue: string;

const COOKIE_VALUE = "0123456789abcdef0123456789abcdef";
const ENTRIES = [
  { id: "1", name: "Ada", message: "Hello", created_at: "2026-11-01T00:00:00Z", approved: true },
  { id: "2", name: "Bob", message: "Pending", created_at: "2026-11-02T00:00:00Z", approved: false },
];

function get(path: string, cookie?: string): Request {
  return new Request(`https://matthewrmckenzie.com${path}`, { headers: cookie ? { cookie } : {} });
}

function patch(body: unknown, cookie?: string): Request {
  return new Request("https://matthewrmckenzie.com/api/guestbook", {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(cookie ? { cookie } : {}) },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const adminCookie = () => `${ADMIN_COOKIE}=${adminValue}`;
const filteredToApproved = (query: Query) =>
  query.calls.some((c) => c.method === "eq" && c.args[0] === "approved" && c.args[1] === true);

beforeEach(async () => {
  records.clear();
  queries.length = 0;
  result = { data: ENTRIES, error: null };
  serviceConfigured = true;
  vi.stubEnv("SITE_LOCK_COOKIE_VALUE", COOKIE_VALUE);
  vi.stubEnv("SITE_LOCK_GUEST_PASSWORD", "guest pass phrase");
  const adminSession = (await issueGateSession("admin"))!;
  adminValue = adminSession.gate;
  guestValue = (await issueGateSession("guest"))!.gate;
});

describe("GET /api/guestbook (public list)", () => {
  test("returns approved entries only, through the anon key, with the public cache header", async () => {
    const response = await GET(get("/api/guestbook"));

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("public, s-maxage=300");
    expect((await response.json()).isAdmin).toBe(false);
    expect(queries).toHaveLength(1);
    expect(queries[0].client).toBe("anon");
    expect(filteredToApproved(queries[0])).toBe(true);
  });

  test("ignores cookies, so a cached copy can never hold a pending entry", async () => {
    const response = await GET(get("/api/guestbook", adminCookie()));

    expect(response.headers.get("cache-control")).toBe("public, s-maxage=300");
    expect((await response.json()).isAdmin).toBe(false);
    expect(queries[0].client).toBe("anon");
    expect(filteredToApproved(queries[0])).toBe(true);
  });

  test("does not cache a failure", async () => {
    result = { data: null, error: { message: "boom" } };
    const response = await GET(get("/api/guestbook"));
    expect(response.status).toBe(500);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });
});

describe("GET /api/guestbook?view=admin", () => {
  const refused = async (cookie?: string) => {
    const response = await GET(get("/api/guestbook?view=admin", cookie));
    expect(response.status, cookie).toBe(401);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(await response.json()).toEqual({ error: "Unauthorized" });
    // Refused before the database is asked for anything.
    expect(queries, cookie).toHaveLength(0);
  };

  test("is refused without the admin cookie", async () => {
    await refused();
  });

  test("compares the cookie value: having a cookie of that name is not enough", async () => {
    // The old check was `cookieHeader.includes("mckenzie_auth=")`.
    await refused(`${ADMIN_COOKIE}=`);
    await refused(`${ADMIN_COOKIE}=anything`);
    await refused(`${adminCookie()}x`);
    await refused(`not_${adminCookie()}`);
    await refused(`${GUEST_COOKIE}=${guestValue}`);
    // The cookie main handed out carried the raw secret.
    await refused(`${ADMIN_COOKIE}=${COOKIE_VALUE}`);
  });

  test("fails closed when no cookie secret is configured", async () => {
    vi.stubEnv("SITE_LOCK_COOKIE_VALUE", "");
    await refused(`${ADMIN_COOKIE}=anything`);
    await refused(`${ADMIN_COOKIE}=`);
  });

  test("shows every entry to the admin through the service role key, and is never cached", async () => {
    const response = await GET(get("/api/guestbook?view=admin", adminCookie()));

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(await response.json()).toEqual({ entries: ENTRIES, isAdmin: true });
    expect(queries[0].client).toBe("service");
    expect(filteredToApproved(queries[0])).toBe(false);
  });

  test("says moderation is not configured when the service role key is missing", async () => {
    serviceConfigured = false;
    const response = await GET(get("/api/guestbook?view=admin", adminCookie()));
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "Moderation is not configured" });
    expect(queries).toHaveLength(0);
  });
});

describe("POST /api/guestbook (sign the book)", () => {
  const sign = () =>
    new Request("https://matthewrmckenzie.com/api/guestbook", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "203.0.113.20" },
      body: JSON.stringify({ name: "Ada", message: "Hello" }),
    });

  test("counts recent entries with the service role key, which can see pending ones, and inserts with the anon key", async () => {
    result = { count: 0, error: null };
    const response = await POST(sign());

    expect(response.status).toBe(201);
    expect(queries.map((q) => q.client)).toEqual(["service", "anon"]);
    expect(queries[0].calls.find((c) => c.method === "select")?.args[1]).toEqual({ count: "exact", head: true });
    expect(queries[1].calls.find((c) => c.method === "insert")?.args[0]).toMatchObject({ approved: false });
  });

  test("stops a sixth entry within the hour", async () => {
    result = { count: 5, error: null };
    const response = await POST(sign());
    expect(response.status).toBe(429);
    expect(queries).toHaveLength(1);
  });

  test("falls back to the anon key for the count when the service role key is missing", async () => {
    serviceConfigured = false;
    result = { count: 0, error: null };
    const response = await POST(sign());
    expect(response.status).toBe(201);
    expect(queries.map((q) => q.client)).toEqual(["anon", "anon"]);
  });
});

describe("PATCH /api/guestbook (moderation)", () => {
  test("is refused without the exact admin cookie value, before any key is used", async () => {
    for (const cookie of [undefined, `${ADMIN_COOKIE}=`, `${ADMIN_COOKIE}=guess`, `${ADMIN_COOKIE}=${COOKIE_VALUE}`, `${GUEST_COOKIE}=${guestValue}`]) {
      const response = await PATCH(patch({ id: "2", approved: true }, cookie));
      expect(response.status, cookie).toBe(401);
    }
    expect(queries).toHaveLength(0);
  });

  test("is refused for everyone when no cookie secret is configured", async () => {
    vi.stubEnv("SITE_LOCK_COOKIE_VALUE", "");
    const response = await PATCH(patch({ id: "2", approved: true }, `${ADMIN_COOKIE}=anything`));
    expect(response.status).toBe(401);
    expect(queries).toHaveLength(0);
  });

  test("lets the admin approve an entry through the service role key", async () => {
    result = { data: [{ id: "2" }], error: null };
    const response = await PATCH(patch({ id: "2", approved: true }, adminCookie()));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(queries).toHaveLength(1);
    expect(queries[0].client).toBe("service");
    expect(queries[0].calls.find((c) => c.method === "update")?.args[0]).toEqual({ approved: true });
    expect(queries[0].calls.find((c) => c.method === "eq")?.args).toEqual(["id", "2"]);
  });

  test("accepts a numeric id and an unapproval", async () => {
    result = { data: [{ id: 7 }], error: null };
    const response = await PATCH(patch({ id: 7, approved: false }, adminCookie()));
    expect(response.status).toBe(200);
    expect(queries[0].calls.find((c) => c.method === "update")?.args[0]).toEqual({ approved: false });
  });

  test("says so when no entry matched, instead of claiming success", async () => {
    result = { data: [], error: null };
    const response = await PATCH(patch({ id: "missing", approved: true }, adminCookie()));
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Entry not found" });
  });

  test("rejects a malformed body without touching the database", async () => {
    for (const body of ["not json", {}, { id: "", approved: true }, { id: "2" }, { id: "2", approved: "yes" }, { id: { $ne: 1 }, approved: true }, { id: -1, approved: true }]) {
      const response = await PATCH(patch(body, adminCookie()));
      expect(response.status, JSON.stringify(body)).toBe(400);
    }
    expect(queries).toHaveLength(0);
  });

  test("says moderation is not configured when the service role key is missing", async () => {
    serviceConfigured = false;
    const response = await PATCH(patch({ id: "2", approved: true }, adminCookie()));
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "Moderation is not configured" });
  });

  test("reports a database error without its detail", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    result = { data: null, error: { message: "permission denied for table guestbook_entries" } };
    const response = await PATCH(patch({ id: "2", approved: true }, adminCookie()));
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Failed to update" });
  });
});
