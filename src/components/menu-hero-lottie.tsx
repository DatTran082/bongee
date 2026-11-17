"use client";

import { useEffect, useRef } from "react";

/** Frames of the Lottie's markers (brandkit/lottie/menu-hero.scene.mjs): intro once, then the loop; 48 is the rest. */
const INTRO: [number, number] = [0, 48];
const LOOP: [number, number] = [48, 72];

/**
 * The /menu page's hand-drawn Lottie (a paper cup is set down, the four monogram flowers fly onto it, the lid goes on, the flowers breathe and a curl of scent rises): lottie-web's
 * light SVG player, loaded only in the browser. Intro once, then the loop; paused while off screen; one still frame
 * (the rest) with reduced motion. Decorative: hidden from assistive tech.
 */
export function MenuHeroLottie({ src, className = "" }: { src: string | null; className?: string }) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = box.current;
    if (!src || !container) return;
    let disposed = false;
    let destroy = () => {};
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    import("lottie-web/build/player/lottie_light").then(({ default: lottie }) => {
      if (disposed) return;
      const anim = lottie.loadAnimation({ container, renderer: "svg", loop: false, autoplay: false, path: src });
      anim.addEventListener("DOMLoaded", () => {
        if (still) anim.goToAndStop(LOOP[0], true);
        else anim.playSegments(INTRO, true);
      });
      anim.addEventListener("complete", () => {
        anim.loop = true;
        anim.playSegments(LOOP, true);
      });
      const seen = new IntersectionObserver(([entry]) => {
        if (still) return;
        if (entry.isIntersecting) anim.play();
        else anim.pause();
      });
      seen.observe(container);
      destroy = () => {
        seen.disconnect();
        anim.destroy();
      };
    });

    return () => {
      disposed = true;
      destroy();
    };
  }, [src]);

  return <div ref={box} aria-hidden className={`aspect-square ${className}`} />;
}
