import { describe, expect, test } from "vitest";
import robots from "@/app/robots";
import {
  ALLOWED_AGENTS,
  BLOCKED_AGENTS,
  DISALLOWED_PATHS,
  buildRobots,
} from "./robots-policy";

interface Group {
  userAgent: string;
  allow: string[];
  disallow: string[];
}

function toList(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function groups(): Group[] {
  const rules = buildRobots().rules;
  return (Array.isArray(rules) ? rules : [rules]).flatMap((rule) =>
    toList(rule.userAgent).map((userAgent) => ({
      userAgent,
      allow: toList(rule.allow),
      disallow: toList(rule.disallow),
    }))
  );
}

function groupFor(agent: string): Group {
  const all = groups();
  const own = all.find((g) => g.userAgent.toLowerCase() === agent.toLowerCase());
  const wildcard = all.find((g) => g.userAgent === "*");
  if (!own && !wildcard) throw new Error(`no group applies to ${agent}`);
  return (own ?? wildcard) as Group;
}

/** Longest matching rule wins, and Allow wins a tie (RFC 9309). */
function canFetch(agent: string, path: string): boolean {
  const group = groupFor(agent);
  const longest = (rules: string[]) =>
    rules.filter((rule) => path.startsWith(rule)).reduce((max, rule) => Math.max(max, rule.length), -1);
  const allow = longest(group.allow);
  const disallow = longest(group.disallow);
  return disallow === -1 || allow >= disallow;
}

const PUBLIC_PATHS = ["/", "/about", "/work", "/writing", "/recipes", "/card", "/llms.txt", "/opengraph-image", "/sitemap.xml"];
const PRIVATE_PATHS = ["/gate", "/api/", "/api/whoop/data", "/api/guestbook", "/card/vcard"];

describe("robots policy", () => {
  test("the route serves the shared policy", () => {
    expect(robots()).toEqual(buildRobots());
  });

  test("lists one sitemap on the site's own host, without www", () => {
    expect(buildRobots().sitemap).toBe("https://matthewrmckenzie.com/sitemap.xml");
  });

  test("gives every allowed crawler its own group", () => {
    const named = groups().map((g) => g.userAgent);
    for (const agent of ALLOWED_AGENTS) expect(named).toContain(agent);
    expect(named).toContain("AhrefsBot");
    expect(named).toContain("AhrefsSiteAudit");
  });

  test("never names the same crawler twice", () => {
    const named = groups().map((g) => g.userAgent.toLowerCase());
    expect(new Set(named).size).toBe(named.length);
    const blocked = new Set(BLOCKED_AGENTS.map((a) => a.toLowerCase()));
    expect(ALLOWED_AGENTS.filter((a) => blocked.has(a.toLowerCase()))).toEqual([]);
  });

  test("gives every allowed group the same rules as the wildcard group", () => {
    const wildcard = groupFor("*");
    expect(wildcard.allow).toEqual(["/"]);
    expect(wildcard.disallow).toEqual([...DISALLOWED_PATHS]);
    for (const agent of ALLOWED_AGENTS) {
      const group = groupFor(agent);
      expect(group.allow, agent).toEqual(wildcard.allow);
      expect(group.disallow, agent).toEqual(wildcard.disallow);
    }
  });

  test("keeps /gate and /api/ disallowed in every allowed group", () => {
    for (const agent of ["*", ...ALLOWED_AGENTS]) {
      const { disallow } = groupFor(agent);
      expect(disallow, agent).toContain("/gate");
      expect(disallow, agent).toContain("/api/");
    }
  });

  test("lets allowed crawlers and unnamed ones read public pages only", () => {
    for (const agent of [...ALLOWED_AGENTS, "SomeOtherBot"]) {
      for (const path of PUBLIC_PATHS) expect(canFetch(agent, path), `${agent} ${path}`).toBe(true);
      for (const path of PRIVATE_PATHS) expect(canFetch(agent, path), `${agent} ${path}`).toBe(false);
    }
  });

  test("refuses bulk scrapers everything", () => {
    for (const agent of BLOCKED_AGENTS) {
      const group = groupFor(agent);
      expect(group.allow, agent).toEqual([]);
      expect(group.disallow, agent).toEqual(["/"]);
      for (const path of [...PUBLIC_PATHS, ...PRIVATE_PATHS]) {
        expect(canFetch(agent, path), `${agent} ${path}`).toBe(false);
      }
    }
  });

  test("blocks CCBot, which the old file allowed", () => {
    expect(canFetch("CCBot", "/")).toBe(false);
  });
});
