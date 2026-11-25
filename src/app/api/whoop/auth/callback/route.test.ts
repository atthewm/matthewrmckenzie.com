import { NextRequest } from "next/server";
import { beforeEach, afterEach, expect, test, vi } from "vitest";
vi.mock("@/lib/whoop/kv", () => import("@/test/session-kv"));
vi.mock("@/lib/whoop/tokens", () => ({ storeTokens: vi.fn() }));
import { records } from "@/test/session-kv";
import { ADMIN_COOKIE, OWNER_COOKIE, issueGateSession, revokeGateSessions } from "@/lib/gate-session";
import { storeTokens } from "@/lib/whoop/tokens";
import { GET as start } from "../start/route";
import { GET as finish } from "./route";

beforeEach(() => {
  records.clear();
  vi.stubEnv("SITE_LOCK_COOKIE_VALUE", "fixture-gate-secret-for-tests");
  vi.stubEnv("OWNER_COOKIE_SECRET", "fixture-owner-secret-for-tests-only");
  vi.stubEnv("WHOOP_CLIENT_ID", "local-fixture");
  vi.stubEnv("WHOOP_CLIENT_SECRET", "local-fixture");
  vi.stubEnv("WHOOP_REDIRECT_URI", "http://localhost/callback");
  vi.stubEnv("NEXT_PUBLIC_BASE_URL", "http://localhost");
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
    access_token: "local-fixture", refresh_token: "local-fixture", expires_in: 300,
  }), {status: 200})));
});
afterEach(() => vi.unstubAllGlobals());
async function begin() {
  const session = (await issueGateSession("admin"))!;
  const adminCookie = ADMIN_COOKIE + "=" + session.gate;
  const header = adminCookie + "; " + OWNER_COOKIE + "=" + session.owner;
  const startResult = await start(new Request("http://localhost/start", {headers: {cookie: header}}));
  const state = new URL(startResult.headers.get("location")!).searchParams.get("state")!;
  return new NextRequest("http://localhost/callback?code=fixture&state=" + state, {headers: {cookie: adminCookie}});
}
test("the originating session completes its continuation once with its Lax gate cookie", async () => {
  const request = await begin();
  expect((await finish(request)).headers.get("location")).toContain("whoop_auth=success");
  expect(storeTokens).toHaveBeenCalledOnce();
  expect((await finish(request)).headers.get("location")).toContain("whoop_auth=error");
  expect(fetch).toHaveBeenCalledOnce();
});
test("sign-out retires a pending owner continuation before any provider call", async () => {
  const request = await begin();
  await revokeGateSessions(request);
  expect((await finish(request)).headers.get("location")).toContain("whoop_auth=error");
  expect(fetch).not.toHaveBeenCalled();
});
