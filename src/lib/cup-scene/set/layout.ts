// Where everything stands in the cover-photo set, in metres (the cup GLB's unit), after the approved cover photo
// and its measured layout (brandkit/lookbook/prompts-anh-bia.md, "Bố cục"): the open cup with its cream dome on a
// granite block, the lidded cup behind and to the right on a tall log, a short log behind it, a white lily on the
// tall log's front edge, a curly stem with a round bud over the block on the left, a vine with leaves and white
// jasmine on the far right. In the photo the block and the logs run out of the frame; here the set floats, so they
// end at FOOT, a little under the block's top. y = 0 is the top of the block; +z faces the viewer.

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

/** Outline of the block's flat top (x, z), front left first, clockwise seen from above; it keeps clear of the logs. */
export const STONE_TOP: ReadonlyArray<readonly [number, number]> = [
  [-0.215, 0.06],
  [-0.195, -0.035],
  [-0.13, -0.07],
  [-0.035, -0.072],
  [0.005, -0.03],
  [0.065, 0.025],
  [0.05, 0.105],
  [-0.06, 0.125],
  [-0.17, 0.11],
];

/** The underside of the floating set: the block's and the logs' feet. */
export const FOOT = -0.065;

export const LOGS: readonly LogSpec[] = [
  { x: 0.07, z: -0.055, radius: 0.046, top: 0.095, seed: 11 },
  { x: 0.135, z: -0.005, radius: 0.03, top: 0.058, seed: 23 },
];

export const OPEN_CUP: Placement = { x: -0.062, y: 0, z: 0.045, turn: 0 };
export const LIDDED_CUP: Placement = { x: LOGS[0].x, y: LOGS[0].top, z: LOGS[0].z, turn: 0 };

/** The lily lies on the tall log's top at its front left edge, beside the lidded cup, its face to the viewer. */
export const LILY: Placement = { x: 0.027, y: LOGS[0].top + 0.006, z: -0.022, turn: 0.5 };
/** Where the lily's face points (its axis): out over the log's edge, to the front left and up. */
export const LILY_FACING = [-0.5, 0.5, 0.7] as const;

/** The curly stem: from the block's top by the open cup's foot, out to the left and up, to its round bud. */
export const BUD_STEM: ReadonlyArray<readonly [number, number, number]> = [
  [-0.04, -0.004, 0.085],
  [-0.075, 0.004, 0.09],
  [-0.108, 0.028, 0.08],
  [-0.13, 0.062, 0.065],
  [-0.138, 0.095, 0.055],
  [-0.13, 0.118, 0.05],
];
export const BUD = { radius: 0.0068, spikes: 0.0014 } as const;

/** The vine: a near-vertical stem on the far right, behind the logs, from the foot up past the lidded cup's lid. */
export const VINE = {
  x: 0.19,
  z: -0.045,
  top: 0.275,
  /** leaves hang to the right from these heights (metres), drooping; each (height, length, droop radians) */
  leaves: [
    [0.235, 0.034, 0.9],
    [0.205, 0.03, 1.1],
    [0.165, 0.028, 1.3],
    [0.115, 0.024, 1.2],
  ],
  /** white double jasmine on short side stems: (height, reach right, drop) */
  flowers: [
    [0.19, 0.03, 0.02],
    [0.145, 0.022, 0.03],
    [0.06, 0.018, 0.012],
  ],
} as const;
