/**
 * Moves a point (x, z) about the vertical axis from its circle onto a regular `n`-sided polygon with the same corners:
 * the circle's points between two corners land on the straight edge joining them, at the same angle. A smooth
 * revolved cup comes out with `n` flat sides while every vertex, UV and print stays where it was round the cup.
 */
export function facetPoint(x: number, z: number, n: number): [number, number] {
  const r = Math.hypot(x, z);
  if (r === 0) return [x, z];
  const step = (2 * Math.PI) / n;
  const angle = Math.atan2(z, x);
  const edge = (Math.floor(angle / step) + 0.5) * step; // the angle of the middle of the edge this point is on
  const k = Math.cos(step / 2) / Math.cos(angle - edge);
  return [x * k, z * k];
}
