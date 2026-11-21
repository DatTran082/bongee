import { getImageProps } from "next/image";
import { ButtonLink } from "@/components/button-link";
import { actions, brand, hero, sections } from "@/data/boongee";
import { covers } from "@/data/lookbook";

/**
 * The painted canvas's greige at the picture's left edge (#BDAFA3, also written as Tailwind classes below): the phones'
 * ground above the picture, so one runs into the other, and the picture's stand-in while it loads.
 */
const CANVAS = "#BDAFA3";

/**
 * The hero (21/11/2026, owner: the landing redesigned round the v5 lookbook, "gây ấn tượng thị giác mạnh"): the v5
 * cover with two paper cups as a still life on the painted canvas, and the slogan set very large. From `lg` the
 * picture fills the screen and the slogan stands on its empty canvas on the left; below, the slogan comes first on
 * the canvas's own colour and the 4:5 cut round the cups follows. One <picture> (art direction): only the cut that
 * shows is fetched, at high priority, being the largest thing on first paint. On load (CSS, no script needed) the
 * slogan's lines rise out of their masks and the picture settles from a slow zoom. With motion allowed the section
 * is taller than the screen and its frame sticks; the page's scroll timeline (src/components/scroll-motion.tsx) then
 * fades the words away and draws the picture back into a framed canvas on a white wall: the way into the gallery.
 */
export function Hero() {
  const cover = covers.hero;
  return (
    <section data-hero className="relative motion-safe:h-[150svh] lg:motion-safe:h-[175svh]">
      <div data-hero-frame className="top-0 flex h-svh flex-col overflow-hidden motion-safe:sticky lg:block">
        {/* the words on their ground (canvas-coloured on phones): it fades away as the picture is drawn back */}
        <div
          data-hero-ground
          className="relative z-10 shrink-0 bg-[#BDAFA3] px-4 pt-16 pb-8 sm:px-6 lg:absolute lg:inset-0 lg:flex lg:items-center lg:bg-transparent lg:px-[6vw] lg:py-0"
        >
          {/* from lg the words stand on the canvas left of the cups: 6vw in, at most 9vw tall, clear of them down to 1024 px */}
          <div data-hero-copy className="w-full">
            <p className="eyebrow hero-rise text-brand-ink/70 before:bg-brand-ink/30">{brand.name}</p>
            <h1 className="mt-5 text-[17vw] leading-[0.86] font-light tracking-[-0.035em] sm:text-[14vw] lg:mt-8 lg:text-[min(9vw,11rem)]">
              {brand.sloganLines.map((line, i) => (
                <span key={line} className="-my-[0.12em] block overflow-hidden py-[0.12em]">
                  <span className="hero-line block" style={{ animationDelay: `${140 + i * 150}ms` }}>
                    {line}
                  </span>
                </span>
              ))}
            </h1>
            <div className="hero-rise mt-8 flex flex-wrap gap-3 lg:mt-12">
              <ButtonLink href={`#${sections.menu}`} variant="primary">
                {actions.menu}
              </ButtonLink>
              <ButtonLink href={`#${sections.visit}`}>{actions.visit}</ButtonLink>
            </div>
            <div data-cup-hint className="sr-only" />
          </div>
        </div>
        {cover && <Picture cover={cover} />}
      </div>
    </section>
  );
}

/** The cover, drawn back by the scroll (the outer box), settling on load (the middle one), zooming out (the image). */
function Picture({ cover }: { cover: NonNullable<typeof covers.hero> }) {
  const common = { alt: hero.imageAlt, sizes: "100vw", loading: "eager", fetchPriority: "high" } as const;
  const {
    props: { srcSet: wide },
  } = getImageProps({ ...common, src: cover.wide.src, width: cover.wide.width, height: cover.wide.height });
  const {
    props: { srcSet: tall, ...rest },
  } = getImageProps({ ...common, src: cover.tall.src, width: cover.tall.width, height: cover.tall.height });
  return (
    <div
      data-hero-picture
      className="relative min-h-0 flex-1 overflow-hidden bg-[#BDAFA3] lg:absolute lg:inset-0 lg:z-0"
    >
      <div className="hero-settle h-full w-full">
        <picture>
          <source media="(min-width: 64rem)" srcSet={wide} />
          <img
            {...rest}
            srcSet={tall}
            alt={hero.imageAlt}
            data-hero-image
            className="h-full w-full object-cover object-[50%_62%] lg:object-[58%_50%]"
          />
        </picture>
      </div>
      {/* phones: the picture's top melts into the canvas-coloured ground above it */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-16 lg:hidden"
        style={{ backgroundImage: `linear-gradient(${CANVAS}, transparent)` }}
      />
    </div>
  );
}
