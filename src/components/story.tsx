import { IconDroplet, IconFeather, IconFlower } from "@tabler/icons-react";
import { CupAnchor } from "@/components/cup-anchor";
import { SectionHeading } from "@/components/section-heading";
import { type PromiseIcon, promises, sections, story } from "@/data/boongee";

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

/**
 * The story in one screen: the short poem, then the three promises (real flowers, sweetness to taste, a light brew)
 * as small badges (their one line from md up), beside the 3D PP cup of grape tea with its lid lifted.
 */
export function Story() {
  return (
    <section id={sections.story} className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
      <SectionHeading tagline={story.tagline} title={story.title} />
      <div className="cup-grid lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-center lg:gap-12">
        <CupAnchor
          name="story"
          turn={0.9}
          tilt={0.5}
          lid={1}
          fill={0.72}
          className="mb-6 h-[36vh] max-h-[22rem] lg:mb-0 lg:h-[56vh] lg:max-h-[34rem]"
        />
        <div>
          <blockquote className="text-center text-2xl leading-relaxed md:text-3xl md:leading-relaxed lg:text-left">
            {story.poem.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </blockquote>
          <ul className="mt-8 grid grid-cols-3 gap-3 md:mt-10 md:gap-4">
            {promises.items.map((item) => {
              const Icon = ICONS[item.icon];
              return (
                <li
                  key={item.title}
                  className="card-sticker flex flex-col items-center gap-2 p-3 text-center md:items-start md:p-4 md:text-left"
                >
                  <span className={`badge-sticker size-11 shrink-0 ${TINTS[item.icon]}`}>
                    <Icon aria-hidden className="size-6" stroke={1.6} />
                  </span>
                  <div>
                    <h3 className="leading-tight md:text-lg">{item.title}</h3>
                    <p className="hidden text-brand-ink-muted md:block">{item.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
