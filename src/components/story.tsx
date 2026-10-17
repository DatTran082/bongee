import Image from "next/image";
import monogram from "@/assets/images/monogram-hong.png";
import { SectionHeading } from "@/components/section-heading";
import { sections, story } from "@/data/boongee";

/** The brand story beside the monogram pattern (ink marks on the brand pink). */
export function Story() {
  return (
    <section id={sections.story} className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
      <SectionHeading tagline={story.tagline} title={story.title} />
      <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
        <div className="space-y-4 text-lg">
          {story.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <Image
          src={monogram}
          alt={story.imageAlt}
          placeholder="blur"
          sizes="(min-width: 768px) 50vw, 100vw"
          className="aspect-square h-auto w-full rounded-3xl object-cover shadow-lg"
        />
      </div>
    </section>
  );
}
