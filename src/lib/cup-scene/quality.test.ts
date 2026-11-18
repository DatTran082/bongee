import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { lowerTier, QUALITY, qualityFor } from "./quality.ts";

const desktop = { coarsePointer: false, width: 1440, cores: 8, memory: 8 };

describe("qualityFor", () => {
  it("draws everything on a desktop", () => {
    const q = qualityFor(desktop);
    assert.equal(q.tier, "full");
    assert.equal(q.dprMax, 2);
    assert.equal(q.shadows, true);
    assert.equal(q.idleFps, 60);
  });

  it("goes light on a phone: lower resolution, no shadows, 30 fps when idle", () => {
    const q = qualityFor({ ...desktop, coarsePointer: true, width: 390 });
    assert.equal(q.tier, "light");
    assert.equal(q.dprMax, 1.5);
    assert.equal(q.shadows, false);
    assert.equal(q.idleFps, 30);
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

describe("QUALITY", () => {
  it("names each preset after its own tier", () => {
    for (const [tier, quality] of Object.entries(QUALITY)) assert.equal(quality.tier, tier);
  });

  it("draws fewer pixels at each step down", () => {
    assert.ok(QUALITY.full.dprMax > QUALITY.light.dprMax);
    assert.ok(QUALITY.light.dprMax > QUALITY.low.dprMax);
  });
});

describe("lowerTier", () => {
  it("steps full to light to low, and low stays low", () => {
    assert.equal(lowerTier("full"), "light");
    assert.equal(lowerTier("light"), "low");
    assert.equal(lowerTier("low"), "low");
  });
});
