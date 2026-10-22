import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { qualityFor } from "./quality.ts";

const desktop = { coarsePointer: false, width: 1440, cores: 8, memory: 8 };

describe("qualityFor", () => {
  it("draws everything on a desktop", () => {
    const q = qualityFor(desktop);
    assert.equal(q.tier, "full");
    assert.equal(q.dprMax, 2);
    assert.equal(q.shadows, true);
    assert.equal(q.idleFps, 60);
  });

  it("goes light on a phone: lower resolution, no shadows, 30 fps when idle, fewer petals", () => {
    const q = qualityFor({ ...desktop, coarsePointer: true, width: 390 });
    assert.equal(q.tier, "light");
    assert.equal(q.dprMax, 1.5);
    assert.equal(q.shadows, false);
    assert.equal(q.idleFps, 30);
    assert.ok(q.petals < qualityFor(desktop).petals);
  });

  it("goes light on a weak laptop too, and lighter still on a very weak device", () => {
    assert.equal(qualityFor({ ...desktop, cores: 4 }).tier, "light");
    assert.equal(qualityFor({ ...desktop, memory: 4 }).tier, "light");
    const low = qualityFor({ ...desktop, coarsePointer: true, width: 360, cores: 2, memory: 2 });
    assert.equal(low.tier, "low");
    assert.ok(low.dprMax < 1.5);
  });

  it("does not mistake an unknown memory size for a small one", () => {
    assert.equal(qualityFor({ ...desktop, memory: undefined }).tier, "full");
  });
});
