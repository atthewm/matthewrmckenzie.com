import "server-only";

// ============================================================================
// SIGN-IN ATTEMPT LIMIT (server only)
// ============================================================================
// A first layer against password guessing at /gate. Each client address (each
// IPv6 /64) gets five wrong tries. After that its next attempt is not even
// checked until a wait has passed, and every further miss doubles the wait:
// 1 minute, then 2, 4, 8, up to an hour. An admin sign-in clears the address,
// and an address with no misses for a day starts over.
//
// The counts live in memory, so this is PER INSTANCE: each serverless instance
// keeps its own, a cold start forgets them, and a guesser whose requests reach
// several instances gets five tries on each. It slows guessing down; it is not
// a guarantee. The 16 character floor on the admin password is what makes
// guessing hopeless. No paid service is involved.
// ============================================================================

export interface AttemptLimitOptions {
  /** Wrong tries allowed before the first wait. */
  freeFailures?: number;
  /** The first wait. Each further miss doubles it. */
  baseBlockMs?: number;
  /** The longest wait. */
  maxBlockMs?: number;
  /** An address with no misses for this long starts over. */
  forgetAfterMs?: number;
  /** Addresses kept at most; the least recent goes first. Bounds memory. */
  maxTracked?: number;
}

export interface AttemptCheck {
  allowed: boolean;
  /** Whole seconds until the next attempt is checked; 0 when allowed. */
  retryAfterSeconds: number;
}

export interface AttemptLimiter {
  /** Whether an attempt from this address may be checked now. */
  check(key: string, now?: number): AttemptCheck;
  /** Count a wrong attempt; returns what the next attempt will meet. */
  recordFailure(key: string, now?: number): AttemptCheck;
  /** Forget the address after a successful sign-in. */
  recordSuccess(key: string): void;
  /** Forget every address. */
  clear(): void;
  /** Addresses currently tracked. */
  size(): number;
}

interface Entry {
  readonly failures: number;
  readonly lastFailureAt: number;
  readonly blockedUntil: number;
}

const MINUTE = 60 * 1000;
const DEFAULTS: Required<AttemptLimitOptions> = {
  freeFailures: 5,
  baseBlockMs: MINUTE,
  maxBlockMs: 60 * MINUTE,
  forgetAfterMs: 24 * 60 * MINUTE,
  maxTracked: 5000,
};

const ALLOWED: AttemptCheck = { allowed: true, retryAfterSeconds: 0 };

export function createAttemptLimiter(options: AttemptLimitOptions = {}): AttemptLimiter {
  const settings = { ...DEFAULTS, ...options };
  const entries = new Map<string, Entry>();

  const isStale = (entry: Entry, now: number) =>
    entry.blockedUntil <= now && now - entry.lastFailureAt >= settings.forgetAfterMs;

  const verdict = (entry: Entry | undefined, now: number): AttemptCheck =>
    entry && entry.blockedUntil > now
      ? { allowed: false, retryAfterSeconds: Math.ceil((entry.blockedUntil - now) / 1000) }
      : ALLOWED;

  function makeRoom(now: number) {
    if (entries.size < settings.maxTracked) return;
    for (const [key, entry] of entries) {
      if (isStale(entry, now)) entries.delete(key);
    }
    // Still full: drop the least recently failed. Map keeps insertion order.
    while (entries.size >= settings.maxTracked) {
      const oldest = entries.keys().next().value;
      if (oldest === undefined) break;
      entries.delete(oldest);
    }
  }

  function current(key: string, now: number): Entry | undefined {
    const entry = entries.get(key);
    if (entry && isStale(entry, now)) {
      entries.delete(key);
      return undefined;
    }
    return entry;
  }

  return {
    check(key, now = Date.now()) {
      return verdict(current(key, now), now);
    },

    recordFailure(key, now = Date.now()) {
      const previous = current(key, now);
      const failures = (previous?.failures ?? 0) + 1;
      const overBy = failures - settings.freeFailures;
      const blockMs = overBy >= 0 ? Math.min(settings.baseBlockMs * 2 ** overBy, settings.maxBlockMs) : 0;
      const next: Entry = {
        failures,
        lastFailureAt: now,
        blockedUntil: blockMs > 0 ? now + blockMs : 0,
      };
      // Delete first so the address moves to the end: the most recent miss.
      entries.delete(key);
      makeRoom(now);
      entries.set(key, next);
      return verdict(next, now);
    },

    recordSuccess(key) {
      entries.delete(key);
    },

    clear() {
      entries.clear();
    },

    size() {
      return entries.size;
    },
  };
}

const IPV4_MAPPED = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i;

/**
 * One bucket per IPv4 address, and one per IPv6 /64: a single connection is
 * usually handed a whole /64, so keying on the full IPv6 address would give a
 * guesser endless fresh buckets.
 */
export function addressBucket(address: string): string {
  const plain = address.split("%")[0].trim().toLowerCase();
  if (!plain.includes(":")) return plain;
  const mapped = IPV4_MAPPED.exec(plain);
  if (mapped) return mapped[1];

  const [head, tail] = plain.split("::");
  const headParts = head ? head.split(":") : [];
  const tailParts = tail ? tail.split(":") : [];
  const zeros = plain.includes("::") ? Math.max(8 - headParts.length - tailParts.length, 0) : 0;
  const groups = [...headParts, ...Array<string>(zeros).fill("0"), ...tailParts];
  const prefix = groups.slice(0, 4).map((g) => g.replace(/^0+(?=.)/, "") || "0");
  return `${prefix.join(":")}::/64`;
}

/**
 * The client's bucket, from the address Vercel reports. Vercel sets
 * x-forwarded-for itself and overwrites any value a client sends, so it
 * cannot be used to pose as another address there. Without the header (local
 * runs) every request shares one bucket, which errs on the strict side.
 */
export function clientAddress(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwarded || req.headers.get("x-real-ip")?.trim();
  return address ? addressBucket(address) : "unknown";
}

/** The one limiter /api/auth uses, shared by every request this instance serves. */
export const signInLimiter = createAttemptLimiter();
