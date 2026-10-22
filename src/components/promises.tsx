import { IconDroplet, IconFeather, IconFlower } from "@tabler/icons-react";
import { SectionHeading } from "@/components/section-heading";
import { promises, type PromiseIcon } from "@/data/boongee";

const ICONS: Record<PromiseIcon, typeof IconFlower> = {
  flower: IconFlower,
  droplet: IconDroplet,
  feather: IconFeather,
};
/** Each badge's tint (Làng Mây accents, decoration only: the icon on it stays ink). */
const TINTS: Record<PromiseIcon, string> = {
  flower: "bg-brand-pink-300",
  droplet: "bg-brand-sky-200",
  feather: "bg-brand-moss-300",
};

/** What every Boongee drink keeps to: real flowers, gentle sweetness, a light brew. */
export function Promises() {
  return (
    <section aria-labelledby="promises-title">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <SectionHeading tagline={promises.tagline} title={promises.title} id="promises-title" />
        <ul className="grid gap-6 md:grid-cols-3">
          {promises.items.map((item) => {
            const Icon = ICONS[item.icon];
            return (
              <li key={item.title} className="card-sticker parallax-rise p-6 text-center md:p-8">
                <span className={`badge-sticker mx-auto size-16 ${TINTS[item.icon]}`}>
                  <Icon aria-hidden className="size-8" stroke={1.6} />
                </span>
                <h3 className="mt-4 text-2xl">{item.title}</h3>
                <p className="mt-2 text-lg text-brand-ink-muted">{item.text}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
