import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { approach, clamp, needsRedraw, wrap } from "./motion.ts";

describe("approach", () => {
  it("covers 1 − 1/e of the way in one time constant", () => {
    const next = approach(0, 1, 100, 100);
    assert.ok(Math.abs(next - (1 - Math.exp(-1))) < 1e-12);
  });

  it("lands at once without a time constant, and stays without time", () => {
    assert.equal(approach(0, 5, 16, 0), 5);
    assert.equal(approach(2, 5, 0, 100), 2);
  });

  it("never overshoots", () => {
    let value = 0;
    for (let i = 0; i < 100; i++) value = approach(value, 1, 50, 100);
    assert.ok(value <= 1 && value > 0.999);
  });
});

describe("wrap", () => {
  it("folds a value into the half-open period around zero", () => {
    const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
    close(wrap(0, 10), 0);
    close(wrap(4.9, 10), 4.9);
    close(wrap(5, 10), -5);
    close(wrap(-5.1, 10), 4.9);
    close(wrap(27, 10), -3);
  });
});

describe("clamp", () => {
  it("keeps a value inside its bounds", () => {
    assert.deepEqual([clamp(-1, 0, 1), clamp(0.5, 0, 1), clamp(3, 0, 1)], [0, 0.5, 1]);
  });
});

describe("needsRedraw", () => {
  const still = { reduced: true, moving: false, dirty: false, scrolled: false, targetChanged: false };

  it("draws every frame while motion is allowed", () => {
    assert.equal(needsRedraw({ ...still, reduced: false }), true);
  });

  it("with reduced motion draws only for a change: an input, a scroll, an animation, a new target", () => {
    assert.equal(needsRedraw(still), false);
    assert.equal(needsRedraw({ ...still, dirty: true }), true);
    assert.equal(needsRedraw({ ...still, scrolled: true }), true);
    assert.equal(needsRedraw({ ...still, moving: true }), true);
    assert.equal(needsRedraw({ ...still, targetChanged: true }), true);
  });
});
