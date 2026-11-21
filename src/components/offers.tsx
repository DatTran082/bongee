import { IconDownload } from "@tabler/icons-react";
import Image from "next/image";
import { FlipCard } from "@/components/flip-card";
import { SectionHeading } from "@/components/section-heading";
import { offersIntro, sections } from "@/data/boongee";
import { loyalty, voucherTerms, vouchers, weeklyOffer } from "@/data/offers";
import pieces from "@/data/uu-dai.json";

/** A collateral piece's URL by its file name in brandkit/collateral (written by sync-brand, content-hashed). */
const piece = (file: string) => (pieces as Record<string, string>)[file];

/**
 * The offers as their printed pieces (brandkit/collateral, Làng Mây; built from the same collateral.json as
 * the words here), in one row on wide screens: the weekly-offer post, the loyalty card and the
 * two vouchers, each card turning over to its back, a voucher downloadable to show at the counter. The pictures carry the words, so every `alt` says them in full.
 */
export function Offers() {
  const terms = voucherTerms.join(". ");
  return (
    <section id={sections.offers} className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
      <SectionHeading tagline={offersIntro.tagline} title={offersIntro.title} />
      <div
        data-reveal-group
        className="grid items-start gap-6 md:grid-cols-2 lg:grid-cols-[minmax(0,4fr)_minmax(0,5fr)_minmax(0,4fr)] lg:gap-8"
      >
        <figure>
          <Image
            src={piece("bai-dang-uu-dai-tuan_vuong.png")}
            alt={`${weeklyOffer.eyebrow.toLowerCase()}: giảm ${weeklyOffer.value.replace("-", "")} ${weeklyOffer.offer.toLowerCase()}, ${weeklyOffer.detail.replaceAll(" · ", ", ").toLowerCase()}`}
            width={1080}
            height={1080}
            sizes="(min-width: 64rem) 26vw, (min-width: 48rem) 46vw, 92vw"
            className="h-auto w-full rounded-2xl border border-silver-200"
          />
        </figure>
        <FlipCard
          label="thẻ tích điểm"
          width={1200}
          height={776}
          front={{
            src: piece("the-tich-diem_truoc.png"),
            alt: `Thẻ tích điểm Boongee: ${loyalty.headline}. Mười ô đóng dấu, ô thứ ${loyalty.stamps}: ${loyalty.reward.toLowerCase()}`,
          }}
          back={{ src: piece("the-tich-diem_sau.png"), alt: `Mặt sau thẻ tích điểm: ${loyalty.terms}` }}
        />
        <div className="grid gap-4 md:col-span-2 md:grid-cols-2 lg:col-span-1 lg:grid-cols-1">
          {vouchers.map((v) => (
            <div key={v.slug}>
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
                className="mt-2 inline-flex items-center gap-1.5 text-xs tracking-[0.12em] text-silver-700 uppercase transition-colors hover:text-brand-ink"
              >
                <IconDownload aria-hidden className="size-4" />
                Tải voucher
              </a>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-8 text-xs leading-relaxed tracking-[0.04em] text-silver-700">{terms}.</p>
    </section>
  );
}
