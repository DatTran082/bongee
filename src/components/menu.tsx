import { IconArrowUpRight } from "@tabler/icons-react";
import Image, { getImageProps } from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { GroupMark } from "@/components/group-mark";
import { MenuSpotlight, type SpotlightDish } from "@/components/menu-spotlight";
import { SectionHeading } from "@/components/section-heading";
import { menuIntro, sections } from "@/data/boongee";
import { dishDescription } from "@/data/descriptions";
import { photoOf } from "@/data/featured";
import { categories, customisation, type MenuCategory } from "@/data/menu";

// The menu: every drink on the till by group, each with its short description (src/data/descriptions.ts; names from
// Odoo; no prices since 21/11/2026, owner: "bỏ giá bán"), the topping / sugar / ice strips at the foot. From lg a large still life of the drink in focus stands beside the list (the
// lookbook's v5 photos): the one under the pointer, or the one crossing the middle of the screen as the page scrolls
// (src/components/menu-spotlight.tsx). On phones each drink carries a small picture instead. Nothing is ordered here;
// the full menu with a photo per dish is /menu.

const drinks = categories.filter((c) => c.id !== "topping");
const toppings = categories.find((c) => c.id === "topping")?.items ?? [];

/** "0 · 30 · 50 · 70 · 100%" → ["0%", "30%", "50%", "70%", "100%"] */
const levels = (label: string) =>
  (customisation.options.find((o) => o.label === label)?.options ?? "")
    .split("·")
    .map((o) => o.replace("%", "").trim())
    .filter(Boolean)
    .map((o) => `${o}%`);

/** Every drink with a photo, for the spotlight: its optimised picture props (built here, on the server). */
const spotlight: SpotlightDish[] = drinks.flatMap((group) =>
  group.items.flatMap((item) => {
    const photo = photoOf(item.name);
    if (!photo) return [];
    const { props } = getImageProps({
      src: photo.src,
      alt: item.name,
      width: photo.width,
      height: photo.height,
      sizes: "(min-width: 80rem) 32rem, 38vw",
    });
    return [{ name: item.name, group: group.title, description: dishDescription(item.name, item.note), image: props }];
  }),
);

function Group({ group, index }: { group: MenuCategory; index: number }) {
  return (
    <section aria-labelledby={`menu-${group.id}`} className="mb-16 last:mb-0 md:mb-20">
      <h3
        id={`menu-${group.id}`}
        className="flex items-center gap-4 border-b border-silver-300 pb-4 text-[0.8rem] font-normal tracking-[0.22em] uppercase"
      >
        <span className="text-silver-500 tabular-nums">{String(index + 1).padStart(2, "0")}</span>
        <GroupMark title={group.title} />
        {group.title}
      </h3>
      <ul>
        {group.items.map((item) => {
          const photo = photoOf(item.name);
          return (
            <li
              key={item.name}
              data-dish={photo ? item.name : undefined}
              className="menu-row flex items-start gap-4 border-b border-silver-200 py-4 md:py-5"
            >
              {photo && (
                <Image
                  src={photo.thumb}
                  alt=""
                  width={600}
                  height={750}
                  sizes="3.5rem"
                  className="aspect-[4/5] w-14 shrink-0 bg-[#BDAFA3] object-cover lg:hidden"
                />
              )}
              <span className="menu-row-name min-w-0 flex-1">
                <span className="block text-xl leading-snug font-light md:text-2xl">{item.name}</span>
                {dishDescription(item.name, item.note) && (
                  <span className="mt-1 block max-w-[40rem] text-sm leading-relaxed text-silver-700">
                    {dishDescription(item.name, item.note)}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** One strip at the foot: an ink label, then its choices on hairlines. */
function Strip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-silver-200 py-4 sm:flex-row sm:items-center sm:gap-6">
      <span className="w-fit shrink-0 rounded-full bg-brand-ink px-4 py-1 text-[0.7rem] tracking-[0.18em] whitespace-nowrap text-white uppercase sm:w-40 sm:text-center">
        {label}
      </span>
      <ul className="flex flex-1 flex-wrap gap-x-8 gap-y-1">{children}</ul>
    </div>
  );
}

export function Menu() {
  return (
    <section id={sections.menu} className="relative bg-white py-24 md:py-36">
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
        <div data-menu className="lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 xl:gap-24">
          <div className="hidden lg:block">
            <MenuSpotlight dishes={spotlight} />
          </div>
          <div>
            {drinks.map((group, i) => (
              <Group key={group.id} group={group} index={i} />
            ))}
          </div>
        </div>

        <div data-reveal className="mt-16 border-t border-silver-300">
          {toppings.length > 0 && (
            <Strip label="Topping thêm">
              {toppings.map((t) => (
                <li key={t.name}>{t.name}</li>
              ))}
            </Strip>
          )}
          <div className="lg:grid lg:grid-cols-[3fr_2fr] lg:gap-10">
            {(["Đường", "Đá"] as const).map((label) => (
              <Strip key={label} label={label}>
                {levels(label).map((level) => (
                  <li key={level} className="tabular-nums">
                    {level}
                  </li>
                ))}
              </Strip>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
