import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFlags } from "./flags.ts";

describe("readFlags", () => {
  it("is all off without a query string", () => {
    assert.deepEqual(readFlags(""), { forceWebGL: false, tier: null, inspect: false });
  });

  it("reads each switch, with or without a value", () => {
    assert.deepEqual(readFlags("?webgl&tier=light&inspect"), { forceWebGL: true, tier: "light", inspect: true });
    assert.equal(readFlags("?webgl=1").forceWebGL, true);
  });

  it("ignores a tier it does not know", () => {
    assert.equal(readFlags("?tier=ultra").tier, null);
    assert.equal(readFlags("?tier=").tier, null);
  });
});
