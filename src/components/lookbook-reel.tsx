import { IconArrowUpRight } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { reelIntro, sections } from "@/data/boongee";
import { dishDescription } from "@/data/descriptions";
import { type FeaturedDish, featured } from "@/data/featured";

/** Plates alternate: a tall picture with its words under it, then a shorter one with its words over it. */
const TALL = "h-[50svh] lg:h-[64svh]";
const SHORT = "h-[42svh] lg:h-[50svh]";

function Plate({ dish, index }: { dish: FeaturedDish; index: number }) {
  const tall = index % 2 === 0;
  return (
    <figure
      data-reel-plate
      className={`flex shrink-0 snap-center gap-5 ${tall ? "flex-col self-start" : "flex-col-reverse self-end"}`}
    >
      <div className={`aspect-[4/5] overflow-hidden bg-[#BDAFA3] ${tall ? TALL : SHORT}`}>
        <Image
          data-reel-image
          src={dish.photo.src}
          alt={dish.name}
          width={dish.photo.width}
          height={dish.photo.height}
          sizes="(min-width: 64rem) 52svh, 42svh"
          className="h-full w-full object-cover"
        />
      </div>
      <figcaption className="grid max-w-[min(52svh,24rem)] grid-cols-[auto_1fr] gap-x-5">
        <span className="pt-1 text-sm text-silver-500 tabular-nums">{String(index + 1).padStart(2, "0")}</span>
        <span>
          <span className="block text-[0.7rem] tracking-[0.28em] text-silver-700 uppercase">{dish.group}</span>
          <span className="mt-2 block text-3xl leading-tight font-light md:text-4xl">{dish.name}</span>
          <span className="mt-3 block text-sm leading-relaxed text-silver-700">
            {dishDescription(dish.name, dish.note)}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * The lookbook (21/11/2026): the menu board's featured drinks as plates of the v5 still lifes, hung in one long row
 * like a gallery wall, each with its number, group, name and short description (src/data/descriptions.ts; no prices
 * since 21/11/2026, owner). As served it is a
 * row that scrolls sideways (snap): so it reads with reduced motion, without script, or before the script loads. With
 * motion allowed the page's scroll timeline (src/components/scroll-motion.tsx) takes it over: the section grows as
 * tall as the row is long, its frame sticks, and the page's own scroll walks the row past (a silver line fills as it
 * goes), each picture settling from a slight zoom as it comes in.
 */
export function LookbookReel() {
  if (featured.length === 0) return null;
  return (
    <section id={sections.lookbook} data-reel aria-labelledby="reel-title" className="relative bg-white">
      <noscript>
        <style>{`[data-reel-frame]{position:static!important;height:auto!important}`}</style>
      </noscript>
      <div data-reel-frame className="relative top-0 flex flex-col justify-center overflow-hidden py-20 md:py-28">
        <div
          data-reel-viewport
          className="snap-x snap-mandatory scroll-px-4 [scrollbar-width:none] overflow-x-auto sm:scroll-px-6 lg:scroll-px-[6vw]"
        >
          <div data-reel-track className="flex w-max items-stretch gap-[10vw] px-4 sm:px-6 lg:gap-[7vw] lg:px-[6vw]">
            <header className="flex w-[min(78vw,26rem)] shrink-0 snap-start flex-col justify-center">
              <p className="eyebrow">{reelIntro.tagline}</p>
              <h2
                id="reel-title"
                className="mt-5 text-[clamp(2.6rem,7vw,6rem)] leading-[0.98] font-light tracking-[-0.02em]"
              >
                {reelIntro.title}
              </h2>
            </header>
            {featured.map((dish, i) => (
              <Plate key={dish.name} dish={dish} index={i} />
            ))}
            <div className="flex w-[min(80vw,24rem)] shrink-0 snap-end items-center">
              <Link
                href="/menu"
                className="group text-[clamp(1.6rem,4vw,3rem)] leading-tight font-light underline-offset-8 hover:underline"
              >
                {reelIntro.more}
                <IconArrowUpRight
                  aria-hidden
                  className="ml-2 inline-block size-[0.9em] align-[-0.1em] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </Link>
            </div>
          </div>
        </div>
        <div aria-hidden className="mx-4 mt-10 h-px w-40 bg-silver-200 sm:mx-6 lg:mx-[6vw]">
          <span data-reel-progress className="block h-full origin-left scale-x-0 bg-silver-600" />
        </div>
      </div>
    </section>
  );
}
