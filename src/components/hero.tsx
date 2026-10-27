import Image from "next/image";
import heroPhoto from "@/assets/images/hero.jpg";
import { ButtonLink } from "@/components/button-link";
import { CupAnchor } from "@/components/cup-anchor";
import { CloudBank } from "@/components/lang-may/cloud-bank";
import { FlowerMark } from "@/components/lang-may/flower-mark";
import { Sky } from "@/components/lang-may/sky";
import { brand, hero, sections } from "@/data/boongee";

/**
 * The slogan as the page's one <h1>, in ink under a painted morning sky with drifting clouds (Làng Mây: <Sky>, behind
 * the 3D stage), the section ending in a bank of clouds (<CloudBank>, in front of it), beside the slot of the cover
 * photo's set: the two
 * paper cups on the block and the logs, built in 3D and floating (src/lib/cup-scene/set). From xl (1280 px) up the
 * text takes the left column and the set the right; below that the text comes first and the set follows. The slot
 * is empty: the set itself is drawn by the stage behind the page (src/components/cup-stage.tsx), which puts the
 * cover photo here only if it cannot draw; without script the photo is here from the start.
 */
export function Hero() {
  return (
    <section className="relative pb-16 md:pb-24">
      <Sky />
      <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 sm:px-6 xl:min-h-[min(80vh,46rem)] xl:grid-cols-[42%_1fr] xl:gap-12">
        <div className="pt-14 text-center xl:py-24 xl:text-left">
          <p className="flex items-center justify-center gap-3 text-sm tracking-[0.35em] uppercase xl:justify-start xl:text-base">
            <FlowerMark className="size-6" />
            {brand.name}
          </p>
          <h1 className="mt-4 text-4xl leading-[1.25] font-normal tracking-[0.15em] uppercase sm:text-5xl xl:text-6xl">
            {brand.sloganLines.map((line, i) => (
              <span key={line} className="block">
                {i > 0 && " "}
                {line}
              </span>
            ))}
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg xl:mx-0 xl:text-xl">{hero.intro}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 xl:justify-start">
            <ButtonLink href={`#${sections.menu}`} variant="primary">
              Xem menu
            </ButtonLink>
            <ButtonLink href={`#${sections.visit}`}>Ghé quán</ButtonLink>
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
      <CloudBank className="h-24 md:h-36" />
    </section>
  );
}
