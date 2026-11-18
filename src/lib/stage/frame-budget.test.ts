import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BUDGET, judge, quantile } from "./frame-budget.ts";

const frames = (count: number, ms: number) => Array.from({ length: count }, () => ms);

describe("quantile", () => {
  it("takes the nearest rank", () => {
    const samples = [5, 1, 4, 2, 3, 10, 9, 8, 7, 6];
    assert.equal(quantile(samples, 0.5), 5);
    assert.equal(quantile(samples, 0.9), 9);
    assert.equal(quantile(samples, 1), 10);
    assert.equal(quantile(samples, 0), 1);
  });

  it("is NaN without samples and leaves the samples unsorted", () => {
    assert.ok(Number.isNaN(quantile([], 0.5)));
    const samples = [3, 1, 2];
    quantile(samples, 0.5);
    assert.deepEqual(samples, [3, 1, 2]);
  });
});

describe("judge", () => {
  it("measures until the window has passed and enough frames came in", () => {
    assert.equal(judge(frames(200, 30), BUDGET.windowMs - 1), "measuring");
    assert.equal(judge(frames(BUDGET.minFrames - 1, 30), BUDGET.windowMs), "measuring");
  });

  it("keeps the tier when no more than the allowed share of frames is slow", () => {
    assert.equal(judge([...frames(90, 16.7), ...frames(10, 40)], BUDGET.windowMs), "keep");
  });

  it("steps down when too many frames are slow", () => {
    assert.equal(judge([...frames(85, 16.7), ...frames(15, 40)], BUDGET.windowMs), "step-down");
    assert.equal(judge(frames(60, 33.3), BUDGET.windowMs), "step-down");
  });
});
