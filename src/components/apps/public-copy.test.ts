import { describe, expect, test } from "vitest";
import fs from "fs";
import path from "path";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), "src", file), "utf8");

// The site has no projects section and no side-project language. These two
// desktop apps are the public surfaces where that wording last appeared.
describe("Links and GitHub app copy", () => {
  test("the Links app has no section titled Projects", () => {
    const links = read("components/apps/LinktreeApp.tsx");
    expect(links).not.toMatch(/<LinkSection title="Projects"/);
    expect(links).toMatch(/<LinkSection title="Tools"/);
  });

  test("the GitHub app has no Projects filter and no side-project wording", () => {
    const github = read("components/apps/GitHubApp.tsx");
    expect(github).not.toMatch(/label: "Projects"/);
    expect(github).not.toMatch(/side[ -]projects?/i);
  });

  test("the app list does not describe GitHub as projects", () => {
    const github = read("data/fs.ts").split("\n").find((line) => line.includes('id: "github-projects"')) ?? "";
    expect(github).not.toMatch(/projects\./i);
  });
});
