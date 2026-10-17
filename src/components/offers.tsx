import { IconFlower } from "@tabler/icons-react";
import { SectionHeading } from "@/components/section-heading";
import { offersIntro, sections } from "@/data/boongee";
import { loyalty, weeklyOffer } from "@/data/offers";

/** The standing offers (ShanMay collateral.json): the weekly discount and the loyalty card, drawn as the card is. */
export function Offers() {
  const stamps = Array.from({ length: loyalty.stamps }, (_, i) => i + 1);

  return (
    <section id={sections.offers} className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
      <SectionHeading tagline={offersIntro.tagline} title={offersIntro.title} />
      <div className="grid gap-6 md:grid-cols-2">
        <article className="flex flex-col justify-center rounded-3xl bg-brand-pink-500 p-8 text-center md:p-10">
          <h3 className="text-sm tracking-[0.2em] uppercase">{weeklyOffer.eyebrow.toLowerCase()}</h3>
          <p className="mt-3 text-7xl leading-none md:text-8xl">
            <span aria-hidden>{weeklyOffer.value}</span>
            <span className="sr-only">{`Giảm ${weeklyOffer.value.replace("-", "")}`}</span>
          </p>
          <p className="mt-4 text-2xl">{weeklyOffer.offer}</p>
          <p className="mt-2 text-lg">{weeklyOffer.detail}</p>
        </article>
        <article className="rounded-3xl border border-brand-line bg-brand-bg-alt p-8 md:p-10">
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
    </section>
  );
}
