import { describe, expect, test } from "vitest";
import { addressBucket, clientAddress, createAttemptLimiter } from "./sign-in-limit";

const MINUTE = 60 * 1000;
const T0 = Date.UTC(2026, 10, 17, 12, 0, 0);

/** Record `n` misses one second apart, starting at `start`. Returns the last verdict. */
function miss(limiter: ReturnType<typeof createAttemptLimiter>, key: string, n: number, start = T0) {
  let last = limiter.check(key, start);
  for (let i = 0; i < n; i++) last = limiter.recordFailure(key, start + i * 1000);
  return last;
}

describe("createAttemptLimiter", () => {
  test("allows five wrong tries, then makes the next one wait a minute", () => {
    const limiter = createAttemptLimiter();
    expect(miss(limiter, "1.2.3.4", 4)).toEqual({ allowed: true, retryAfterSeconds: 0 });
    expect(limiter.check("1.2.3.4", T0 + 4000).allowed).toBe(true);

    const fifth = limiter.recordFailure("1.2.3.4", T0 + 4000);
    expect(fifth).toEqual({ allowed: false, retryAfterSeconds: 60 });
    expect(limiter.check("1.2.3.4", T0 + 4000 + 30 * 1000)).toEqual({ allowed: false, retryAfterSeconds: 30 });
    expect(limiter.check("1.2.3.4", T0 + 4000 + MINUTE).allowed).toBe(true);
  });

  test("doubles the wait with each further miss, up to an hour", () => {
    const limiter = createAttemptLimiter();
    let now = T0;
    for (let i = 0; i < 5; i++) limiter.recordFailure("ip", (now += 1000));

    const waits: number[] = [];
    for (let i = 0; i < 8; i++) {
      // Wait out the current block, then miss again.
      now += limiter.check("ip", now).retryAfterSeconds * 1000;
      waits.push(limiter.recordFailure("ip", now).retryAfterSeconds / 60);
    }
    expect(waits).toEqual([2, 4, 8, 16, 32, 60, 60, 60]);
  });

  test("keeps addresses apart", () => {
    const limiter = createAttemptLimiter();
    miss(limiter, "1.1.1.1", 5);
    expect(limiter.check("1.1.1.1", T0 + 5000).allowed).toBe(false);
    expect(limiter.check("2.2.2.2", T0 + 5000).allowed).toBe(true);
  });

  test("forgets an address after a successful sign-in", () => {
    const limiter = createAttemptLimiter();
    miss(limiter, "ip", 4);
    limiter.recordSuccess("ip");
    expect(miss(limiter, "ip", 4, T0 + 10_000).allowed).toBe(true);
  });

  test("starts an address over after a day without misses", () => {
    const limiter = createAttemptLimiter();
    miss(limiter, "ip", 5);
    const nextDay = T0 + 24 * 60 * MINUTE + 10_000;
    expect(limiter.check("ip", nextDay).allowed).toBe(true);
    expect(limiter.recordFailure("ip", nextDay)).toEqual({ allowed: true, retryAfterSeconds: 0 });
  });

  test("bounds memory by dropping the least recently failed address", () => {
    const limiter = createAttemptLimiter({ maxTracked: 3 });
    for (const [i, ip] of ["a", "b", "c", "d"].entries()) limiter.recordFailure(ip, T0 + i);
    expect(limiter.size()).toBe(3);
    // "a" was dropped: five more misses are needed to block it, from scratch.
    expect(miss(limiter, "a", 4, T0 + 10).allowed).toBe(true);
  });

  test("clear forgets everything", () => {
    const limiter = createAttemptLimiter();
    miss(limiter, "ip", 5);
    limiter.clear();
    expect(limiter.size()).toBe(0);
    expect(limiter.check("ip", T0 + 6000).allowed).toBe(true);
  });
});

describe("clientAddress", () => {
  const request = (headers: Record<string, string>) => new Request("https://matthewrmckenzie.com/api/auth", { headers });

  test("takes the first x-forwarded-for entry, which Vercel sets", () => {
    expect(clientAddress(request({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }))).toBe("203.0.113.7");
  });

  test("falls back to x-real-ip, then to one shared bucket", () => {
    expect(clientAddress(request({ "x-real-ip": "203.0.113.8" }))).toBe("203.0.113.8");
    expect(clientAddress(request({}))).toBe("unknown");
  });

  test("buckets IPv6 by /64", () => {
    expect(clientAddress(request({ "x-forwarded-for": "2001:db8:1:2::abcd" }))).toBe("2001:db8:1:2::/64");
  });
});

describe("addressBucket", () => {
  test("keeps an IPv4 address as it is", () => {
    expect(addressBucket("203.0.113.7")).toBe("203.0.113.7");
  });

  test("reduces any IPv6 address to its /64, however it is written", () => {
    const bucket = "2001:db8:1:2::/64";
    for (const address of [
      "2001:db8:1:2::1",
      "2001:db8:1:2:aaaa:bbbb:cccc:dddd",
      "2001:0DB8:0001:0002:0000:0000:0000:0009",
      "2001:db8:1:2::1%eth0",
    ]) {
      expect(addressBucket(address), address).toBe(bucket);
    }
    expect(addressBucket("2001:db8::1")).toBe("2001:db8:0:0::/64");
    expect(addressBucket("2001:db8:1:3::1")).not.toBe(bucket);
  });

  test("treats an IPv4-mapped IPv6 address as the IPv4 address", () => {
    expect(addressBucket("::ffff:203.0.113.7")).toBe("203.0.113.7");
  });
});
