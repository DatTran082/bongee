import { IconChevronDown } from "@tabler/icons-react";
import { CupAnchor } from "@/components/cup-anchor";
import { SectionHeading } from "@/components/section-heading";
import { faqIntro, sections } from "@/data/boongee";
import { faq } from "@/data/faq";

/**
 * Questions before a visit, as native <details> (keyboard and screen-reader friendly, no script), all closed; from
 * `lg` the 3D PP cup of grape tea (lid lifted) stands beside them. Phones have no slot for it (lighter).
 */
export function Faq() {
  return (
    <section id={sections.faq} className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
      <SectionHeading tagline={faqIntro.tagline} title={faqIntro.title} />
      <div className="cup-grid lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-center lg:gap-12">
        <div className="mx-auto max-w-3xl divide-y divide-brand-ink/15 border-y border-brand-ink/15 lg:mx-0">
          {faq.map((item) => (
            <details key={item.question} className="group py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg text-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-ink md:text-xl [&::-webkit-details-marker]:hidden">
                <h3>{item.question}</h3>
                <IconChevronDown aria-hidden className="size-5 shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-lg">{item.answer}</p>
            </details>
          ))}
        </div>
        <CupAnchor
          name="faq"
          turn={0.9}
          tilt={0.5}
          lid={1}
          fill={0.72}
          className="hidden lg:block lg:h-[52vh] lg:max-h-[30rem]"
        />
      </div>
    </section>
  );
}
