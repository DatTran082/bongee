// The camera and the mapping between viewport pixels and metres (the model's unit). The camera looks straight down
// −z at the plane z = 0 from DISTANCE away; the actors live on that plane, sized to their slots by scaling them, so
// their perspective is the same in every slot. Behind the plane (z < 0) the floating marks are farther away: a
// scroll moves them less on screen, which is the parallax.

/** Vertical field of view, degrees: a long lens, so an off-centre cup is not stretched. */
export const FOV = 24;
export const DISTANCE = 2;

/** Pixels per metre on the plane z = 0. */
export function pxPerMetre(viewportHeight: number): number {
  return viewportHeight / (2 * DISTANCE * Math.tan(((FOV / 2) * Math.PI) / 180));
}

/** The point of the plane z = 0 under a viewport pixel (origin at the viewport's centre, y up). */
export function toWorld(x: number, y: number, viewportWidth: number, viewportHeight: number): { x: number; y: number } {
  const scale = pxPerMetre(viewportHeight);
  return { x: (x - viewportWidth / 2) / scale, y: (viewportHeight / 2 - y) / scale };
}

/**
 * Scale that fits a box `width` × `height` metres into `room` × `size` pixels on the plane z = 0 (whichever side
 * binds; a cup is taller than wide, the set wider than tall).
 */
export function fitScale(
  box: { readonly width: number; readonly height: number },
  slot: { readonly size: number; readonly room: number },
  viewportHeight: number,
): number {
  const scale = pxPerMetre(viewportHeight);
  return Math.min(slot.size / (box.height * scale), slot.room / (box.width * scale));
}

/** Whether a box centred at `y` and `height` tall (viewport px) overlaps a viewport `viewportHeight` tall. */
export function isOnScreen(y: number, height: number, viewportHeight: number): boolean {
  return y + height / 2 > 0 && y - height / 2 < viewportHeight;
}

/** How much bigger the view is at depth z (z < 0: behind the plane) than at z = 0. */
export function depthFactor(z: number): number {
  return (DISTANCE - z) / DISTANCE;
}

/** The width and height of the view at depth z, metres. */
export function viewAt(z: number, viewportWidth: number, viewportHeight: number): { width: number; height: number } {
  const scale = pxPerMetre(viewportHeight) / depthFactor(z);
  return { width: viewportWidth / scale, height: viewportHeight / scale };
}
