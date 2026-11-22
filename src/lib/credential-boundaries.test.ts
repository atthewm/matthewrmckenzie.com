import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { queryDatabase } from "./notion/client";
import { kvGet } from "./whoop/kv";
import { GET as authorizationCallback } from "../app/api/whoop/auth/callback/route";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("private service boundaries", () => {
  it.each(["notion/config", "whoop/kv", "whoop/crypto", "whoop/tokens", "supabase-server"])(
    "keeps %s behind Next's server-only import",
    (module) => {
      const source = readFileSync(new URL(`./${module}.ts`, import.meta.url), "utf8");
      expect(/^import ["']server-only["'];?$/m.test(source)).toBe(true);
    },
  );

  it("keeps upstream response bodies and document paths out of errors", async () => {
    vi.stubEnv("NOTION_TOKEN", "local-unit-test");
    vi.stubEnv("KV_REST_API_URL", "https://fixture.invalid");
    vi.stubEnv("KV_REST_API_TOKEN", "local-unit-test");
    const fetchFixture = vi.fn(async () => new Response("upstream diagnostic fixture", { status: 503 }));
    vi.stubGlobal("fetch", fetchFixture);
    await expect(queryDatabase("local-database")).rejects.toThrow(/^Notion request failed \(503\)$/);
    await expect(kvGet("local-key")).rejects.toThrow(/^KV request failed \(503\)$/);
    expect(fetchFixture).toHaveBeenCalledTimes(2);
  });

  it("keeps provider-supplied descriptions out of the public return URL", async () => {
    const url = new URL("https://fixture.invalid/api/whoop/auth/callback");
    url.searchParams.set("error", "access_denied");
    url.searchParams.set("error_description", "local diagnostic fixture");
    const response = await authorizationCallback(new NextRequest(url));
    const location = new URL(response.headers.get("location")!);
    expect(location.searchParams.get("whoop_auth")).toBe("error");
    expect(location.searchParams.get("whoop_message")).not.toContain("local diagnostic fixture");
  });
});
