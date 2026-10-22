"use client";

import {
  IconCheck,
  IconCheese,
  IconCloud,
  IconCoffee,
  IconFlower,
  IconLemon2,
  IconPlus,
  type IconProps,
} from "@tabler/icons-react";
import { type ComponentType, useEffect, useMemo, useRef, useState } from "react";
import { CupAnchor } from "@/components/cup-anchor";
import { menuIntro } from "@/data/boongee";
import { flavors } from "@/data/flavors";
import {
  categories,
  customisation,
  formatPrice,
  type MenuCategory,
  type MenuCategoryId,
  type MenuItem,
  sizes,
} from "@/data/menu";
import { claimFlavor, glideFlavorTo } from "@/lib/cup-scene/flavor-scroll";
import { restProgress } from "@/lib/cup-scene/flavor-track";

// The menu as a picker, after the printed menu's layout (groups with a round mark, M / L prices in small size
// discs, a topping strip and sugar / ice strips at the foot) but alive: picking a drink turns the 3D cup in the
// left column (the flavour carousel's cup, which the menu holds while it is on screen: flavor-scroll.ts) to its
// group's cup, and "Ly của bạn" adds up the size, the toppings and the price (counter prices from the shop's Odoo).
// Nothing is ordered here. On phones the pick also rides in a bar at the foot of the screen while the menu is in view.

/** Each group's round mark: an icon on an accent tint (decoration only; the icon stays ink). */
const MARKS: Record<MenuCategoryId, { Icon: ComponentType<IconProps>; tint: string }> = {
  "huong-hoa": { Icon: IconFlower, tint: "bg-brand-pink-300" },
  "kem-bong": { Icon: IconCloud, tint: "bg-brand-cream-300" },
  "trai-cay": { Icon: IconLemon2, tint: "bg-brand-moss-300" },
  "kem-cheese": { Icon: IconCheese, tint: "bg-brand-honey-400" },
  "ca-phe": { Icon: IconCoffee, tint: "bg-brand-stone-300" },
  topping: { Icon: IconPlus, tint: "bg-brand-sky-200" },
};
/** How long the cup takes to turn to a picked drink's group (ms). */
const GLIDE_MS = 900;
/** The default sugar level: the promise's 50 % (src/data/boongee.ts, promises). */
const DEFAULT_SUGAR = "50%";

type Size = "M" | "L";
interface Pick {
  readonly group: MenuCategoryId;
  readonly name: string;
}

/** "0 · 30 · 50 · 70 · 100%" → ["0%", "30%", "50%", "70%", "100%"] */
const levels = (options: string) => options.split("·").map((o) => `${o.replace("%", "").trim()}%`);

const priceFor = (item: MenuItem, size: Size) =>
  item.prices.length > 1 && size === "L" ? item.prices[1] : item.prices[0];

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Turns the carousel's cup to a drink group's cup (toppings have none: the cup stays). */
function turnCupTo(group: MenuCategoryId, glide: boolean) {
  const index = flavors.findIndex((flavor) => flavor.id === group);
  if (index < 0) return;
  glideFlavorTo(restProgress(index, flavors.length), "menu", glide ? GLIDE_MS : 0, reducedMotion());
}

function SizeDisc({ label }: { label: string }) {
  return (
    <span
      aria-hidden
      className="grid size-5 shrink-0 place-items-center rounded-full bg-brand-sky-200 text-[0.65rem] leading-none font-semibold"
    >
      {label}
    </span>
  );
}

