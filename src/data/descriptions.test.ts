import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { DESCRIPTIONS, dishDescription } from "./descriptions.ts";

const menu = JSON.parse(readFileSync(new URL("./odoo/menu.json", import.meta.url), "utf8")) as {
  groups: { title: string; items: { name: string }[] }[];
};
const onTill = menu.groups.flatMap((group) => group.items.map((item) => item.name));

describe("dish descriptions", () => {
  it("cover every dish on the till", () => {
    assert.deepEqual(
      onTill.filter((name) => !DESCRIPTIONS[name]),
      [],
    );
  });

  it("describe only dishes on the till (a renamed or removed dish leaves none behind)", () => {
    assert.deepEqual(
      Object.keys(DESCRIPTIONS).filter((name) => !onTill.includes(name)),
      [],
    );
  });

  it("stay short: at most two sentences and 160 characters, no price", () => {
    for (const [name, text] of Object.entries(DESCRIPTIONS)) {
      assert.ok(text.length <= 160, `${name}: ${text.length} characters`);
      assert.ok(text.split(/[.!?](?:\s|$)/).filter(Boolean).length <= 2, `${name}: more than two sentences`);
      assert.doesNotMatch(text, /\d[\d.]*\s?(?:K\b|đ|₫)/u, `${name}: a price`);
    }
  });

  it("fall back to the plain line for a dish without one", () => {
    assert.equal(dishDescription("Món mới", "Trà sữa"), "Trà sữa");
    assert.equal(dishDescription("Bạch Lan Hoa", "Trà sữa bạch lan hoa"), DESCRIPTIONS["Bạch Lan Hoa"]);
  });
});
