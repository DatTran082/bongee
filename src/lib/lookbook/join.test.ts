import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { joinLookbook } from "./join.ts";

const photo = { full: "/menu/lookbook/a.1.webp", thumb: "/menu/lookbook/a-thumb.1.webp", width: 1200, height: 1500 };

const groups = [
  {
    title: "Trà sữa hương hoa",
    items: [
      { name: "Bạch Lan Hoa", prices: [40], note: "Trà sữa bạch lan hoa" },
      { name: "Thanh Trúc", prices: [40] },
    ],
  },
  { title: "Nhóm lạ", items: [{ name: "Món lạ", prices: [10] }] },
];

describe("joinLookbook", () => {
  it("keeps the till's groups and dishes in order, with Odoo's names, prices and notes", () => {
    const [group] = joinLookbook(groups, {}, { "Trà sữa hương hoa": "huong-hoa" }, {});
    assert.equal(group.id, "huong-hoa");
    assert.deepEqual(
      group.items.map((i) => [i.name, i.prices, i.note]),
      [
        ["Bạch Lan Hoa", [40], "Trà sữa bạch lan hoa"],
        ["Thanh Trúc", [40], undefined],
      ],
    );
  });

  it("gives each dish its photo by name, and none when it has no photo", () => {
    const [group] = joinLookbook(groups, { "Bạch Lan Hoa": photo }, { "Trà sữa hương hoa": "huong-hoa" }, {});
    assert.deepEqual(group.items[0].photo, photo);
    assert.equal(group.items[1].photo, null);
  });

  it("leaves out a group the page has no id for", () => {
    assert.equal(joinLookbook(groups, {}, { "Trà sữa hương hoa": "huong-hoa" }, {}).length, 1);
  });

  it("attaches the group's mark when there is one", () => {
    const marks = { "Trà sữa hương hoa": "/menu/mark/hoa.svg" };
    const [group] = joinLookbook(groups, {}, { "Trà sữa hương hoa": "huong-hoa" }, marks);
    assert.equal(group.mark, "/menu/mark/hoa.svg");
    assert.equal(joinLookbook(groups, {}, { "Trà sữa hương hoa": "huong-hoa" }, {})[0].mark, null);
  });

  it("drops a group whose dishes are all gone", () => {
    const empty = [{ title: "Trà sữa hương hoa", items: [] }];
    assert.equal(joinLookbook(empty, {}, { "Trà sữa hương hoa": "huong-hoa" }, {}).length, 0);
  });
});
