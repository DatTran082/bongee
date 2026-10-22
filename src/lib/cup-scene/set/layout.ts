// Where everything stands in the cover-photo set, in metres (the cup GLB's unit), after the approved cover photo
// and its measured layout (brandkit/lookbook/prompts-anh-bia.md, "Bố cục"): the open cup with its foam on a pale
// boulder, the lidded cup behind and to the right on a tall log, a short log behind it. In the photo the block and
// the logs run out of the frame; here the set floats, so they end at FOOT, a little under the boulder's top. y = 0
// is the top of the boulder; +z faces the viewer.

export interface LogSpec {
  readonly x: number;
  readonly z: number;
  readonly radius: number;
  /** height of the sawn top */
  readonly top: number;
  readonly seed: number;
}

export interface Placement {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  /** turn about the vertical axis, radians */
  readonly turn: number;
}

/** The underside of the floating set: the block's and the logs' feet. */
export const FOOT = -0.065;

export const LOGS: readonly LogSpec[] = [
  { x: 0.07, z: -0.055, radius: 0.046, top: 0.095, seed: 11 },
  { x: 0.135, z: -0.005, radius: 0.03, top: 0.058, seed: 23 },
];

export const OPEN_CUP: Placement = { x: -0.062, y: 0, z: 0.045, turn: 0 };
export const LIDDED_CUP: Placement = { x: LOGS[0].x, y: LOGS[0].top, z: LOGS[0].z, turn: 0 };
