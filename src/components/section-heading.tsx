/** Centred section heading: small tracked tagline, the section's <h2>, optional subtitle. */
export function SectionHeading({ tagline, title, subtitle }: { tagline: string; title: string; subtitle?: string }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
      <p className="text-sm font-semibold tracking-[0.2em] text-brand-pink-800 uppercase">{tagline}</p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-balance text-brand-ink md:text-5xl">{title}</h2>
      {subtitle && <p className="mt-4 text-lg text-brand-ink-muted md:text-xl">{subtitle}</p>}
    </div>
  );
}
