import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { facetPoint } from "./facet-math.ts";

const close = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≠ ${b}`);

describe("facetPoint", () => {
  it("keeps the polygon's corners on the circle", () => {
    for (let k = 0; k < 12; k++) {
      const a = (k * 2 * Math.PI) / 12;
      const [x, z] = facetPoint(Math.cos(a) * 0.04, Math.sin(a) * 0.04, 12);
      close(Math.hypot(x, z), 0.04);
      close(Math.atan2(z, x), Math.atan2(Math.sin(a), Math.cos(a)));
    }
  });

  it("pulls an edge's middle in to the polygon's inner radius", () => {
    const a = Math.PI / 12; // halfway between the first two corners of 12
    const [x, z] = facetPoint(Math.cos(a), Math.sin(a), 12);
    close(Math.hypot(x, z), Math.cos(Math.PI / 12));
  });

  it("puts every point of a circle on a straight edge", () => {
    // three points between two corners lie on one line
    const pts = [0.1, 0.25, 0.4].map((t) => facetPoint(Math.cos(t), Math.sin(t), 12));
    const cross = (pts[1][0] - pts[0][0]) * (pts[2][1] - pts[0][1]) - (pts[1][1] - pts[0][1]) * (pts[2][0] - pts[0][0]);
    close(cross, 0, 1e-12);
  });

  it("leaves the axis alone and keeps the angle", () => {
    assert.deepEqual(facetPoint(0, 0, 12), [0, 0]);
    const [x, z] = facetPoint(-0.3, 0.2, 8);
    close(Math.atan2(z, x), Math.atan2(0.2, -0.3));
  });
});
