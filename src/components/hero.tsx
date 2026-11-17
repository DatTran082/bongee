import Image from "next/image";
import wide from "@/assets/images/hero-suong-som-16x9.jpg";
import tall from "@/assets/images/hero-suong-som-4x5.jpg";
import { ButtonLink } from "@/components/button-link";
import { actions, brand, hero, sections } from "@/data/boongee";

/** The portrait picture's sky at its top edge: the phones' hero ground, so the text area runs on into the picture. */
const SKY = "#deeffb";

/**
 * The hero: a photograph (owner, 17/11/2026, direction B "Sương sớm trên núi": the two cups on river stones, tea hills
 * in morning fog, on porcelain pebble stands, the PP cup a purple Nho Cheese; composed with GPT Image
 * (brandkit/lookbook/hero-web/ref-gptimage/PROMPT.md), re-rendered at 2K with agy; the 4:5 is a crop of the 16:9). From
 * 1024 px the landscape 16:9 picture fills the section and the slogan sits on its empty misty left. Below that the
 * slogan comes first on the picture's own sky colour and the portrait 4:5 picture follows, its top melting into that
 * sky (laid over its empty top the text would touch the cups). Each picture loads only where it shows (no preload:
 * a preload would fetch both everywhere), at high priority, being the largest thing on first paint there. The foot melts into the page's white.
 */
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden" style={{ backgroundColor: SKY }}>
      <div className="mx-auto flex max-w-7xl flex-col px-4 pt-14 sm:px-6 lg:min-h-[min(88vh,56rem)] lg:justify-center lg:py-28">
        <div className="text-center lg:max-w-[38%] lg:text-left">
          <p className="eyebrow">{brand.name}</p>
          <h1 className="mt-6 text-4xl leading-[1.3] font-light tracking-[0.18em] uppercase sm:text-5xl xl:text-6xl">
            {brand.sloganLines.map((line, i) => (
              <span key={line} className="block">
                {i > 0 && " "}
                {line}
              </span>
            ))}
          </h1>
          <div className="mt-10 flex flex-wrap justify-center gap-3 lg:justify-start">
            <ButtonLink href={`#${sections.menu}`} variant="primary">
              {actions.menu}
            </ButtonLink>
            <ButtonLink href={`#${sections.visit}`}>{actions.visit}</ButtonLink>
          </div>
          <div data-cup-hint className="sr-only" />
        </div>
      </div>

      {/* phones and tablets: the portrait picture under the text */}
      <div className="relative mx-auto mt-4 aspect-[4/5] max-w-2xl lg:hidden">
        <Image
          src={tall}
          alt={hero.imageAlt}
          fill
          fetchPriority="high"
          quality={82}
          sizes="(min-width: 42rem) 42rem, 100vw"
          placeholder="blur"
          className="object-cover"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-24"
          style={{ backgroundImage: `linear-gradient(${SKY}, transparent)` }}
        />
      </div>

      {/* from lg: the landscape picture behind the text */}
      <div className="absolute inset-0 -z-10 hidden lg:block">
        <Image
          src={wide}
          alt={hero.imageAlt}
          fill
          fetchPriority="high"
          quality={82}
          sizes="100vw"
          placeholder="blur"
          className="object-cover object-[70%_center]"
        />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-white"
      />
    </section>
  );
}
