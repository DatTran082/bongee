import { CupAnchor } from "@/components/cup-anchor";
import { sections } from "@/data/boongee";

/** Each cup's resting pose in its slot: turned a little toward the other cup. */
const SLOTS = [
  { actor: "paper", turn: -0.35, tilt: 0.08 },
  { actor: "pp", turn: 0.35, tilt: 0.08 },
] as const;

/**
 * The two 3D cups between the hero and the menu, the paper cup and the frosted PP cup side by side: a visual beat
 * only, no words (owner, 21/11/2026: "ly 3D chỉ mang tính chất visual và gây ấn tượng thị giác"; the cups' names,
 * sizes and lines were taken out the same day). With motion allowed the band is a few viewports tall and its frame
 * sticks (CSS sticky, no GSAP pin: nothing reflows while it holds) while the page's scroll timeline
 * (src/components/scroll-motion.tsx) plays through it. With reduced motion it is one screen of the two cups standing
 * still; without script or without the 3D it is not shown (globals.css, the noscript style below). Decorative to
 * assistive tech: each cup's own hit element (cup-stage.tsx) names it and takes the keyboard.
 */
export function CupShowcase() {
  return (
    <div
      id={sections.cups}
      aria-hidden
      data-showcase
      className="relative motion-safe:h-[240svh] lg:motion-safe:h-[280svh]"
    >
      <noscript>
        <style>{`[data-showcase]{display:none}`}</style>
      </noscript>
      <div
        data-showcase-frame
        className="top-0 flex h-svh items-center overflow-hidden pt-14 motion-safe:sticky md:pt-16"
      >
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-3 px-4 sm:px-6 lg:gap-8">
          {SLOTS.map((slot) => (
            <CupAnchor
              key={slot.actor}
              name={`ly-${slot.actor}`}
              actor={slot.actor}
              turn={slot.turn}
              tilt={slot.tilt}
              fill={0.86}
              className="h-[62svh] w-full lg:h-[72svh]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
