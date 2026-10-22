import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { claimFlavor, flavorScroll, glideStep, setFlavorScroll } from "./flavor-scroll.ts";

describe("flavorScroll", () => {
  it("lets the menu hold the carousel's cup: the carousel's writes wait until it lets go", () => {
    setFlavorScroll({ progress: 0.25 }, "carousel");
    claimFlavor("menu", true);
    setFlavorScroll({ progress: 0.9 }, "carousel");
    assert.equal(flavorScroll().progress, 0.25);
    setFlavorScroll({ progress: 0.5 }, "menu");
    assert.equal(flavorScroll().progress, 0.5);
    claimFlavor("menu", false);
    setFlavorScroll({ progress: 0.75 }, "carousel");
    assert.equal(flavorScroll().progress, 0.75);
  });

  it("always takes the presence, whoever holds the cup", () => {
    claimFlavor("menu", true);
    setFlavorScroll({ presence: 0.4 }, "carousel");
    assert.equal(flavorScroll().presence, 0.4);
    claimFlavor("menu", false);
  });

  it("glides from one flavour to another, easing in and out", () => {
    assert.equal(glideStep(0.25, 0.75, 0), 0.25);
    assert.equal(glideStep(0.25, 0.75, 1), 0.75);
    assert.equal(glideStep(0.25, 0.75, 0.5), 0.5);
    assert.ok(glideStep(0, 1, 0.1) < 0.1, "starts slow");
    assert.ok(glideStep(0, 1, 0.9) > 0.9, "ends slow");
  });
});
