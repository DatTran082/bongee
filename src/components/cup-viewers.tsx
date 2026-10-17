"use client";

import { useEffect, useRef } from "react";
import { SectionHeading } from "@/components/section-heading";
import { cups, sections } from "@/data/boongee";

/**
 * The two Boongee cups as turnable 3D models (glTF from brandkit/3d: the print texture is the real print file), shown
 * with <model-viewer>. They stay still, front print facing the visitor, and turn when dragged: no auto-rotation, so
 * nothing on the page moves on its own (WCAG 2.2.2). The viewer library (three.js inside) is only fetched when the
 * section comes within ~1000 px of the viewport; until then, and if it never loads, each card shows its poster image.
 */
export function CupViewers() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || customElements.get("model-viewer")) return;
    const load = () => {
      import("@google/model-viewer").catch((error: unknown) => {
        // offline or blocked: the posters stay, which is a complete (static) section
        console.warn("Không tải được trình xem 3D, giữ ảnh tĩnh của ly.", error);
      });
    };
    if (!("IntersectionObserver" in window)) {
      load();
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          load();
        }
      },
      { rootMargin: "1000px 0px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id={sections.cups} className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
      <SectionHeading tagline={cups.tagline} title={cups.title} subtitle={cups.subtitle} />
      <div className="grid gap-8 md:grid-cols-2">
        {cups.items.map((cup) => (
          <figure key={cup.model} className="overflow-hidden rounded-3xl border border-brand-line bg-brand-pink-100">
            <model-viewer
              src={cup.model}
              alt={cup.alt}
              loading="lazy"
              camera-controls=""
              interaction-prompt="none"
              shadow-intensity="0.8"
              exposure="1"
              environment-image="neutral"
              camera-orbit="0deg 78deg auto"
              className="block aspect-[4/5] h-auto w-full"
            >
              {/* A plain <img>, not next/image: it is slotted into the custom element as its poster, and shows as
                  ordinary content before the viewer library loads. The viewer carries the alt text. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                slot="poster"
                src={cup.poster}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-contain"
              />
            </model-viewer>
            <figcaption className="px-6 pt-2 pb-6">
              <h3 className="text-xl md:text-2xl">{cup.title}</h3>
              <p className="mt-2 text-brand-ink-muted">{cup.description}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
