import { IconCup, IconIceCream2, IconLemon2, IconMug } from "@tabler/icons-react";
import { SectionHeading } from "@/components/section-heading";
import { drinks, sections, type DrinkIcon } from "@/data/boongee";

const ICONS: Record<DrinkIcon, typeof IconCup> = {
  cup: IconCup,
  lemon: IconLemon2,
  "ice-cream": IconIceCream2,
  mug: IconMug,
};

/** The drink families (the full menu is not known yet, see src/data/boongee.ts). */
export function Drinks() {
  return (
    <section id={sections.drinks} className="mx-auto max-w-5xl px-4 py-16 sm:px-6 md:py-24">
      <SectionHeading tagline={drinks.tagline} title={drinks.title} subtitle={drinks.subtitle} />
      <ul className="grid gap-8 sm:grid-cols-2 md:gap-x-12 md:gap-y-10">
        {drinks.items.map((item) => {
          const Icon = ICONS[item.icon];
          return (
            <li key={item.title} className="flex gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-ink text-white">
                <Icon aria-hidden className="size-6" />
              </span>
              <div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-1 text-brand-ink-muted">{item.description}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
