import { describe, expect, test } from "vitest";
import { findFSItem, type FSItem } from "@/data/fs";
import { buildGroups } from "./boardLayout";

const ids = (folder: FSItem, isOwner?: boolean) =>
  buildGroups(folder, isOwner).flatMap((g) => g.items.map((i) => i.id));

function folder(id: string): FSItem {
  const item = findFSItem(id);
  if (!item) throw new Error(`missing folder ${id}`);
  return item;
}

describe("buildGroups", () => {
  test("leaves Nutrition off the Health board for visitors", () => {
    expect(ids(folder("health"))).not.toContain("nutrition");
    expect(ids(folder("health"), false)).not.toContain("nutrition");
    expect(ids(folder("health"))).toContain("whoop-dashboard");
  });

  test("shows Nutrition on the Health board to the owner", () => {
    expect(ids(folder("health"), true)).toContain("nutrition");
  });

  test("applies the owner rule inside nested folders and to pinned items", () => {
    const board: FSItem = {
      id: "test-board",
      name: "Test",
      type: "folder",
      icon: "Folder",
      pins: ["life", "about"],
      children: [
        { id: "a", name: "A", type: "app", icon: "File" },
        { id: "b", name: "B", type: "app", icon: "File", ownerOnly: true },
        {
          id: "sub",
          name: "Sub",
          type: "folder",
          icon: "Folder",
          children: [
            { id: "c", name: "C", type: "app", icon: "File" },
            { id: "d", name: "D", type: "app", icon: "File", ownerOnly: true },
          ],
        },
      ],
    };
    expect(ids(board).sort()).toEqual(["a", "about", "c"]);
    expect(ids(board, true).sort()).toEqual(["a", "about", "b", "c", "d", "life"]);
  });

  test("leaves every other board as it was", () => {
    for (const id of ["work", "recipes", "media"]) {
      expect(ids(folder(id), false), id).toEqual(ids(folder(id), true));
    }
  });
});
