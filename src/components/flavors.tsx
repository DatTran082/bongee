"use client";

import { useEffect, useRef, useState } from "react";
import { CupAnchor } from "@/components/cup-anchor";
import { flavorsIntro, sections } from "@/data/boongee";
import { flavors } from "@/data/flavors";
import { setFlavorScroll } from "@/lib/cup-scene/flavor-scroll";
import { flavorState, restProgress } from "@/lib/cup-scene/flavor-track";

/** Viewports of scroll per change of flavour (globals.css, `.flavors[data-live]`): unhurried, a flick does not skip one. */
const STEP_VH = 1.7;
/** The background tone comes in over the last 70 % of a viewport before the pin and goes out over as much after it. */
const PRESENCE_VH = 0.7;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Flavour carousel: one flavour per menu category. With script, the section gives each change of flavour 1.7
 * viewports of scroll and its inside stays on screen (CSS sticky). The scroll handler only reads the page's place
 * and stores the carousel's progress (flavor-scroll.ts); the 3D stage glides the cup there (index.ts, FLAVOR_TAU):
 * it turns once round its axis per flavour and changes for the next flavour's cup, its toppings fade from one
 * flavour's to the next, the ground moves through the brand's creams. The words change by a CSS fade when the
 * nearest flavour changes (the only re-render). The browser's own scroll snapping (proximity, on invisible marks at
 * each flavour) settles the page on a flavour, so a phone keeps its native, momentum scroll: no script animates the
 * page, nothing is pinned by script (owner, 22/10/2026: the GSAP pin and snap lagged on phones). Without script the
 * flavours are a plain list. The dots jump to a flavour (keyboard too).
 */
export function Flavors() {
  const sectionRef = useRef<HTMLElement>(null);
  const jumpRef = useRef<((index: number) => void) | null>(null);
  const [live, setLive] = useState(false);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const count = flavors.length;
    const root = document.documentElement;
    setLive(true);
    if (!reduced) root.classList.add("flavor-snap"); // lang-may: scroll-snap-type on the page, proximity
    // the section's place on the page, measured only when the layout changes (a read per scroll would force layouts)
    let top = 0;
    let height = 1;
    let vh = 1;
    let shown = 0;
    const update = () => {
      const y = window.scrollY;
      const progress = clamp01((y - top) / Math.max(1, height - vh));
      const enter = clamp01((y - (top - PRESENCE_VH * vh)) / (PRESENCE_VH * vh));
      const leave = clamp01((y + vh - (top + height)) / (PRESENCE_VH * vh));
      setFlavorScroll({ progress, presence: enter * (1 - leave) });
      const next = flavorState(progress, count, true).current; // the nearest flavour (reduced: no blend)
      if (next !== shown) setCurrent((shown = next));
    };
    const measure = () => {
      vh = window.innerHeight;
      height = section.offsetHeight;
      top = section.getBoundingClientRect().top + window.scrollY;
      update();
    };
    const listeners = new AbortController();
    window.addEventListener("scroll", update, { passive: true, signal: listeners.signal });
    window.addEventListener("resize", measure, { signal: listeners.signal });
    // the page's height changes when a font lands, a picture loads or an answer opens: measure again
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    measure();
    jumpRef.current = (index) => {
      const at = top + restProgress(index, count) * (height - vh);
      window.scrollTo({ top: at, behavior: reduced ? "auto" : "smooth" });
    };
    return () => {
      listeners.abort();
      observer.disconnect();
      root.classList.remove("flavor-snap");
      jumpRef.current = null;
      setFlavorScroll({ progress: 0, presence: 0 });
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
      {live &&
        flavors.map((flavor, i) => (
          <span key={flavor.id} aria-hidden className="flavor-snap-mark" style={{ top: `${i * STEP_VH * 100}svh` }} />
        ))}
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
                data-current={i === current}
                className="flavor-panel text-center lg:text-left"
                aria-hidden={live && i !== current ? true : undefined}
              >
                <p className="text-sm tracking-[0.3em] tabular-nums">{flavorsIntro.counter(i, flavors.length)}</p>
                <h3 className="mt-2 text-2xl leading-tight md:mt-3 md:text-5xl">{flavor.title}</h3>
                <ul className="mt-3 space-y-0.5 md:mt-5 md:space-y-1.5 md:text-xl">
                  {flavor.items.map((item) => (
                    <li key={item.name}>
                      {item.name}
                      {item.note && (
                        <span className="hidden text-sm text-brand-ink-muted sm:inline">
                          {" "}
                          · {item.note.toLowerCase()}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
                <a
                  href={`#${sections.menu}`}
                  tabIndex={live && i !== current ? -1 : undefined}
                  data-variant="outline"
                  className="button-game mt-4 inline-flex rounded-full px-5 py-2 text-sm md:mt-6"
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
