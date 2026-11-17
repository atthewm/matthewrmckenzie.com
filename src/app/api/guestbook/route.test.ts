import { beforeEach, describe, expect, test, vi } from "vitest";

// A recording stand-in for the Supabase query builder used by the route.
type Call = { method: string; args: unknown[] };
const queries: Call[][] = [];
let result: { data?: unknown; error?: { message: string } | null } = { data: [], error: null };

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: () => {
      const calls: Call[] = [];
      queries.push(calls);
      const builder: Record<string, unknown> = {};
      for (const method of ["select", "order", "limit", "eq", "update", "insert", "gte"]) {
        builder[method] = (...args: unknown[]) => {
          calls.push({ method, args });
          return builder;
        };
      }
      builder.then = (resolve: (value: unknown) => unknown) => Promise.resolve(result).then(resolve);
      return builder;
    },
  },
}));

import { GET, PATCH } from "./route";
import { ADMIN_COOKIE, guestCookieValue, GUEST_COOKIE } from "@/lib/gate";

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
    body: JSON.stringify(body),
  });
}

const filteredToApproved = (calls: Call[]) =>
  calls.some((c) => c.method === "eq" && c.args[0] === "approved" && c.args[1] === true);

beforeEach(() => {
  queries.length = 0;
  result = { data: ENTRIES, error: null };
  vi.stubEnv("SITE_LOCK_COOKIE_VALUE", COOKIE_VALUE);
});

describe("GET /api/guestbook (public list)", () => {
  test("returns approved entries only, with the public cache header", async () => {
    const response = await GET(get("/api/guestbook"));

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("public, s-maxage=300");
    expect((await response.json()).isAdmin).toBe(false);
    expect(queries).toHaveLength(1);
    expect(filteredToApproved(queries[0])).toBe(true);
  });

  test("ignores cookies, so a cached copy can never hold a pending entry", async () => {
    const response = await GET(get("/api/guestbook", `${ADMIN_COOKIE}=${COOKIE_VALUE}`));

    expect(response.headers.get("cache-control")).toBe("public, s-maxage=300");
    expect((await response.json()).isAdmin).toBe(false);
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
    await refused(`${ADMIN_COOKIE}=${COOKIE_VALUE}x`);
    await refused(`not_${ADMIN_COOKIE}=${COOKIE_VALUE}`);
    await refused(`${GUEST_COOKIE}=${guestCookieValue()}`);
  });

  test("fails closed when no cookie value is configured", async () => {
    vi.stubEnv("SITE_LOCK_COOKIE_VALUE", "");
    await refused(`${ADMIN_COOKIE}=anything`);
    await refused(`${ADMIN_COOKIE}=`);
  });

  test("shows every entry to the admin and is never cached", async () => {
    const response = await GET(get("/api/guestbook?view=admin", `${ADMIN_COOKIE}=${COOKIE_VALUE}`));

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(await response.json()).toEqual({ entries: ENTRIES, isAdmin: true });
    expect(filteredToApproved(queries[0])).toBe(false);
  });
});

describe("PATCH /api/guestbook (moderation)", () => {
  test("is refused without the exact admin cookie value", async () => {
    for (const cookie of [undefined, `${ADMIN_COOKIE}=`, `${ADMIN_COOKIE}=guess`, `${GUEST_COOKIE}=${guestCookieValue()}`]) {
      const response = await PATCH(patch({ id: "2", approved: true }, cookie));
      expect(response.status, cookie).toBe(401);
    }
    expect(queries).toHaveLength(0);
  });

  test("is refused for everyone when no cookie value is configured", async () => {
    vi.stubEnv("SITE_LOCK_COOKIE_VALUE", "");
    const response = await PATCH(patch({ id: "2", approved: true }, `${ADMIN_COOKIE}=anything`));
    expect(response.status).toBe(401);
    expect(queries).toHaveLength(0);
  });

  test("lets the admin approve an entry", async () => {
    const response = await PATCH(patch({ id: "2", approved: true }, `${ADMIN_COOKIE}=${COOKIE_VALUE}`));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(queries[0].find((c) => c.method === "update")?.args[0]).toEqual({ approved: true });
    expect(queries[0].find((c) => c.method === "eq")?.args).toEqual(["id", "2"]);
  });
});
