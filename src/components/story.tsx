import { SectionHeading } from "@/components/section-heading";
import { brand, sections, story } from "@/data/boongee";

/** The brand's visual narrative in three beats (origin, ritual, feeling). */
export function Story() {
  return (
    <section id={sections.story} className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
      <SectionHeading tagline={story.tagline} title={story.title} />
      <div className="mx-auto max-w-3xl">
        <ol className="space-y-6">
          {story.beats.map((beat) => (
            <li key={beat.label} className="border-l-2 border-brand-pink-700 pl-5">
              <p className="text-sm tracking-[0.2em] text-brand-pink-800 uppercase">{beat.label}</p>
              <p className="mt-1 text-xl md:text-2xl">{beat.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-2xl tracking-[0.15em] uppercase md:text-3xl">
          <span className="sr-only">{brand.name}: </span>
          {story.closing}
        </p>
        <p className="mt-6 text-lg">{story.marks}</p>
      </div>
    </section>
  );
}
