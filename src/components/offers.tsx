import { IconFlower } from "@tabler/icons-react";
import { CupAnchor } from "@/components/cup-anchor";
import { SectionHeading } from "@/components/section-heading";
import { offersIntro, sections } from "@/data/boongee";
import { loyalty, weeklyOffer } from "@/data/offers";

/**
 * The standing offers (ShanMay collateral.json): the weekly discount and the loyalty card, drawn as the card is.
 * Two cups stand here, the PP one and the paper one: the discount is for orders of two.
 */
export function Offers() {
  const stamps = Array.from({ length: loyalty.stamps }, (_, i) => i + 1);

  return (
    <section id={sections.offers} className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
      <SectionHeading tagline={offersIntro.tagline} title={offersIntro.title} />
      <div className="cup-grid lg:grid lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start lg:gap-10">
        <div className="cup-row mb-8 flex h-[38vh] max-h-[22rem] gap-3 lg:sticky lg:top-24 lg:mb-0 lg:h-[64vh] lg:max-h-[40rem]">
          <CupAnchor name="offers-pp" actor="pp" turn={0.3} tilt={0.12} fill={0.85} className="min-w-0 flex-1" />
          <CupAnchor
            name="offers-paper"
            actor="paper"
            turn={-0.25}
            tilt={0.12}
            fill={0.85}
            className="min-w-0 flex-1"
          />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <article className="parallax-rise flex flex-col justify-center rounded-3xl border border-brand-line bg-brand-bg-alt p-8 text-center md:p-10">
            <h3 className="text-sm tracking-[0.2em] uppercase">{weeklyOffer.eyebrow.toLowerCase()}</h3>
            <p className="mt-3 text-7xl leading-none md:text-8xl">
              <span aria-hidden>{weeklyOffer.value}</span>
              <span className="sr-only">{`Giảm ${weeklyOffer.value.replace("-", "")}`}</span>
            </p>
            <p className="mt-4 text-2xl">{weeklyOffer.offer}</p>
            <p className="mt-2 text-lg">{weeklyOffer.detail}</p>
          </article>
          <article className="parallax-rise rounded-3xl border border-brand-line bg-brand-bg-alt p-8 md:p-10">
            <h3 className="text-center text-sm tracking-[0.2em] uppercase">Thẻ tích điểm</h3>
            <p className="mt-3 text-center text-2xl md:text-3xl">{loyalty.headline}</p>
            <div
              role="img"
              className="mx-auto mt-6 grid max-w-sm grid-cols-5 gap-3"
              aria-label={`Thẻ tích điểm: mỗi ly một dấu, đủ ${loyalty.stamps - 1} dấu thì ly thứ ${loyalty.stamps} được ${loyalty.reward.toLowerCase()}`}
            >
              {stamps.map((n) => (
                <span
                  key={n}
                  className={
                    n < loyalty.stamps
                      ? "flex aspect-square items-center justify-center rounded-full border border-brand-ink"
                      : "flex aspect-square items-center justify-center rounded-full bg-brand-ink text-center text-[0.7rem] leading-tight text-white uppercase"
                  }
                >
                  {n < loyalty.stamps ? <IconFlower aria-hidden className="size-5" /> : loyalty.reward}
                </span>
              ))}
            </div>
            <p className="mt-6 text-center text-brand-ink-muted">{loyalty.terms}.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
