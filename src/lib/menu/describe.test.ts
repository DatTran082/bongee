import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { describeDish } from "./describe.ts";

const milk = ["Sữa nước", "Đường cát", "Sữa đặc"];

describe("describeDish", () => {
  it("names a milk tea by its tea", () => {
    assert.equal(describeDish([...milk, "Cốt trà dành dành"]), "Trà sữa dành dành");
    assert.equal(describeDish([...milk, "Cốt trà trúc"]), "Trà sữa trúc");
  });

  it("adds what is on top, after the tea", () => {
    assert.equal(
      describeDish([...milk, "Cốt trà bạch lan hoa", "Kem Bông", "Vụn hoa"]),
      "Trà sữa bạch lan hoa, kem bông, vụn hoa",
    );
  });

  it("names a fruit tea by its tea and its fruit, jam and syrup words dropped", () => {
    assert.equal(
      describeDish(["Cốt trà trúc", "Nho tươi", "Mứt nho xanh", "Đường nước", "Đường hoa quả", "Tắc"]),
      "Trà trúc, nho tươi, nho xanh, tắc",
    );
    assert.equal(
      describeDish(["Cốt trà olong bạch đào", "Mứt đào hồng", "Đường nước", "Sốt đào hồng", "Đá", "Kem cheese"]),
      "Trà olong bạch đào, đào hồng, kem cheese",
    );
  });

  it("names a coffee by its coffee", () => {
    assert.equal(
      describeDish(["Sữa tiệt trùng", "Đường nước", "Rich", "Syrup hạnh nhân", "Cà phê phin"]),
      "Cà phê phin, sữa, hạnh nhân",
    );
  });

  it("says nothing when the recipe says nothing (no recipe, or only sugar, ice and milk)", () => {
    assert.equal(describeDish([]), null);
    assert.equal(describeDish(["Đường cát", "Đá"]), null);
  });

  it("keeps it short: at most four parts", () => {
    const long = describeDish(["Cốt trà trúc", "Nho tươi", "Xoài", "Đào", "Tắc", "Bưởi"]) ?? "";
    assert.ok(long.split(", ").length <= 4, long);
  });
});

describe("describeDish edge cases", () => {
  it("keeps coconut milk (nước cốt dừa) and jelly, which are part of the drink", () => {
    assert.equal(describeDish(["Cốt trà nhài", "Nước cốt dừa", "Thạch trà"]), "Trà nhài, nước cốt dừa, thạch trà");
  });
});

describe("describeDish cleans stock names for a menu", () => {
  it("drops packaging words and how a fruit is bought (can, puree, juice, segments)", () => {
    assert.equal(
      describeDish(["Cốt trà hoa nhài", "Quất hồng bì", "Nước ép xoài xanh", "Xoài xanh", "Hồng bì"]),
      "Trà hoa nhài, quất hồng bì, xoài xanh",
    );
    assert.equal(describeDish(["Coldbrew", "Bưởi hồng", "Bưởi Boduo"]), "Coldbrew, bưởi hồng");
    assert.equal(describeDish(["Coldbrew", "Puree khế", "Tép bưởi lon"]), "Coldbrew, khế, bưởi");
  });
});
