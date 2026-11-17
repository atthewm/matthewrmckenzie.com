import { describe, expect, test, vi } from "vitest";
import { GET } from "./route";
import { getOwnerMobile } from "@/lib/owner-contact";
import { profile, phoneE164 } from "@/config/profile";

// A number from the range reserved for fiction, never a real one.
const TEST_MOBILE = "+15125550123";

async function vcard() {
  const response = await GET();
  return { response, lines: (await response.text()).split("\r\n") };
}

describe("getOwnerMobile", () => {
  test("is null while the variable is unset or blank", () => {
    vi.stubEnv("OWNER_MOBILE_E164", undefined);
    expect(getOwnerMobile()).toBeNull();
    vi.stubEnv("OWNER_MOBILE_E164", "   ");
    expect(getOwnerMobile()).toBeNull();
  });

  test("accepts a full international number and trims it", () => {
    vi.stubEnv("OWNER_MOBILE_E164", ` ${TEST_MOBILE} `);
    expect(getOwnerMobile()).toBe(TEST_MOBILE);
  });

  test("rejects anything that is not E.164", () => {
    for (const value of ["512-555-0123", "5125550123", "+0125550123", "+1 512 555 0123", "+1512555012345678", "call me"]) {
      vi.stubEnv("OWNER_MOBILE_E164", value);
      expect(getOwnerMobile(), value).toBeNull();
    }
  });
});

describe("the profile config", () => {
  test("holds no mobile number: only the public office line", () => {
    expect("mobile" in profile).toBe(false);
    expect(Object.keys(phoneE164)).toEqual(["direct"]);
  });

  test("lists the Austin office at 510 Baylor Street", () => {
    expect(profile.offices[0]).toEqual({
      city: "Austin",
      street: "510 Baylor Street",
      locality: "Austin",
      region: "TX",
      postalCode: "78703",
    });
  });
});

describe("GET /card/vcard", () => {
  test("adds the mobile line only from the environment", async () => {
    vi.stubEnv("OWNER_MOBILE_E164", TEST_MOBILE);
    const { lines } = await vcard();
    expect(lines).toContain(`TEL;type=CELL,VOICE:${TEST_MOBILE}`);
    expect(lines).toContain(`TEL;type=WORK,VOICE:${phoneE164.direct}`);
  });

  test("omits the mobile line cleanly when the variable is unset", async () => {
    vi.stubEnv("OWNER_MOBILE_E164", undefined);
    const { lines } = await vcard();
    expect(lines.filter((l) => l.includes("CELL"))).toEqual([]);
    expect(lines.filter((l) => l.startsWith("TEL"))).toEqual([`TEL;type=WORK,VOICE:${phoneE164.direct}`]);
    expect(lines.filter((l) => l === "")).toEqual([]);
    expect(lines[0]).toBe("BEGIN:VCARD");
    expect(lines.at(-1)).toBe("END:VCARD");
  });

  test("carries the new office address", async () => {
    const { lines } = await vcard();
    expect(lines).toContain("ADR;type=WORK;type=pref:;;510 Baylor Street;Austin;TX;78703;USA");
    expect(lines.join("\n")).not.toContain("Congress");
  });

  test("is cacheable at the edge and kept out of search indexes", async () => {
    const { response } = await vcard();
    expect(response.headers.get("content-type")).toBe("text/vcard; charset=utf-8");
    expect(response.headers.get("cache-control")).toBe("public, max-age=3600, s-maxage=86400");
    expect(response.headers.get("x-robots-tag")).toBe("noindex");
  });
});