function GroupCard({
  group,
  pick,
  size,
  onPick,
}: {
  group: MenuCategory;
  pick: Pick;
  size: Size;
  onPick: (pick: Pick) => void;
}) {
  const { Icon, tint } = MARKS[group.id];
  return (
    <section
      id={`mon-${group.id}`}
      aria-labelledby={`mon-${group.id}-title`}
      className="card-sticker scroll-mt-36 p-5 md:p-6"
    >
      <h3 id={`mon-${group.id}-title`} className="flex items-center gap-3 text-xl font-semibold">
        <span className={`badge-sticker size-9 ${tint}`}>
          <Icon aria-hidden className="size-5" stroke={1.7} />
        </span>
        {group.title}
      </h3>
      <ul className="mt-3 divide-y divide-brand-line">
        {group.items.map((item) => {
          const picked = pick.group === group.id && pick.name === item.name;
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
                className="my-1 flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left transition-colors hover:bg-brand-pink-100 focus-visible:outline-2 focus-visible:outline-brand-ink aria-pressed:bg-brand-pink-100 aria-pressed:shadow-sticker-small"
              >
                <span className="min-w-0 flex-1">
                  <span className="text-[1.05rem]">{item.name}</span>
                  {item.note && <span className="block text-xs leading-snug text-brand-ink-muted">{item.note}</span>}
                  {item.name === menuIntro.featured && (
                    <span className="ml-2 inline-block rounded-full bg-brand-honey-400 px-2 py-0.5 align-middle text-[0.7rem] font-semibold">
                      Nên thử
                    </span>
                  )}
                </span>
                {item.prices.map((price, i) => {
                  const label = item.prices.length > 1 ? sizes[i]?.label : null;
                  const strong = picked && (!label || label === size);
                  return (
                    <span
                      key={i}
                      className={`flex w-16 items-center justify-end gap-1.5 tabular-nums ${strong ? "font-semibold" : ""}`}
                    >
                      {label && <SizeDisc label={label} />}
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

/** A row of choices at the menu's foot (sugar, ice, toppings), after the printed menu's strips. */
function Strip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-4">
      <span className="w-fit shrink-0 rounded-full bg-brand-ink px-3 py-1 text-xs tracking-[0.15em] text-white uppercase sm:w-36 sm:text-center">
        {label}
      </span>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible">{children}</div>
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-brand-line bg-brand-bg-alt px-3.5 py-1.5 text-sm whitespace-nowrap transition-colors hover:border-brand-ink focus-visible:outline-2 focus-visible:outline-brand-ink aria-pressed:border-brand-ink aria-pressed:bg-brand-ink aria-pressed:text-white"
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
  const featuredGroup = drinks.find((g) => g.items.some((i) => i.name === menuIntro.featured)) ?? drinks[0];
  const [pick, setPick] = useState<Pick>({
    group: featuredGroup.id,
    name: featuredGroup.items.find((i) => i.name === menuIntro.featured)?.name ?? featuredGroup.items[0].name,
  });
  const [size, setSize] = useState<Size>("M");
  const [sugar, setSugar] = useState(sugarLevels.includes(DEFAULT_SUGAR) ? DEFAULT_SUGAR : sugarLevels[0]);
  const [ice, setIce] = useState(iceLevels[iceLevels.length - 1]);
  const [extra, setExtra] = useState<string[]>([]);
  const [inView, setInView] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const group = drinks.find((g) => g.id === pick.group) ?? drinks[0];
  const item = group.items.find((i) => i.name === pick.name) ?? group.items[0];
  const sized = item.prices.length > 1;
  const toppingTotal = toppings.filter((t) => extra.includes(t.name)).reduce((sum, t) => sum + t.prices[0], 0);
  const total = priceFor(item, size) + toppingTotal;

  // the menu holds the carousel's cup while it is on screen, and turns it to the pick's group as it comes in
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.08 });
    observer.observe(root);
    return () => {
      observer.disconnect();
      claimFlavor("menu", false);
    };
  }, []);
  useEffect(() => {
    claimFlavor("menu", inView);
    if (inView) turnCupTo(pick.group, true);
  }, [inView, pick.group]);

  const onPick = (next: Pick) => {
    setPick(next);
    const nextGroup = drinks.find((g) => g.id === next.group);
    const nextItem = nextGroup?.items.find((i) => i.name === next.name);
    if (nextItem && nextItem.prices.length < 2) setSize("M");
  };
  const toggleTopping = (name: string) =>
    setExtra((list) => (list.includes(name) ? list.filter((n) => n !== name) : [...list, name]));
  const sizeVolume = (label: Size) => sizes.find((s) => s.label === label)?.volume.replace("ml", " ml") ?? "";

  const sizeSwitch = (compact: boolean) =>
    sized && (
      <div role="radiogroup" aria-label="Cỡ ly" className="flex gap-1.5">
        {(["M", "L"] as const).map((label) => (
          <button
            key={label}
            type="button"
            role="radio"
            aria-checked={size === label}
            onClick={() => setSize(label)}
            className="rounded-full border border-brand-line bg-brand-bg-alt px-3 py-1 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-brand-ink aria-checked:border-brand-ink aria-checked:bg-brand-ink aria-checked:text-white"
          >
            {label}
            {!compact && <span className="ml-1 opacity-80">{sizeVolume(label)}</span>}
          </button>
        ))}
      </div>
    );

  return (
    <div ref={rootRef}>
      <div className="cup-grid flex flex-col pb-20 lg:grid lg:grid-cols-[19rem_minmax(0,1fr)] lg:gap-10 lg:pb-0 xl:grid-cols-[22rem_minmax(0,1fr)]">
        {/* phones: the aside dissolves (contents), its cup first and its card last, after the strips */}
        <aside className="contents lg:sticky lg:top-24 lg:block lg:self-start">
          <CupAnchor
            name="menu"
            actor="flavor"
            tilt={0.12}
            fill={0.82}
            className="order-1 mb-6 h-[28vh] max-h-[16rem] lg:mb-0 lg:h-[42vh] lg:max-h-[24rem]"
          />
          <div ref={cardRef} id="ly-cua-ban" className="card-sticker order-3 mt-6 scroll-mt-28 p-5 lg:mt-4">
            <p className="text-xs tracking-[0.2em] text-brand-pink-800 uppercase">Ly của bạn</p>
            <p className="mt-1 text-2xl" aria-live="polite">
              {item.name}
            </p>
            <p className="text-sm text-brand-ink-muted">{item.note ?? group.title}</p>
            <div className="mt-3">{sizeSwitch(false)}</div>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
              <dt className="text-brand-ink-muted">Đường</dt>
              <dd>{sugar}</dd>
              <dt className="text-brand-ink-muted">Đá</dt>
              <dd>{ice}</dd>
              <dt className="text-brand-ink-muted">Topping</dt>
              <dd>{extra.length ? extra.join(", ") : "Không"}</dd>
            </dl>
            <p className="mt-4 flex items-baseline justify-between border-t border-brand-line pt-3">
              <span>Tạm tính</span>
              <span className="text-3xl tabular-nums" aria-live="polite">
                {formatPrice(total)}
              </span>
            </p>
            <p className="mt-1 text-xs text-brand-ink-muted">Giá tại quầy.</p>
          </div>
        </aside>

        <div className="order-2">
          <nav
            aria-label="Nhóm món"
            className="sticky top-16 z-10 -mx-4 mb-5 flex gap-2 overflow-x-auto bg-brand-bg px-4 py-2.5 shadow-[0_10px_12px_-10px_rgb(30_26_28/0.12)] sm:-mx-1 sm:px-1"
          >
            {categories.map((g) => {
              const { Icon, tint } = MARKS[g.id];
              return (
                <a
                  key={g.id}
                  href={`#mon-${g.id}`}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border border-brand-line bg-brand-bg-alt py-1 pr-3.5 pl-1 text-sm whitespace-nowrap transition-colors hover:border-brand-ink"
                >
                  <span className={`grid size-6 place-items-center rounded-full ${tint}`}>
                    <Icon aria-hidden className="size-3.5" stroke={1.8} />
                  </span>
                  {g.title}
                </a>
              );
            })}
          </nav>
          <div className="grid items-start gap-6 md:grid-cols-2">
            {drinks.map((g) => (
              <GroupCard key={g.id} group={g} pick={pick} size={size} onPick={onPick} />
            ))}
          </div>
          <div id="mon-topping" className="card-sticker mt-6 scroll-mt-36 divide-y divide-brand-line px-5 py-2 md:px-6">
            <Strip label="Topping thêm">
              {toppings.map((t) => (
                <Chip key={t.name} on={extra.includes(t.name)} onClick={() => toggleTopping(t.name)}>
                  {t.name}
                  <span className="opacity-80">+{formatPrice(t.prices[0])}</span>
                </Chip>
              ))}
            </Strip>
            <Strip label="Đường">
              {sugarLevels.map((level) => (
                <Chip key={level} on={sugar === level} onClick={() => setSugar(level)}>
                  {level}
                </Chip>
              ))}
            </Strip>
            <Strip label="Đá">
              {iceLevels.map((level) => (
                <Chip key={level} on={ice === level} onClick={() => setIce(level)}>
                  {level}
                </Chip>
              ))}
            </Strip>
          </div>
        </div>
      </div>

      {/* phones: the pick at the foot of the screen while the menu is in view */}
      <div
        aria-hidden={!inView}
        className={`fixed inset-x-3 bottom-3 z-40 transition-[translate,opacity] duration-300 lg:hidden ${inView ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"}`}
      >
        <div className="card-sticker flex items-center gap-3 px-4 py-2.5">
          <button
            type="button"
            tabIndex={inView ? 0 : -1}
            onClick={() => cardRef.current?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth" })}
            className="min-w-0 flex-1 text-left"
          >
            <span className="block truncate">{item.name}</span>
            <span className="block truncate text-xs text-brand-ink-muted">
              {sized ? `${size} · ` : ""}
              {sugar} đường · {ice} đá{extra.length ? ` · +${extra.length} topping` : ""}
            </span>
          </button>
          {sizeSwitch(true)}
          <span className="text-xl tabular-nums">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}
