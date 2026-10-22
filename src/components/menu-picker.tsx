"use client";

import { IconCheck } from "@tabler/icons-react";
import Image from "next/image";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { menuIntro } from "@/data/boongee";
import board from "@/data/menu-featured.json";
import { categories, customisation, formatPrice, type MenuCategory, type MenuCategoryId, sizes } from "@/data/menu";

// The menu as the printed menu board (brandkit-ghibli/thuc-don/thuc-don.pdf), alive. The same layout: the featured
// cups (Blender toon renders, public/menu/ly) in a column, the drink groups under a painted monogram mark with their
// plain lines and M / L prices in small size discs, the lookbook poster, the topping / sugar / ice strips at the foot.
// A group is active while it crosses the middle of the viewport (data-active): its mark turns (lang-may.css,
// .mark-spin). Picking a drink (a row, or a cup) or a strip's choice only marks it. Nothing is ordered here.

/** Each group's heading mark's URL: its painted monogram mark (as the board; brandkit-ghibli → public/menu/mark). */
const MARKS: Readonly<Record<string, string>> = board.marks;
/** The default sugar level: the promise's 50 % (src/data/boongee.ts, promises). */
const DEFAULT_SUGAR = "50%";

interface Pick {
  readonly group: MenuCategoryId;
  readonly name: string;
}

/** "0 · 30 · 50 · 70 · 100%" → ["0%", "30%", "50%", "70%", "100%"] */
const levels = (options: string) => options.split("·").map((o) => `${o.replace("%", "").trim()}%`);

/** A four-pointed sparkle, the featured drink's mark (as the board). */
function Sparkle({ className }: { className: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className}>
      <path d="M12 0Q13.4 10.6 24 12Q13.4 13.4 12 24Q10.6 13.4 0 12Q10.6 10.6 12 0Z" fill="currentColor" />
    </svg>
  );
}

function Mark({ title }: { title: string }) {
  const src = MARKS[title];
  if (!src) return null;
  return (
    <Image src={src} alt="" aria-hidden width={40} height={40} unoptimized className="mark-spin size-10 shrink-0" />
  );
}

