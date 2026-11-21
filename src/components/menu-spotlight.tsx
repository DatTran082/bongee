"use client";

import type { getImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";

export interface SpotlightDish {
  readonly name: string;
  readonly group: string;
  readonly price: string;
  /** the photo's optimised <img> props (next/image's getImageProps, on the server) */
  readonly image: ReturnType<typeof getImageProps>["props"];
}

/** The spotlight shows from lg (Tailwind's 64rem); narrower, the rows carry their own small pictures. */
const WIDE = "(min-width: 64rem)";

/**
 * The menu's spotlight (src/components/menu.tsx), from lg: a large still life of the drink in focus beside the list,
 * its group, name and price under it. In focus is the drink under the mouse, or else the one crossing the middle of
 * the screen as the page scrolls (one IntersectionObserver line, no scroll handler); its row is marked
 * (`data-active`, look.css). Pictures are put in the page only once their drink has come into focus (with the next
 * one, so it is ready), and each fades in over the last once it has loaded. Decorative: the list says everything.
 */
export function MenuSpotlight({ dishes }: { dishes: readonly SpotlightDish[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(dishes[0]?.name ?? "");
  const [placed, setPlaced] = useState<readonly string[]>(() => dishes.slice(0, 2).map((d) => d.name));
  const [loaded, setLoaded] = useState<readonly string[]>([]);

  useEffect(() => {
    const root = ref.current?.closest<HTMLElement>("[data-menu]");
    if (!root) return;
    const rows = Array.from(root.querySelectorAll<HTMLElement>("[data-dish]"));
    const order = dishes.map((d) => d.name);
    const wide = window.matchMedia(WIDE);
    let current = "";
    const pick = (name: string) => {
      if (!name || name === current) return;
      current = name;
      for (const row of rows) row.toggleAttribute("data-active", row.dataset.dish === name);
      setActive(name);
      if (!wide.matches) return; // the spotlight is hidden: no pictures to fetch
      const next = order[order.indexOf(name) + 1];
      setPlaced((list) => [...list, ...[name, next].filter((n): n is string => !!n && !list.includes(n))]);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) pick((entry.target as HTMLElement).dataset.dish ?? "");
        }
      },
      { rootMargin: "-50% 0px -50% 0px" }, // a line across the middle of the screen
    );
    for (const row of rows) observer.observe(row);
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const row = (event.target as Element).closest<HTMLElement>("[data-dish]");
      if (row) pick(row.dataset.dish ?? "");
    };
    root.addEventListener("pointerover", onPointer);
    return () => {
      observer.disconnect();
      root.removeEventListener("pointerover", onPointer);
      for (const row of rows) row.removeAttribute("data-active");
    };
  }, [dishes]);

  const onLoad = (name: string) => setLoaded((list) => (list.includes(name) ? list : [...list, name]));
  const dish = dishes.find((d) => d.name === active) ?? dishes[0];
  if (!dish) return null;
  return (
    <div ref={ref} aria-hidden className="sticky top-24">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#BDAFA3]">
        {dishes
          .filter((d) => placed.includes(d.name))
          .map((d) => (
            // eslint-disable-next-line @next/next/no-img-element -- getImageProps' optimised sources, stacked to cross-fade
            <img
              key={d.name}
              {...d.image}
              alt=""
              ref={(img) => {
                if (img?.complete && img.naturalWidth > 0) onLoad(d.name);
              }}
              onLoad={() => onLoad(d.name)}
              data-on={d.name === active && loaded.includes(d.name)}
              className="spotlight-image absolute inset-0 h-full w-full object-cover"
            />
          ))}
      </div>
      <div className="mt-5 flex items-end justify-between gap-6 border-t border-silver-300 pt-4">
        <p className="min-w-0">
          <span className="block text-[0.7rem] tracking-[0.28em] text-silver-700 uppercase">{dish.group}</span>
          <span className="mt-1 block truncate text-3xl leading-tight font-light">{dish.name}</span>
        </p>
        <span className="shrink-0 text-xl tabular-nums">{dish.price}</span>
      </div>
    </div>
  );
}
