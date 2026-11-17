import { IconArrowRight } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { menuIntro, sections } from "@/data/boongee";
import { lookbookGroups } from "@/data/lookbook";
import { formatPrice, itemCount, priceRange, sizes } from "@/data/menu";
import type { LookbookGroup } from "@/lib/lookbook/join";

/** Till groups that are not drinks: on /menu only. */
const NOT_DRINKS = new Set(["combo", "topping"]);

const sizeLine =
  sizes.length > 1
    ? `Ly ${sizes.map((s) => `${s.label} ${s.volume.replace("ml", " ml")}`).join(", ")}`
    : `Ly ${sizes[0].volume.replace("ml", " ml")}`;

interface GroupCard {
  id: string;
  title: string;
  count: number;
  from: number;
  /** the first dish of the group that has a lookbook photo */
  photo: { src: string; alt: string } | null;
}

function toCard(group: LookbookGroup): GroupCard {
  const shown = group.items.find((item) => item.photo);
  return {
    id: group.id,
    title: group.title,
    count: group.items.length,
    from: Math.min(...group.items.flatMap((item) => item.prices)),
    photo: shown?.photo ? { src: shown.photo.thumb, alt: shown.name } : null,
  };
}

const cards = lookbookGroups.filter((group) => !NOT_DRINKS.has(group.id)).map(toCard);

/**
 * The menu in one row of real photos (the lookbook, AI studio pictures, so marked as illustrations): one card per
 * drink group, its count and starting price from the till (Odoo), each opening that group on /menu, where every dish
 * has its photo and prices. A strip that scrolls sideways on phones, five columns on wide screens.
 */
export function Menu() {
  return (
    <section id={sections.menu} className="py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          tagline={menuIntro.tagline}
          title={menuIntro.title}
          subtitle={`${itemCount} món, ${formatPrice(priceRange.min)} – ${formatPrice(priceRange.max)}. ${sizeLine}.`}
        />
      </div>
      <ul className="mx-auto flex max-w-7xl snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:px-6 lg:grid lg:grid-cols-5 lg:overflow-visible">
        {cards.map((card) => (
          <li key={card.id} className="w-[68vw] max-w-72 shrink-0 snap-center lg:w-auto lg:max-w-none">
            <Link
              href={`/menu#${card.id}`}
              className="group block overflow-hidden rounded-3xl bg-brand-bg-alt shadow-sticker focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-ink"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                {card.photo ? (
                  <Image
                    src={card.photo.src}
                    alt={card.photo.alt}
                    fill
                    sizes="(min-width: 64rem) 18vw, 68vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : null}
              </div>
              <div className="flex items-end justify-between gap-2 px-4 py-3">
                <div>
                  <h3 className="text-lg leading-tight">{card.title}</h3>
                  <p className="text-sm text-brand-ink-muted">
                    {card.count} món · từ {formatPrice(card.from)}
                  </p>
                </div>
                <IconArrowRight
                  aria-hidden
                  className="mb-1 size-5 shrink-0 transition-transform group-hover:translate-x-1"
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-6 text-center">
        <Link
          href="/menu"
          data-variant="primary"
          className="button-game inline-flex items-center gap-2 rounded-full px-6 py-2.5"
        >
          {menuIntro.more}
          <IconArrowRight aria-hidden className="size-4" />
        </Link>
        <p className="mt-3 text-sm text-brand-ink-muted">Ảnh minh hoạ.</p>
      </div>
    </section>
  );
}
