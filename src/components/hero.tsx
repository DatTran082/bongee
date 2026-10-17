import { ButtonLink } from "@/components/button-link";
import { HeroScene } from "@/components/hero-scene";
import { brand, hero, sections } from "@/data/boongee";

/**
 * The slogan as the page's one <h1>, in ink on the brand pink, beside the interactive 3D scene of the cover photo
 * (two Boongee cups on stone and wood). From xl (1280 px) up the scene fills the section behind the text and frames
 * the cups right of it; below that (phones, tablets, small laptops) the text comes first and the scene follows, so
 * no letter ever sits on a cup. The text's box lets pointer events through to the scene beside it.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-brand-pink-500">
      <div className="pointer-events-none relative z-10 mx-auto flex max-w-7xl items-center px-4 sm:px-6 xl:min-h-[min(80vh,46rem)]">
        <div data-hero-copy className="pointer-events-auto w-full py-14 text-center xl:w-[42%] xl:py-24 xl:text-left">
          <p className="text-sm tracking-[0.35em] uppercase xl:text-base">{brand.name}</p>
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
              Xem thực đơn
            </ButtonLink>
            <ButtonLink href={`#${sections.visit}`}>Ghé quán</ButtonLink>
          </div>
          {/* the scene's hint goes here once the scene is up; the line is held so nothing shifts when it appears */}
          <div data-hero-hint className="mt-6 h-6" />
        </div>
      </div>
      <HeroScene />
    </section>
  );
}
