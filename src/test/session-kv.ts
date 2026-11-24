import { vi } from "vitest";

// Keep records until explicitly revoked so tests also prove that the signed
// deadline is enforced if the storage TTL happens to be late.
export const records = new Map<string, string>();
export const kvSet = vi.fn(async (key: string, value: string, _ttl?: number) => { records.set(key, value); });
export const kvGetUntil = vi.fn(async (key: string, _expires: number) => records.get(key) ?? null);
export const kvDel = vi.fn(async (...keys: string[]) => { keys.forEach(key => records.delete(key)); });
export const kvTake = vi.fn(async (key: string) => {
  const value = records.get(key) ?? null;
  records.delete(key);
  return value;
});
