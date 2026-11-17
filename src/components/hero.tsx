import Image from "next/image";
import heroPhoto from "@/assets/images/hero.jpg";
import { ButtonLink } from "@/components/button-link";
import { CupAnchor } from "@/components/cup-anchor";
import { actions, brand, hero, sections } from "@/data/boongee";

const HERO_ID = "dau-trang";

/**
 * The slogan as the page's one <h1>, light and widely tracked, on a plain pastel sky melting into the page's white
 * (no mountains or clouds: owner, 17/11/2026), beside the slot of the cover photo's set on its floating island (two paper cups on the block and the logs, drawn by the 3D stage: src/components/cup-stage.tsx, which
 * puts the cover photo here only if it cannot draw; without script the photo is here from the start). From xl
 * (1280 px) up the text takes the left column and the set the right; below that the text comes first.
 */
export function Hero() {
  return (
    <section id={HERO_ID} className="relative pb-10 md:pb-14">
      <div aria-hidden className="sky pointer-events-none absolute inset-0 -z-20" />
      <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 sm:px-6 xl:min-h-[min(80vh,46rem)] xl:grid-cols-[42%_1fr] xl:gap-12">
        <div className="pt-16 text-center xl:py-24 xl:text-left">
          <p className="eyebrow">{brand.name}</p>
          <h1 className="mt-6 text-4xl leading-[1.3] font-light tracking-[0.18em] uppercase sm:text-5xl xl:text-6xl">
            {brand.sloganLines.map((line, i) => (
              <span key={line} className="block">
                {i > 0 && " "}
                {line}
              </span>
            ))}
          </h1>
          <div className="mt-10 flex flex-wrap justify-center gap-3 xl:justify-start">
            <ButtonLink href={`#${sections.menu}`} variant="primary">
              {actions.menu}
            </ButtonLink>
            <ButtonLink href={`#${sections.visit}`}>{actions.visit}</ButtonLink>
          </div>
          <div data-cup-hint className="sr-only" />
        </div>
        <CupAnchor
          name="hero"
          actor="set"
          turn={0}
          tilt={0.1}
          fill={0.94}
          className="h-[52vh] max-h-[36rem] min-h-72 xl:h-[74vh] xl:max-h-[46rem]"
        >
          <noscript>
            <Image
              src={heroPhoto}
              alt={hero.imageAlt}
              sizes="(min-width: 80rem) 60vw, 100vw"
              className="h-full w-full rounded-3xl object-cover object-[72%_center]"
            />
          </noscript>
        </CupAnchor>
      </div>
    </section>
  );
}
