"use client";

import { useEffect, useRef, useState } from "react";
import { CupAnchor } from "@/components/cup-anchor";
import { flavorsIntro, sections } from "@/data/boongee";
import { flavors } from "@/data/flavors";
import { setFlavorScroll } from "@/lib/cup-scene/flavor-scroll";
import { flavorState, restProgress } from "@/lib/cup-scene/flavor-track";

/** Where the background tone starts to come in before the pin, and goes out after it (ScrollTrigger positions). */
const PRESENCE = { enter: ["top 70%", "top top"], leave: ["bottom bottom", "bottom 30%"] } as const;
/** Scrub smoothing (s): the cup and the words lag the scroll a little, as if they had weight. */
const SCRUB = 0.6;

/**
 * Flavour carousel: one flavour per menu category. With script, the section is as tall as one viewport per flavour
 * and its inside stays pinned (CSS sticky) while GSAP's ScrollTrigger turns the scroll into the carousel's progress:
 * the 3D cup (the stage's `flavor` actor, src/lib/cup-scene/flavor-rig.ts) turns once round its axis per flavour
 * and changes for the next flavour's cup, its toppings fade from one flavour's to the next, the stage's ground
 * moves through the brand's pinks and creams, the words cross-fade, and the scroll snaps to each flavour. Without
 * script the flavours are a plain list. The dots jump to a flavour (keyboard too).
 */
export function Flavors() {
  const sectionRef = useRef<HTMLElement>(null);
  const panelRefs = useRef<HTMLDivElement[]>([]);
  const jumpRef = useRef<((index: number) => void) | null>(null);
  const [live, setLive] = useState(false);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let disposed = false;
    let cleanup = () => {};
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")])
      .then(([{ gsap }, { ScrollTrigger }]) => {
        if (disposed) return;
        gsap.registerPlugin(ScrollTrigger);
        setLive(true);
        const reduced = motion.matches;
        const count = flavors.length;
        const ctx = gsap.context(() => {
          const panels = panelRefs.current;
          gsap.set(panels.slice(1), { autoAlpha: 0, y: 32 });
          const timeline = gsap.timeline({
            defaults: { ease: "power2.out", duration: reduced ? 0.01 : 0.3 },
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "bottom bottom",
              scrub: reduced ? true : SCRUB,
              snap: reduced
                ? undefined
                : {
                    snapTo: 1 / Math.max(1, count - 1),
                    inertia: false, // the nearest flavour, not where the scroll's momentum would carry it
                    duration: { min: 0.2, max: 0.6 },
                    delay: 0.08,
                  },
            },
            onUpdate() {
              const progress = timeline.progress();
              setFlavorScroll({ progress });
              setCurrent(flavorState(progress, count, reduced).current);
            },
          });
          timeline.to({}, { duration: count - 1 }, 0); // one unit of the timeline per flavour change
          panels.forEach((panel, i) => {
            if (i > 0) timeline.to(panel, { autoAlpha: 1, y: 0 }, i - 0.45);
            if (i < count - 1) timeline.to(panel, { autoAlpha: 0, y: -32 }, i + 0.15);
          });
          const presence = { value: 0 };
          const writePresence = () => setFlavorScroll({ presence: presence.value });
          const enter = ScrollTrigger.create({
            trigger: section,
            start: PRESENCE.enter[0],
            end: PRESENCE.enter[1],
            onUpdate: (self) => {
              presence.value = self.progress * (1 - leave.progress);
              writePresence();
            },
          });
          const leave = ScrollTrigger.create({
            trigger: section,
            start: PRESENCE.leave[0],
            end: PRESENCE.leave[1],
            onUpdate: (self) => {
              presence.value = enter.progress * (1 - self.progress);
              writePresence();
            },
          });
          jumpRef.current = (index) => {
            const st = timeline.scrollTrigger;
            if (!st) return;
            const top = st.start + restProgress(index, count) * (st.end - st.start);
            window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
          };
        }, section);
        // the page's height changes when a font lands or an answer opens: measure again
        const observer = new ResizeObserver(() => ScrollTrigger.refresh());
        observer.observe(document.body);
        cleanup = () => {
          observer.disconnect();
          ctx.revert();
          jumpRef.current = null;
          setFlavorScroll({ progress: 0, presence: 0 });
        };
      })
      .catch((error: unknown) => console.warn("Không tải được hiệu ứng cuộn hương vị.", error));
    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id={sections.flavors}
      aria-labelledby="flavors-title"
      data-live={live}
      style={{ "--flavor-count": flavors.length } as React.CSSProperties}
      className="flavors"
    >
      <div className="flavors-pin mx-auto max-w-7xl px-4 sm:px-6">
        <div className="pt-20 pb-2 text-center md:pt-24 md:pb-6">
          <p className="text-sm font-semibold tracking-[0.2em] text-brand-pink-800 uppercase">{flavorsIntro.tagline}</p>
          <h2 id="flavors-title" className="mt-1 text-2xl font-bold tracking-tight text-balance md:mt-2 md:text-5xl">
            {flavorsIntro.title}
          </h2>
        </div>
        <div className="flavors-stage cup-grid lg:grid lg:grid-cols-2 lg:items-center lg:gap-12">
          <CupAnchor name="flavors" actor="flavor" tilt={0.12} fill={0.86} className="flavors-cup" />
          <div className="flavors-panels">
            {flavors.map((flavor, i) => (
              <div
                key={flavor.id}
                ref={(element) => {
                  if (element) panelRefs.current[i] = element;
                }}
                className="flavor-panel text-center lg:text-left"
                aria-hidden={live && i !== current ? true : undefined}
              >
                <p className="text-sm tracking-[0.3em] tabular-nums">{flavorsIntro.counter(i, flavors.length)}</p>
                <h3 className="mt-2 text-2xl leading-tight md:mt-3 md:text-5xl">{flavor.title}</h3>
                <ul className="mt-3 space-y-0.5 md:mt-5 md:space-y-1.5 md:text-xl">
                  {flavor.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <a
                  href={`#${sections.menu}`}
                  tabIndex={live && i !== current ? -1 : undefined}
                  className="mt-4 inline-flex rounded-full border border-brand-ink px-5 py-2 text-sm transition-colors hover:bg-brand-ink hover:text-white md:mt-6"
                >
                  {flavorsIntro.more}
                </a>
              </div>
            ))}
          </div>
        </div>
        <nav
          aria-label={flavorsIntro.nav}
          className="flavors-dots flex justify-center gap-3 pt-3 pb-5 md:pt-6 md:pb-10"
        >
          {flavors.map((flavor, i) => (
            <button
              key={flavor.id}
              type="button"
              aria-label={flavor.title}
              aria-current={i === current ? "true" : undefined}
              onClick={() => jumpRef.current?.(i)}
              className="size-3 rounded-full border border-brand-ink transition-colors aria-[current=true]:bg-brand-ink"
            />
          ))}
        </nav>
      </div>
    </section>
  );
}
