import Image from "next/image";
import heroPhoto from "@/assets/images/hero.jpg";
import { ButtonLink } from "@/components/button-link";
import { brand, hero, sections } from "@/data/boongee";

/**
 * The cover photo (two Boongee cups on the brand pink, empty pink on the left) with the slogan as the page's one
 * <h1>, in ink on that pink. From xl (1280 px) up the photo fills the section behind the text; below that (phones,
 * tablets, small laptops) the text comes first and the photo follows, cut round the cups, so no letter ever sits on
 * a cup or the stem. The photo's backdrop is a cooler pink than the page's pink-500, so its free edges (the bottom,
 * and the top when it follows the text) fade into the page instead of ending in a seam.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-brand-pink-500">
      <div className="relative z-10 mx-auto flex max-w-7xl items-center px-4 sm:px-6 xl:min-h-[min(80vh,46rem)]">
        <div className="w-full py-14 text-center xl:w-[42%] xl:py-24 xl:text-left">
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
        </div>
      </div>
      <div className="relative xl:absolute xl:inset-0">
        <Image
          src={heroPhoto}
          alt={hero.imageAlt}
          preload
          placeholder="blur"
          sizes="100vw"
          className="block aspect-[4/3] h-auto w-full object-cover object-[78%_center] md:aspect-[16/9] xl:aspect-auto xl:h-full xl:object-[72%_center]"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-linear-to-t from-transparent to-brand-pink-500 md:h-16 xl:hidden" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-linear-to-b from-transparent to-brand-pink-500 md:h-20" />
      </div>
    </section>
  );
}