function Group({ group, pick, onPick }: { group: MenuCategory; pick: Pick; onPick: (pick: Pick) => void }) {
  return (
    <section
      id={`mon-${group.id}`}
      aria-labelledby={`mon-${group.id}-title`}
      className="menu-group mb-10 scroll-mt-28 break-inside-avoid"
    >
      <h3
        id={`mon-${group.id}-title`}
        className="flex items-center gap-3 border-b-2 border-brand-pink-700/50 pb-3 text-lg font-bold tracking-wide uppercase"
      >
        <Mark title={group.title} />
        {group.title}
      </h3>
      <ul className="mt-2">
        {group.items.map((item) => {
          const picked = pick.group === group.id && pick.name === item.name;
          const featured = item.name === menuIntro.featured;
          const priceText = item.prices
            .map((price, i) => (item.prices.length > 1 ? `cỡ ${sizes[i]?.label} ${price} nghìn` : `${price} nghìn`))
            .join(", ");
          return (
            <li key={item.name}>
              <button
                type="button"
                aria-pressed={picked}
                aria-label={`${item.name}${item.note ? `, ${item.note.toLowerCase()}` : ""}, ${priceText}`}
                onClick={() => onPick({ group: group.id, name: item.name })}
                className="-mx-2 flex w-[calc(100%+1rem)] items-start gap-2 rounded-2xl px-2 py-2.5 text-left transition-colors hover:bg-brand-pink-100 focus-visible:outline-2 focus-visible:outline-brand-ink aria-pressed:bg-brand-pink-100"
              >
                <span className="mt-1 grid size-5 shrink-0 place-items-center">
                  {featured && (
                    <span className="grid size-5 place-items-center rounded-full bg-brand-honey-400">
                      <Sparkle className="size-3 text-brand-ink" />
                    </span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[1.08rem] leading-snug font-medium">{item.name}</span>
                  {item.note && (
                    <span className="block text-xs leading-snug text-brand-ink-muted italic">{item.note}</span>
                  )}
                </span>
                {item.prices.map((price, i) => {
                  const label = item.prices.length > 1 ? sizes[i]?.label : null;
                  return (
                    <span
                      key={i}
                      className={`mt-0.5 flex w-[4.2rem] shrink-0 items-center justify-end gap-1.5 tabular-nums ${picked ? "font-bold" : ""}`}
                    >
                      {label && (
                        <span
                          aria-hidden
                          className="grid size-[1.15rem] place-items-center rounded-full bg-brand-sky-200 text-[0.6rem] leading-none font-semibold"
                        >
                          {label}
                        </span>
                      )}
                      {formatPrice(price)}
                    </span>
                  );
                })}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** One strip at the board's foot: a dark label, then its choices. */
function Strip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-b border-brand-pink-700/40 py-3 lg:flex-row lg:items-center lg:gap-4">
      <span className="w-fit shrink-0 rounded-md bg-brand-ink px-4 py-1.5 text-xs font-semibold tracking-[0.15em] text-white uppercase lg:w-40 lg:text-center">
        {label}
      </span>
      <div className="-mx-1 flex flex-1 gap-2 overflow-x-auto px-1 pb-1 lg:overflow-visible lg:pb-0">{children}</div>
    </div>
  );
}

function Cell({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-brand-line bg-brand-bg-alt px-4 py-1.5 text-[0.95rem] whitespace-nowrap transition-colors hover:border-brand-ink focus-visible:outline-2 focus-visible:outline-brand-ink aria-pressed:border-brand-ink aria-pressed:bg-brand-ink aria-pressed:text-white lg:flex-1"
    >
      {on && <IconCheck aria-hidden className="size-4" />}
      {children}
    </button>
  );
}

export function MenuPicker() {
  const drinks = useMemo(() => categories.filter((c) => c.id !== "topping"), []);
  const toppings = categories.find((c) => c.id === "topping")?.items ?? [];
  const sugarLevels = levels(customisation.options.find((o) => o.label === "Đường")?.options ?? "");
  const iceLevels = levels(customisation.options.find((o) => o.label === "Đá")?.options ?? "");
  const groupOf = (name: string) => drinks.find((g) => g.items.some((i) => i.name === name));
  const cups = board.cups.filter((cup) => groupOf(cup.name)); // a cup whose drink left the menu is left out
  const start = groupOf(menuIntro.featured) ?? drinks[0];
  const [pick, setPick] = useState<Pick>({
    group: start.id,
    name: start.items.find((i) => i.name === menuIntro.featured)?.name ?? start.items[0].name,
  });
  const [sugar, setSugar] = useState(sugarLevels.includes(DEFAULT_SUGAR) ? DEFAULT_SUGAR : sugarLevels[0]);
  const [ice, setIce] = useState(iceLevels[iceLevels.length - 1]);
  const [extra, setExtra] = useState<string[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);

  // a group is active while it crosses the viewport's middle band; written straight to the DOM, no re-render
  useEffect(() => {
    const groups = rootRef.current?.querySelectorAll(".menu-group");
    if (!groups?.length) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.target.toggleAttribute("data-active", entry.isIntersecting)),
      { rootMargin: "-30% 0px -30% 0px" },
    );
    groups.forEach((g) => observer.observe(g));
    return () => observer.disconnect();
  }, []);

  const toggleTopping = (name: string) =>
    setExtra((list) => (list.includes(name) ? list.filter((n) => n !== name) : [...list, name]));

  return (
    <div ref={rootRef}>
      <div className="lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[19rem_minmax(0,1fr)]">
        <div className="mb-8 lg:mb-0 lg:border-r-2 lg:border-brand-pink-700/40 lg:pr-8">
          <ul
            aria-label="Món nổi bật"
            className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-2 lg:gap-x-3 lg:gap-y-6 lg:overflow-visible lg:px-0"
          >
            {cups.map((cup) => {
              const g = groupOf(cup.name);
              return (
                <li key={cup.file} className="w-32 shrink-0 snap-start lg:w-auto">
                  <button
                    type="button"
                    aria-pressed={pick.name === cup.name}
                    onClick={() => g && setPick({ group: g.id, name: cup.name })}
                    className="group/cup relative flex w-full flex-col items-center rounded-3xl px-1 pt-2 pb-3 transition-colors hover:bg-brand-pink-100/60 focus-visible:outline-2 focus-visible:outline-brand-ink aria-pressed:bg-brand-pink-100"
                  >
                    <span aria-hidden className="absolute bottom-11 h-3 w-16 rounded-full bg-brand-cloud-shade/80" />
                    <Image
                      src={cup.src}
                      alt=""
                      width={450}
                      height={630}
                      sizes="8rem"
                      className="relative h-auto w-[86%] transition-transform duration-300 group-hover/cup:-translate-y-1 group-aria-pressed/cup:-translate-y-1 motion-reduce:transition-none"
                    />
                    {cup.badge && (
                      <span className="absolute top-3 right-1 grid size-12 place-items-center rounded-full bg-brand-honey-400 text-center text-[0.6rem] leading-tight font-bold tracking-wide uppercase">
                        {cup.badge}
                      </span>
                    )}
                    <span className="mt-2 text-center text-[0.95rem] leading-tight font-bold">{cup.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="md:columns-2 md:gap-10">
          {drinks.map((g) => (
            <Group key={g.id} group={g} pick={pick} onPick={setPick} />
          ))}
          {board.poster && (
            <figure className="mb-10 break-inside-avoid overflow-hidden rounded-[2rem] shadow-sticker">
              <Image
                src={board.poster}
                alt="Ba ly Boongee trên phiến đá: ly giấy đậy nắp, ly kem bông rắc cánh hồng, ly trà nho"
                width={1400}
                height={1120}
                sizes="(min-width: 64rem) 28rem, (min-width: 48rem) 45vw, 100vw"
                className="h-auto w-full"
              />
            </figure>
          )}
        </div>
      </div>

      <div id="mon-topping" className="mt-2 scroll-mt-28 border-t-2 border-brand-pink-700/40">
        <Strip label="Topping thêm">
          {toppings.map((t) => (
            <Cell key={t.name} on={extra.includes(t.name)} onClick={() => toggleTopping(t.name)}>
              {t.name}
              <span className="opacity-80">+{formatPrice(t.prices[0])}</span>
            </Cell>
          ))}
        </Strip>
        <div className="lg:grid lg:grid-cols-[3fr_2fr] lg:gap-6">
          <Strip label="Đường">
            {sugarLevels.map((level) => (
              <Cell key={level} on={sugar === level} onClick={() => setSugar(level)}>
                {level}
              </Cell>
            ))}
          </Strip>
          <Strip label="Đá">
            {iceLevels.map((level) => (
              <Cell key={level} on={ice === level} onClick={() => setIce(level)}>
                {level}
              </Cell>
            ))}
          </Strip>
        </div>
      </div>
    </div>
  );
}
