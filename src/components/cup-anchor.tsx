import type { ReactNode } from "react";
import type { ActorName } from "@/lib/cup-scene/actors";

/**
 * A slot in a section's layout for one of the 3D stage's actors (src/components/cup-stage.tsx): the cover photo's
 * set, the frosted PP cup or the lidded paper cup. An empty box the actor flies to and rests in as the page
 * scrolls, with the pose it takes there. Hidden slots (a breakpoint's `hidden`) are skipped, so a section can offer
 * one slot for phones and another for wide screens. The slot is empty on purpose: while the actor rests here it
 * takes the pointer, and nothing else may be under the finger. If the stage cannot be shown, every slot but the
 * hero's collapses, with the `cup-grid` / `cup-row` wrappers around them (`.cup-failed` in globals.css), and the
 * hero's shows the cover photo. `children` is for the hero's <noscript> photo only.
 */
export function CupAnchor({
  name,
  actor = "pp",
  turn = 0,
  tilt = 0,
  lid = 0,
  fill = 0.82,
  className = "",
  children,
}: {
  name: string;
  actor?: ActorName;
  /** turn about the vertical axis, radians (0: the printed front faces the viewer) */
  turn?: number;
  /** lean, radians (positive: the top comes toward the viewer) */
  tilt?: number;
  /** 1: the lid lifted off the cup (the PP cup only) */
  lid?: number;
  /** share of the slot's height and width the actor may take */
  fill?: number;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      data-cup-anchor={name}
      data-cup-actor={actor}
      data-cup-turn={turn}
      data-cup-tilt={tilt}
      data-cup-lid={lid}
      data-cup-fill={fill}
      className={`cup-anchor ${className}`}
    >
      {children}
    </div>
  );
}
