import { CupAnchor } from "@/components/cup-anchor";
import { sections } from "@/data/boongee";

/**
 * The 3D paper cup between the lookbook reel and the menu: a visual beat only, no words (owner, 21/11/2026: "ly 3D
 * chỉ mang tính chất visual và gây ấn tượng thị giác"). It stands alone (the same day: "không xếp 2 mô hình cạnh
 * nhau"; the open PP cup moved to the visit section) and has no scroll timeline ("bỏ logic scroll"): it floats in its
 * slot like every actor, and a drag turns it. Without script or without the 3D the band is not shown (globals.css,
 * the noscript style below). Decorative to assistive tech: the cup's own hit element (cup-stage.tsx) names it and
 * takes the keyboard.
 */
export function CupShowcase() {
  return (
    <div id={sections.cups} aria-hidden data-showcase className="relative py-10 md:py-16">
      <noscript>
        <style>{`[data-showcase]{display:none}`}</style>
      </noscript>
      <CupAnchor
        name="ly-paper"
        actor="paper"
        turn={-0.35}
        tilt={0.08}
        fill={0.86}
        className="mx-auto h-[60svh] w-full max-w-xl lg:h-[72svh]"
      />
    </div>
  );
}
