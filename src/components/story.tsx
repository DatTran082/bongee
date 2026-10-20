import { CupAnchor } from "@/components/cup-anchor";
import { SectionHeading } from "@/components/section-heading";
import { brand, sections, story } from "@/data/boongee";

/** The brand's visual narrative in three beats (origin, ritual, feeling), beside the cup with its lid lifted. */
export function Story() {
  return (
    <section id={sections.story} className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
      <SectionHeading tagline={story.tagline} title={story.title} />
      <div className="cup-grid lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start lg:gap-12">
        <CupAnchor
          name="story"
          turn={0.9}
          tilt={0.5}
          lid={1}
          fill={0.68}
          className="mb-8 h-[46vh] max-h-[26rem] lg:sticky lg:top-24 lg:mb-0 lg:h-[70vh] lg:max-h-[44rem]"
        />
        <div className="mx-auto max-w-3xl lg:mx-0 lg:py-6">
          <ol className="space-y-6">
            {story.beats.map((beat) => (
              <li key={beat.label} className="parallax-rise border-l-2 border-brand-pink-700 pl-5">
                <p className="text-sm tracking-[0.2em] text-brand-pink-800 uppercase">{beat.label}</p>
                <p className="mt-1 text-xl md:text-2xl">{beat.text}</p>
              </li>
            ))}
          </ol>
          <p className="parallax-rise mt-8 text-2xl tracking-[0.15em] uppercase md:text-3xl">
            <span className="sr-only">{brand.name}: </span>
            {story.closing}
          </p>
          <p className="parallax-rise mt-6 text-lg">{story.marks}</p>
        </div>
      </div>
    </section>
  );
}
