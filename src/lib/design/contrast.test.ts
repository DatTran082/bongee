import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { contrast, luminance } from "./contrast.ts";

describe("contrast", () => {
  it("spans 1 to 21", () => {
    assert.equal(contrast("#000000", "#FFFFFF"), 21);
    assert.equal(contrast("#777777", "#777777"), 1);
  });

  it("matches the brand's measured pairs", () => {
    assert.equal(contrast("#1E1A1C", "#FFFFFF"), 17.2);
    assert.equal(contrast("#1E1A1C", "#F5C4C4"), 11.1);
    assert.equal(contrast("#8A8D8F", "#FFFFFF"), 3.3);
  });

  it("rejects what is not a hex colour", () => {
    assert.throws(() => luminance("pink"));
  });
});
