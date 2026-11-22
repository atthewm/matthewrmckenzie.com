// Middleware and route handlers share this Web Crypto implementation.
export const lockCookies = { admin: "mckenzie_auth", guest: "mckenzie_guest" } as const;
type Role = keyof typeof lockCookies;

async function signingKey() {
  const secret = process.env.SITE_LOCK_COOKIE_VALUE;
  if (!secret || secret.length < 16) return null;
  return crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"],
  );
}

function label(role: Role) {
  return new TextEncoder().encode(role === "admin" ? "admin-session-v2" : "guest-session-v2");
}

export async function issueLockSession(role: Role): Promise<string | null> {
  const key = await signingKey();
  if (!key) return null;
  const signature = await crypto.subtle.sign("HMAC", key, label(role));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function hasLockSession(header: string | null, role: Role): Promise<boolean> {
  const prefix = lockCookies[role] + "=";
  const matches = (header ?? "").split(";").map((part) => part.trim()).filter((part) => part.startsWith(prefix));
  if (matches.length !== 1) return false;
  const value = matches[0].slice(prefix.length);
  if (!/^[a-f0-9]{64}$/.test(value)) return false;
  const key = await signingKey();
  if (!key) return false;
  const signature = Uint8Array.from(value.match(/../g)!, (pair) => parseInt(pair, 16));
  return crypto.subtle.verify("HMAC", key, signature, label(role));
}
