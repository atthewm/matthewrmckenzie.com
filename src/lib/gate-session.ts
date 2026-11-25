import "server-only";

import { createHmac, randomBytes } from "node:crypto";
import { readCookie, safeEqual } from "./cookies";
import { kvDel, kvGetUntil, kvSet } from "./whoop/kv";

export const ADMIN_COOKIE = "mckenzie_auth";
export const GUEST_COOKIE = "mckenzie_guest";
export const OWNER_COOKIE = "mmck_owner";
export const SESSION_HINT_COOKIE = "mmck_session";
export const GATE_MAX_AGE = 30 * 24 * 60 * 60;
const MIN_SESSION_SECRET_LENGTH = 16;
const MIN_OWNER_SECRET_LENGTH = 32;
type GateRole = "admin" | "guest";
type Permission = GateRole | "owner";

const cookieFor = { admin: ADMIN_COOKIE, guest: GUEST_COOKIE, owner: OWNER_COOKIE };

function signingKey(permission: Permission): Buffer | string | null {
  const gate = process.env.SITE_LOCK_COOKIE_VALUE ?? "";
  if (gate.length < MIN_SESSION_SECRET_LENGTH) return null;
  if (permission === "guest" && !process.env.SITE_LOCK_GUEST_PASSWORD) return null;
  if (permission !== "owner") return gate;
  const owner = process.env.OWNER_COOKIE_SECRET ?? "";
  if (owner.length < MIN_OWNER_SECRET_LENGTH) return null;
  // Rotating either server secret retires the owner grant.
  return createHmac("sha256", owner).update(gate).digest();
}

function registryKey(id: string) {
  return "site:gate:session:" + id;
}

function signature(permission: Permission, body: string) {
  const key = signingKey(permission);
  return key ? createHmac("sha256", key).update(permission + ":" + body).digest("base64url") : null;
}

function credential(permission: Permission, body: string) {
  const sig = signature(permission, body);
  return sig ? body + "." + sig : null;
}

export async function issueGateSession(role: GateRole) {
  const id = randomBytes(32).toString("base64url");
  const expires = Math.floor(Date.now() / 1000) + GATE_MAX_AGE;
  const body = "v3." + id + "." + expires;
  const gate = credential(role, body);
  if (!gate) return null;
  const owner = role === "admin" ? credential("owner", body) : null;
  await kvSet(registryKey(id), role, GATE_MAX_AGE);
  return { gate, owner };
}

function signedSession(request: Request, permission: Permission) {
  const raw = readCookie(request.headers.get("cookie"), cookieFor[permission]);
  if (!raw || raw.length > 140) return null;
  const match = /^(v3\.([\w-]{43})\.(\d{10,11}))\.([\w-]{43})$/.exec(raw);
  if (!match || Number(match[3]) <= Date.now() / 1000) return null;
  const expected = signature(permission, match[1]);
  return expected && safeEqual(expected, match[4]) ? { id: match[2], expires: Number(match[3]) } : null;
}

export async function activeGateSession(request: Request, permission: Permission) {
  const session = signedSession(request, permission);
  if (!session) return null;
  const expected = permission === "owner" ? "admin" : permission;
  try {
    const role = await kvGetUntil(registryKey(session.id), session.expires);
    return role === expected && session.expires > Date.now() / 1000 ? session.id : null;
  } catch {
    return null;
  }
}

export async function hasGatePermission(request: Request, permission: Permission) {
  return (await activeGateSession(request, permission)) !== null;
}

export async function revokeGateSessions(request: Request) {
  const keys = new Set<string>();
  for (const permission of ["admin", "guest", "owner"] as const) {
    const session = signedSession(request, permission);
    if (session) keys.add(registryKey(session.id));
  }
  // Separate deletes also work if unrelated cookies belong to different cluster slots.
  await Promise.all(Array.from(keys, key => kvDel(key)));
}

/** Bind the short OAuth continuation to its originating session and the current owner key. */
export function ownerFlowBinding(id: string, state: string) {
  const key = signingKey("owner");
  return key ? createHmac("sha256", key).update("whoop-oauth:" + id + ":" + state).digest("hex") : null;
}
