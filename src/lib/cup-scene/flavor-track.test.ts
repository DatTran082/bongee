import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { flavorState, restProgress } from "./flavor-track.ts";

const close = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≠ ${b}`);

describe("flavorState", () => {
  it("rests on each flavour at its snap point, the cup facing front", () => {
    for (let i = 0; i < 5; i++) {
      const s = flavorState(restProgress(i, 5), 5, false);
      assert.equal(s.current, i);
      assert.equal(s.cups[i], 1);
      assert.equal(s.toppings[i], 1);
      assert.equal(s.cups.filter((c) => c > 0).length, 1);
      close(Math.cos(s.turn), 1);
    }
  });

  it("swaps the cups without overlap and cross-fades the toppings halfway between two flavours", () => {
    const s = flavorState(0.125, 5, false); // halfway from flavour 0 to 1
    assert.deepEqual([s.from, s.to], [0, 1]);
    close(s.blend, 0.5);
    close(s.cups[0], 0);
    close(s.cups[1], 0);
    close(s.toppings[0] + s.toppings[1], 1);
    close(s.turn, Math.PI); // half a turn: the back of the cup
  });

  it("never shows two cups at once", () => {
    for (let p = 0; p <= 1; p += 0.01) {
      const s = flavorState(p, 5, false);
      assert.ok(s.cups.filter((c) => c > 1e-9).length <= 1, `two cups at ${p}`);
    }
  });

  it("turns one way only as the page scrolls down", () => {
    let last = -Infinity;
    for (let p = 0; p <= 1; p += 0.01) {
      const { turn } = flavorState(p, 5, false);
      assert.ok(turn >= last - 1e-9);
      last = turn;
    }
  });

  it("with reduced motion changes flavour halfway, at once, without turning", () => {
    assert.equal(flavorState(0.12, 5, true).current, 0);
    const after = flavorState(0.13, 5, true);
    assert.equal(after.current, 1);
    assert.equal(after.cups[1], 1);
    close(Math.cos(after.turn), 1);
  });

  it("clamps the progress and copes with one flavour or none", () => {
    assert.equal(flavorState(-1, 5, false).current, 0);
    assert.equal(flavorState(2, 5, false).current, 4);
    assert.equal(flavorState(Number.NaN, 5, false).current, 0);
    assert.deepEqual(flavorState(0.5, 1, false).cups, [1]);
    assert.equal(restProgress(3, 1), 0);
  });
});
