import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { depthFactor, DISTANCE, fitScale, isOnScreen, pxPerMetre, toWorld, viewAt } from "./fit.ts";

const close = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≠ ${b}`);

describe("fit", () => {
  it("maps the viewport's centre to the origin and y upward", () => {
    const centre = toWorld(500, 400, 1000, 800);
    close(centre.x, 0);
    close(centre.y, 0);
    const corner = toWorld(0, 0, 1000, 800);
    assert.ok(corner.x < 0 && corner.y > 0);
    close(corner.y, 400 / pxPerMetre(800));
  });

  it("fits a tall box by its height and a wide box by its width", () => {
    const ppm = pxPerMetre(800);
    const cup = fitScale({ width: 0.1, height: 0.2 }, { size: 240, room: 320 }, 800);
    close(cup * 0.2 * ppm, 240); // the height binds: 240 px tall, 120 px wide
    const set = fitScale({ width: 0.45, height: 0.33 }, { size: 240, room: 320 }, 800);
    close(set * 0.45 * ppm, 320); // the width binds: 320 px wide
    assert.ok(set * 0.33 * ppm < 240);
  });

  it("tells whether a box overlaps the viewport", () => {
    assert.equal(isOnScreen(400, 300, 800), true);
    assert.equal(isOnScreen(-100, 300, 800), true); // its lower half is in
    assert.equal(isOnScreen(-151, 300, 800), false);
    assert.equal(isOnScreen(951, 300, 800), false);
  });

  it("sees more of the world behind the plane", () => {
    assert.equal(depthFactor(0), 1);
    close(depthFactor(-DISTANCE), 2);
    const near = viewAt(0, 1000, 800);
    const far = viewAt(-DISTANCE, 1000, 800);
    close(far.height, near.height * 2);
    close(near.width / near.height, 1000 / 800);
  });
});
