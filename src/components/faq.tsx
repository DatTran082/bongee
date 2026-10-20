import { IconChevronDown } from "@tabler/icons-react";
import { SectionHeading } from "@/components/section-heading";
import { faqIntro, sections } from "@/data/boongee";
import { faq } from "@/data/faq";

/** Questions before a visit, as native <details> (keyboard and screen-reader friendly, no script). */
export function Faq() {
  return (
    <section id={sections.faq} className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-24">
      <SectionHeading tagline={faqIntro.tagline} title={faqIntro.title} />
      <div className="parallax-rise divide-y divide-brand-ink/15 border-y border-brand-ink/15">
        {faq.map((item, i) => (
          <details key={item.question} className="group py-4" open={i === 0}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg text-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-ink md:text-xl [&::-webkit-details-marker]:hidden">
              <h3>{item.question}</h3>
              <IconChevronDown aria-hidden className="size-5 shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-lg">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
