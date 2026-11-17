import { describe, expect, test } from "vitest";
import {
  dockItemIds,
  fileSystem,
  findFSItem,
  flattenFS,
  getRootItems,
  isListed,
  publicTree,
} from "./fs";

describe("owner-only items", () => {
  test("Life and Nutrition are marked owner only", () => {
    expect(findFSItem("life")?.ownerOnly).toBe(true);
    expect(findFSItem("nutrition")?.ownerOnly).toBe(true);
  });

  test("are exactly Life and Nutrition: the combined health and diet views", () => {
    expect(flattenFS().filter((i) => i.ownerOnly).map((i) => i.id).sort()).toEqual(["life", "nutrition"]);
  });

  test("Nutrition is dropped from the public tree, inside Health", () => {
    const health = publicTree().find((i) => i.id === "health");
    expect(health?.children?.map((i) => i.id)).not.toContain("nutrition");
    expect(health?.children?.map((i) => i.id)).toContain("whoop-dashboard");
  });

  test("are left out of the root listing unless the viewer is the owner", () => {
    const ids = (isOwner: boolean) => getRootItems(false, isOwner).map((i) => i.id);
    expect(ids(false)).not.toContain("life");
    expect(getRootItems().map((i) => i.id)).not.toContain("life");
    expect(ids(true)).toContain("life");
  });

  test("do not change what else is listed", () => {
    const withoutLife = getRootItems(false, true).filter((i) => i.id !== "life");
    expect(getRootItems(false, false)).toEqual(withoutLife);
    expect(getRootItems(true, true)).toEqual(fileSystem);
  });

  test("still hide hidden folders from everyone by default", () => {
    expect(getRootItems(false, true).map((i) => i.id)).not.toContain("secrets");
    expect(getRootItems(true, false).map((i) => i.id)).toContain("secrets");
  });

  test("are dropped from the public tree at every depth", () => {
    const publicIds = flattenFS(publicTree()).map((i) => i.id);
    expect(publicIds).not.toContain("life");
    expect(publicIds.length).toBe(flattenFS().filter((i) => !i.ownerOnly).length);
    expect(flattenFS(publicTree()).every((i) => !i.ownerOnly)).toBe(true);
  });

  test("isListed lets everything else through", () => {
    const about = findFSItem("about");
    const life = findFSItem("life");
    if (!about || !life) throw new Error("fixture items missing");
    expect(isListed(about, false)).toBe(true);
    expect(isListed(life, false)).toBe(false);
    expect(isListed(life, true)).toBe(true);
  });

  test("Life stays in the dock order, for the owner", () => {
    expect(dockItemIds).toContain("life");
  });
});

describe("the Work folder", () => {
  test("no longer links to the two public PDFs", () => {
    const hrefs = flattenFS().map((i) => i.href ?? "");
    expect(hrefs.filter((h) => h.toLowerCase().endsWith(".pdf"))).toEqual([]);
    expect(findFSItem("capital-formation-overview")).toBeUndefined();
    expect(findFSItem("working-with")).toBeUndefined();
  });
});
