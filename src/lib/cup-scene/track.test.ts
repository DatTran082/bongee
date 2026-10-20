import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { type AnchorRect, cupTarget, DWELL, ease, targetsByActor } from "./track.ts";

const slot = (name: string, top: number, extra: Partial<AnchorRect> = {}): AnchorRect => ({
  name,
  actor: "pp",
  left: 100,
  top,
  width: 400,
  height: 300,
  fill: 0.8,
  turn: 0,
  tilt: 0,
  lid: 0,
  ...extra,
});

describe("ease", () => {
  it("dwells at both ends and is smooth between", () => {
    assert.equal(ease(0, false), 0);
    assert.equal(ease(DWELL, false), 0);
    assert.equal(ease(0.5, false), 0.5);
    assert.equal(ease(1 - DWELL, false), 1);
    assert.equal(ease(1, false), 1);
    assert.ok(ease(0.3, false) > 0 && ease(0.3, false) < 0.5);
  });

  it("clamps progress outside 0 … 1", () => {
    assert.equal(ease(-2, false), 0);
    assert.equal(ease(3, false), 1);
  });

  it("switches anchor halfway with reduced motion, without a flight", () => {
    assert.equal(ease(0.49, true), 0);
    assert.equal(ease(0.5, true), 1);
  });
});

describe("cupTarget", () => {
  const vh = 800;

  it("is null while no anchor is laid out", () => {
    assert.equal(cupTarget([], vh, false), null);
    assert.equal(cupTarget([slot("hidden", 0, { width: 0, height: 0 })], vh, false), null);
  });

  it("rests in the first anchor while it is still below the middle of the viewport", () => {
    const target = cupTarget([slot("hero", 600), slot("story", 2000)], vh, false);
    assert.ok(target);
    assert.deepEqual([target.from, target.to, target.resting, target.flight], ["hero", "hero", true, 0]);
    assert.deepEqual([target.x, target.y, target.size, target.room], [300, 750, 240, 320]);
  });

  it("rests in the last anchor once it has passed the middle", () => {
    const target = cupTarget([slot("hero", -2000), slot("visit", 100)], vh, false);
    assert.ok(target);
    assert.deepEqual([target.from, target.to, target.resting], ["visit", "visit", true]);
  });

  it("flies from the anchor above the middle to the next one below, blending every part of the pose", () => {
    // centres at 150 and 650: the middle (400) is halfway
    const from = slot("story", 0, { left: 0, turn: 0, lid: 1, tilt: 0.2 });
    const to = slot("menu", 500, { left: 800, turn: 1, lid: 0, fill: 0.5, tilt: 0.6 });
    const target = cupTarget([from, to], vh, false);
    assert.ok(target);
    assert.deepEqual([target.from, target.to, target.resting], ["story", "menu", false]);
    assert.deepEqual([target.x, target.y, target.turn, target.lid, target.tilt], [600, 400, 0.5, 0.5, 0.4]);
    assert.equal(target.size, (240 + 150) / 2);
    assert.equal(target.room, (320 + 200) / 2);
    assert.ok(Math.abs(target.flight - 1) < 1e-9);
  });

  it("skips anchors hidden by the layout and sorts the rest by position", () => {
    const anchors = [
      slot("menu-wide", 500, { width: 0, height: 0 }),
      slot("menu", 500, { left: 800 }),
      slot("story", 0),
    ];
    const target = cupTarget(anchors, vh, false);
    assert.ok(target);
    assert.deepEqual([target.from, target.to], ["story", "menu"]);
  });

  it("picks the right pair out of a chain of anchors", () => {
    const anchors = [slot("hero", -1500), slot("story", -700), slot("menu", 300), slot("offers", 2000)];
    // centres at −1350, −550, 450, 2150: the middle (400) lies between story and menu, almost at menu
    const target = cupTarget(anchors, vh, false);
    assert.ok(target);
    assert.deepEqual([target.from, target.to], ["story", "menu"]);
    assert.ok(target.y > 440 && target.y <= 450);
  });

  it("rests exactly through the dwell at both ends", () => {
    const from = slot("a", -150); // centre 0
    const to = slot("b", 850); // centre 1000
    const at = (middle: number) => cupTarget([from, to], middle * 2, false);
    assert.equal(at(DWELL * 1000 - 1)?.resting, true);
    assert.equal(at(DWELL * 1000 + 1)?.resting, false);
    assert.equal(at((1 - DWELL) * 1000 - 1)?.resting, false);
    assert.equal(at((1 - DWELL) * 1000 + 1)?.resting, true);
  });

  it("keeps the cup on a sticky slot that holds its place while the page scrolls under it", () => {
    // the slot's viewport box is the same at two scroll positions (sticky), so the cup does not move
    const stuck = slot("menu", 250);
    const before = cupTarget([stuck, slot("offers", 3000)], vh, false);
    const after = cupTarget([stuck, slot("offers", 2400)], vh, false);
    assert.ok(before && after);
    assert.deepEqual([before.x, before.y, before.resting], [after.x, after.y, after.resting]);
  });

  it("jumps instead of flying with reduced motion", () => {
    const anchors = [slot("story", 0), slot("menu", 500, { left: 800 })];
    const target = cupTarget(anchors, vh, true);
    assert.ok(target);
    assert.deepEqual([target.x, target.flight, target.resting], [1000, 0, true]);
  });

  it("does not divide by zero when two anchors share a centre", () => {
    const target = cupTarget([slot("a", 0), slot("b", 0, { left: 900 })], vh, false);
    assert.ok(target);
    assert.equal(target.resting, true);
  });
});

describe("targetsByActor", () => {
  it("tracks each actor along its own anchors only", () => {
    const anchors = [
      slot("hero", -300, { actor: "set" }),
      slot("story", 100, { actor: "pp" }),
      slot("offers-pp", 1500, { actor: "pp", left: 0 }),
      slot("offers-paper", 1500, { actor: "paper", left: 500 }),
      slot("visit", 3000, { actor: "paper" }),
    ];
    const targets = targetsByActor(anchors, 800, false);
    assert.deepEqual(Object.keys(targets).sort(), ["paper", "pp", "set"]);
    assert.deepEqual([targets.set?.from, targets.set?.resting], ["hero", true]); // its only anchor
    assert.deepEqual([targets.pp?.from, targets.pp?.to], ["story", "offers-pp"]);
    assert.deepEqual([targets.paper?.from, targets.paper?.resting, targets.paper?.x], ["offers-paper", true, 700]);
  });

  it("maps an actor whose anchors are all hidden to null", () => {
    const targets = targetsByActor([slot("a", 0, { actor: "set", width: 0, height: 0 })], 800, false);
    assert.deepEqual(targets, { set: null });
  });
});
