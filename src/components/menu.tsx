import { IconArrowUpRight } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { SectionHeading } from "@/components/section-heading";
import { menuIntro, sections } from "@/data/boongee";
import board from "@/data/menu-featured.json";
import { categories, customisation, formatPrice, type MenuCategory } from "@/data/menu";

// The menu as the printed menu board (brandkit/menu-board/thuc-don.pdf), set in the site's white and metallic
// silver: the featured cups (Blender renders, public/menu/ly) in a column, the drink groups under their monogram
// mark with each drink's plain line and counter price, the lookbook poster under the last group, the topping /
// sugar / ice strips at the foot. Static: nothing is picked or ordered here; a cup opens its group on /menu.

/** Each group's heading mark (the board's painted monogram marks, drawn here as a silver silhouette). */
const MARKS: Readonly<Record<string, string>> = board.marks;

const drinks = categories.filter((c) => c.id !== "topping");
const toppings = categories.find((c) => c.id === "topping")?.items ?? [];
const groupOf = (name: string) => drinks.find((g) => g.items.some((i) => i.name === name));
/** a cup whose drink left the till is left out */
const cups = board.cups.flatMap((cup) => {
  const group = groupOf(cup.name);
  return group ? [{ ...cup, group: group.id }] : [];
});
/** the board's three columns: two groups, two groups, then the last group over the poster */
const columns = [drinks.slice(0, 2), drinks.slice(2, 4), drinks.slice(4)];

/** "0 · 30 · 50 · 70 · 100%" → ["0%", "30%", "50%", "70%", "100%"] */
const levels = (label: string) =>
  (customisation.options.find((o) => o.label === label)?.options ?? "")
    .split("·")
    .map((o) => o.replace("%", "").trim())
    .filter(Boolean)
    .map((o) => `${o}%`);

function Mark({ title }: { title: string }) {
  const src = MARKS[title];
  if (!src) return null;
  return (
    <span
      aria-hidden
      className="size-7 shrink-0 bg-silver-600"
      style={{ mask: `url(${src}) center / contain no-repeat`, WebkitMask: `url(${src}) center / contain no-repeat` }}
    />
  );
}

function Group({ group }: { group: MenuCategory }) {
  return (
    <section aria-labelledby={`menu-${group.id}`} className="mb-12 last:mb-0">
      <h3
        id={`menu-${group.id}`}
        className="flex items-center gap-3 border-b border-silver-300 pb-3 text-base font-normal tracking-[0.12em] uppercase"
      >
        <Mark title={group.title} />
        {group.title}
      </h3>
      <ul className="mt-3 space-y-4">
        {group.items.map((item) => (
          <li key={item.name} className="flex items-baseline justify-between gap-4">
            <span className="min-w-0">
              <span className="block text-[1.05rem] leading-snug">{item.name}</span>
              {item.note && <span className="block text-xs leading-snug text-silver-700">{item.note}</span>}
            </span>
            <span className="shrink-0 tabular-nums">{item.prices.map(formatPrice).join(" · ")}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** One strip at the board's foot: an ink label, then its choices on hairlines. */
function Strip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-silver-200 py-3 sm:flex-row sm:items-center sm:gap-6">
      <span className="w-fit shrink-0 rounded-full bg-brand-ink px-4 py-1 text-[0.7rem] tracking-[0.18em] whitespace-nowrap text-white uppercase sm:w-40 sm:text-center">
        {label}
      </span>
      <ul className="flex flex-1 flex-wrap gap-x-8 gap-y-1">{children}</ul>
    </div>
  );
}

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

        <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[17rem_minmax(0,1fr)]">
          <ul
            aria-label="Món nổi bật"
            className="-mx-4 mb-12 flex snap-x gap-2 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:mb-0 lg:grid lg:grid-cols-2 lg:content-start lg:gap-x-2 lg:gap-y-4 lg:overflow-visible lg:border-r lg:border-silver-200 lg:px-0 lg:pr-8"
          >
            {cups.map((cup) => (
              <li key={cup.file} className="w-28 shrink-0 snap-start lg:w-auto">
                <Link
                  href={`/menu#${cup.group}`}
                  className="group flex flex-col items-center rounded-2xl pt-2 pb-3 focus-visible:outline-2 focus-visible:outline-brand-ink"
                >
                  <span aria-hidden className="relative w-full">
                    <Image
                      src={cup.src}
                      alt=""
                      width={450}
                      height={630}
                      sizes="7rem"
                      className="relative z-10 h-auto w-full transition-transform duration-500 ease-out group-hover:-translate-y-1 motion-reduce:transition-none"
                    />
                    <span className="absolute inset-x-[12%] bottom-0 h-2.5 rounded-full bg-silver-100" />
                  </span>
                  <span className="mt-2 text-center text-sm leading-tight">{cup.name}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="grid gap-x-12 md:grid-cols-2 xl:grid-cols-3">
            {columns.map((column, i) => (
              <div key={i} className="mb-12 md:last:col-span-2 xl:mb-0 xl:last:col-span-1">
                {column.map((group) => (
                  <Group key={group.id} group={group} />
                ))}
                {i === columns.length - 1 && board.poster && (
                  <figure className="mt-10 overflow-hidden rounded-2xl bg-silver-100">
                    <Image
                      src={board.poster}
                      alt="Ly giấy Boongee và ly trà nho xanh trên bệ trắng, bên nho tươi và hoa nhài"
                      width={1400}
                      height={800}
                      sizes="(min-width: 80rem) 24rem, (min-width: 48rem) 60vw, 100vw"
                      className="h-auto w-full"
                    />
                  </figure>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t border-silver-300">
          {toppings.length > 0 && (
            <Strip label="Topping thêm">
              {toppings.map((t) => (
                <li key={t.name} className="flex items-baseline gap-3">
                  {t.name}
                  <span className="text-silver-700 tabular-nums">+{formatPrice(t.prices[0])}</span>
                </li>
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
        <p className="mt-4 text-xs tracking-[0.12em] text-silver-700">Ảnh minh hoạ · Giá tại quầy</p>
      </div>
    </section>
  );
}
