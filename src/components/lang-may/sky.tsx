/**
 * The hero's painted sky (Làng Mây, brandkit-ghibli): a morning-blue gradient into the page's cream, nothing in it
 * (the owner took the clouds out, 22/10/2026). It sits behind the 3D stage (z-index −20 in main's stacking context,
 * the canvas is at −10), so the floating cups stand in front of it. Decoration only.
 */
export function Sky() {
  return <div aria-hidden className="sky pointer-events-none absolute inset-0 -z-20" />;
}
