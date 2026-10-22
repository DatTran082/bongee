import { IconDownload } from "@tabler/icons-react";
import Image from "next/image";
import { FlipCard } from "@/components/flip-card";
import { SectionHeading } from "@/components/section-heading";
import { offersIntro, sections } from "@/data/boongee";
import { loyalty, voucherTerms, vouchers, weeklyOffer } from "@/data/offers";
import pieces from "@/data/uu-dai.json";

/** A collateral piece's URL by its file name in brandkit-ghibli/an-pham (written by sync-brand, content-hashed). */
const piece = (file: string) => (pieces as Record<string, string>)[file];

/**
 * The offers as their printed pieces (brandkit-ghibli/an-pham, Làng Mây; built from the same collateral.json as
 * the words here): the weekly-offer post, the loyalty card and the vouchers, each card turning over to its back, a
 * voucher downloadable to show at the counter. The pictures carry the words, so every `alt` says them in full.
 */
export function Offers() {
  const terms = voucherTerms.join(". ");
  return (
    <section id={sections.offers} className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
      <SectionHeading tagline={offersIntro.tagline} title={offersIntro.title} />
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
        <figure className="parallax-rise">
          <Image
            src={piece("bai-dang-uu-dai-tuan_vuong.png")}
            alt={`${weeklyOffer.eyebrow.toLowerCase()}: giảm ${weeklyOffer.value.replace("-", "")} ${weeklyOffer.offer.toLowerCase()}, ${weeklyOffer.detail.replaceAll(" · ", ", ").toLowerCase()}`}
            width={1080}
            height={1080}
            sizes="(min-width: 64rem) 30rem, 92vw"
            className="h-auto w-full rounded-[2rem] shadow-sticker"
          />
        </figure>
        <div>
          <FlipCard
            label="thẻ tích điểm"
            width={1200}
            height={776}
            front={{
              src: piece("the-tich-diem_truoc.png"),
              alt: `Thẻ tích điểm Boongee: ${loyalty.headline}. Mười ô đóng dấu, ô thứ ${loyalty.stamps}: ${loyalty.reward.toLowerCase()}`,
            }}
            back={{ src: piece("the-tich-diem_sau.png"), alt: `Mặt sau thẻ tích điểm: ${loyalty.terms}` }}
            className="parallax-rise"
          />
        </div>
      </div>
      <div className="mt-12 grid gap-10 md:grid-cols-2">
        {vouchers.map((v) => (
          <div key={v.slug} className="parallax-rise">
            <FlipCard
              label={`voucher ${v.label.toLowerCase()} ${v.value}`}
              width={1200}
              height={533}
              front={{
                src: piece(`voucher-${v.slug}_truoc.png`),
                alt: `Voucher Boongee: ${v.label.toLowerCase()} ${v.value}, ${v.condition.toLowerCase()}, ${v.expiry}`,
              }}
              back={{ src: piece("voucher_sau.png"), alt: `Mặt sau voucher, điều kiện: ${terms}` }}
            />
            <a
              href={piece(`voucher-${v.slug}_truoc.png`)}
              download={`boongee-voucher-${v.slug}.png`}
              data-variant="outline"
              className="button-game mt-1 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm"
            >
              <IconDownload aria-hidden className="size-4" />
              Tải voucher
            </a>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-brand-ink-muted">{terms}.</p>
    </section>
  );
}
