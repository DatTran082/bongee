import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Lean, Strap } from "./steppers.ts";

describe("Strap", () => {
  it("swings open over its time and lands exactly", () => {
    const strap = new Strap(2, 400);
    assert.equal(strap.angle, 0);
    assert.equal(strap.toggle(false), true);
    assert.equal(strap.step(200), true);
    assert.ok(strap.angle > 0 && strap.angle < 2);
    assert.equal(strap.step(300), true); // the last step, clamped to the goal
    assert.equal(strap.step(16), false);
    assert.equal(strap.angle, 2);
  });

  it("lands at once when asked to, and closes again", () => {
    const strap = new Strap(2, 400);
    assert.equal(strap.toggle(true), true);
    assert.equal(strap.step(16), false);
    assert.equal(strap.angle, 2);
    assert.equal(strap.toggle(true), false);
    assert.equal(strap.angle, 0);
  });
});

describe("Lean", () => {
  it("leans against a scroll and settles back", () => {
    const lean = new Lean(0.05, 0.14, 90);
    assert.equal(lean.update(0, 16, false), 0); // the first sample sets the baseline
    const leaning = lean.update(64, 16, false); // 4 px/ms downward
    assert.ok(leaning > 0 && leaning <= 0.14);
    assert.equal(lean.moving, true);
    let settled = leaning;
    for (let i = 0; i < 60; i++) settled = lean.update(64, 16, false);
    assert.ok(Math.abs(settled) < 1e-3);
  });

  it("is flat with reduced motion", () => {
    const lean = new Lean(0.05, 0.14, 90);
    lean.update(0, 16, true);
    assert.equal(lean.update(500, 16, true), 0);
    assert.equal(lean.moving, false);
  });
});
