import { IconArrowUpRight } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { CupAnchor } from "@/components/cup-anchor";
import { SectionHeading } from "@/components/section-heading";
import { menuIntro, sections } from "@/data/boongee";
import { lookbookGroups } from "@/data/lookbook";
import type { LookbookGroup } from "@/lib/lookbook/join";

/** Till groups that are not drinks: on /menu only. */
const NOT_DRINKS = new Set(["combo", "topping"]);

interface GroupCard {
  id: string;
  title: string;
  /** the first dish of the group that has a lookbook photo */
  photo: { src: string; alt: string } | null;
}

function toCard(group: LookbookGroup): GroupCard {
  const shown = group.items.find((item) => item.photo);
  return {
    id: group.id,
    title: group.title,
    photo: shown?.photo ? { src: shown.photo.thumb, alt: shown.name } : null,
  };
}

const cards = lookbookGroups.filter((group) => !NOT_DRINKS.has(group.id)).map(toCard);

/**
 * The menu as a quiet row of photos (the lookbook: AI studio pictures, so marked as illustrations), one per drink
 * group, each opening that group on /menu; the full menu, with every dish and its price, is there. A strip that
 * scrolls sideways on phones, five columns on wide screens. The frosted PP cup rests beside the heading there.
 */
export function Menu() {
  return (
    <section id={sections.menu} className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          tagline={menuIntro.tagline}
          title={menuIntro.title}
          aside={
            <Link href="/menu" data-variant="outline" className="btn px-5 py-2.5">
              {menuIntro.more}
              <IconArrowUpRight aria-hidden className="size-4" />
            </Link>
          }
        />
      </div>
      <div className="cup-grid mx-auto max-w-7xl lg:grid lg:grid-cols-[minmax(0,1fr)_13rem] lg:items-center lg:gap-10 lg:px-6">
        <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:px-6 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0">
          {cards.map((card) => (
            <li key={card.id} className="w-[64vw] max-w-64 shrink-0 snap-center lg:w-auto lg:max-w-none">
              <Link
                href={`/menu#${card.id}`}
                className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-ink"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-silver-100">
                  {card.photo ? (
                    <Image
                      src={card.photo.src}
                      alt={card.photo.alt}
                      fill
                      sizes="(min-width: 64rem) 15vw, 64vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  ) : null}
                </div>
                <h3 className="mt-4 flex items-center justify-between gap-2 text-base font-normal">
                  {card.title}
                  <IconArrowUpRight
                    aria-hidden
                    className="size-4 shrink-0 text-silver-500 transition-colors group-hover:text-brand-ink"
                  />
                </h3>
              </Link>
            </li>
          ))}
        </ul>
        <CupAnchor name="menu" actor="pp" turn={0.5} tilt={0.12} fill={0.62} className="hidden lg:block lg:h-[24rem]" />
      </div>
      <p className="mx-auto mt-4 max-w-7xl px-4 text-xs tracking-[0.12em] text-silver-700 sm:px-6">Ảnh minh hoạ</p>
    </section>
  );
}
