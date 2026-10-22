import { CupAnchor } from "@/components/cup-anchor";
import { FlowerMark } from "@/components/lang-may/flower-mark";
import { SectionHeading } from "@/components/section-heading";
import { brand, sections, story } from "@/data/boongee";

/** The story: a short poem, then three plain lines (flowers, brewing, the cup), each on a low-poly flower, beside the cup with its lid lifted. */
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
          <blockquote className="parallax-rise mb-10 text-2xl leading-relaxed md:text-3xl md:leading-relaxed">
            {story.poem.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </blockquote>
          <ol className="space-y-5">
            {story.beats.map((beat) => (
              <li key={beat.label} className="parallax-rise flex gap-4">
                <FlowerMark className="mt-0.5 size-7" />
                <div>
                  <p className="text-sm tracking-[0.2em] text-brand-pink-800 uppercase">{beat.label}</p>
                  <p className="mt-1 text-lg md:text-xl">{beat.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="parallax-rise mt-8 text-2xl tracking-[0.15em] uppercase md:text-3xl">
            <span className="sr-only">{brand.name}: </span>
            {story.closing}
          </p>
        </div>
      </div>
    </section>
  );
}
