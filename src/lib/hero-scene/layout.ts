// Where everything stands, in metres (the cup GLB's unit), after the approved cover photo and its measured layout
// (brandkit/lookbook/prompts-anh-bia.md, "Bố cục"): the open cup with its cream dome on a granite block, the lidded
// cup behind and to the right on a tall log, a short log behind it, a white lily on the tall log's front edge. The
// photo's two plant stems are left out. y = 0 is the top of the stone; +z faces the camera.

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

/** The vertical axis the set turns about when dragged: the middle of its footprint. */
export const AXIS = { x: -0.03, z: 0.015 } as const;

/** Outline of the stone's flat top (x, z), front left first, clockwise seen from above; it keeps clear of the logs. */
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

/** How far the stone and the logs run down, well below the bottom of the frame. */
export const FOOT = -0.42;

export const LOGS: readonly LogSpec[] = [
  { x: 0.07, z: -0.055, radius: 0.046, top: 0.095, seed: 11 },
  { x: 0.135, z: -0.005, radius: 0.03, top: 0.058, seed: 23 },
];

export const OPEN_CUP: Placement = { x: -0.062, y: 0, z: 0.045, turn: 0 };
export const LIDDED_CUP: Placement = { x: LOGS[0].x, y: LOGS[0].top, z: LOGS[0].z, turn: 0 };

/** The lily lies on the tall log's top at its front left edge, beside the lidded cup, its face to the camera. */
export const LILY: Placement = { x: 0.027, y: LOGS[0].top + 0.006, z: -0.022, turn: 0.5 };
/** Where the lily's face points (its axis): out over the log's edge, to the front left and up. */
export const LILY_FACING = [-0.5, 0.5, 0.7] as const;

/** Eye level with the cups (a little of the cream's top shows), a long lens, straight on. */
export const CAMERA = { distance: 1.4, height: 0.24, target: 0.12 } as const;

/**
 * What the camera keeps in view at every turn: the set's width round the axis and the height from just below the
 * stone's top to above the lid. The stone and the logs run on out of the frame, as in the photo.
 */
export const FRAME = { width: 0.42, height: 0.34 } as const;
