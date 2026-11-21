"use client";

import { useEffect } from "react";
import { hero } from "@/lib/scroll/hero";
import { interlude } from "@/lib/scroll/interlude";
import { reel } from "@/lib/scroll/reel";
import { reveal } from "@/lib/scroll/reveal";
import type { Scene } from "@/lib/scroll/types";
import { wordmark } from "@/lib/scroll/wordmark";

/**
 * The scenes, top of the page down. The reel comes before the scenes below it: it sets its section's height, and
 * every trigger further down must be measured after that.
 */
const SCENES: readonly Scene[] = [hero, reel, interlude, wordmark, reveal];

/**
 * The home page's scroll motion, with GSAP's ScrollTrigger (src/lib/scroll/: one module per scene): the hero drawn
 * back into a framed canvas, the lookbook reel walked sideways, the interlude opening from a slit (the 3D cups have
 * no scroll timeline since 21/11/2026: they float in their slots), the footer's name rising, and headings and blocks revealed as they come in. GSAP is loaded after hydration
 * (a dynamic import: nothing on first paint waits for it) and plays only while the visitor allows motion (a change
 * of the setting reverts everything to the still page, which is complete on its own). No smooth-scroll hijack and no
 * GSAP pinning: the browser keeps its own scroll, frames stick by CSS, and every tween is a transform or an opacity,
 * so nothing makes the page lay out again while it scrolls.
 */
export function ScrollMotion() {
  useEffect(() => {
    let revert: (() => void) | null = null;
    let cancelled = false;
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")])
      .then(([{ gsap }, { ScrollTrigger }]) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.config({ ignoreMobileResize: true }); // a phone's address bar showing or hiding is not a resize
        const media = gsap.matchMedia();
        media.add("(prefers-reduced-motion: no-preference)", () => {
          const undo = SCENES.map((scene) => scene(gsap, ScrollTrigger));
          ScrollTrigger.refresh(); // every trigger measured once all the heights are set
          return () => {
            for (const step of undo) step?.();
          };
        });
        revert = () => media.revert();
      })
      .catch((error: unknown) => console.warn("Không tải được hiệu ứng cuộn.", error)); // the page stands still
    return () => {
      cancelled = true;
      revert?.();
    };
  }, []);
  return null;
}
