import { IconClock, IconExternalLink, IconMapPin, IconPhone } from "@tabler/icons-react";
import { SectionHeading } from "@/components/section-heading";
import { SocialIcon } from "@/components/social-icon";
import { PENDING, sections, socials, visit } from "@/data/boongee";

/** Where and when to find Boongee. Unknown details read "Đang cập nhật"; unknown links are left out. */
export function Visit() {
  const rows = [
    { Icon: IconClock, label: "Giờ mở cửa", value: visit.hours, href: null },
    {
      Icon: IconPhone,
      label: "Điện thoại",
      value: visit.phone,
      href: visit.phone ? `tel:${visit.phone.replace(/\s+/g, "")}` : null,
    },
  ];
  const links = socials.flatMap((s) => (s.href ? [{ ...s, href: s.href }] : []));

  return (
    <section id={sections.visit} className="mx-auto max-w-4xl px-4 py-16 sm:px-6 md:py-24">
      <SectionHeading tagline={visit.tagline} title={visit.title} />
      <div className="rounded-3xl bg-brand-bg-alt px-6 py-8 md:px-12 md:py-12">
        <address className="text-center not-italic">
          <p className="flex items-center justify-center gap-2 text-sm tracking-[0.2em] uppercase">
            <IconMapPin aria-hidden className="size-5" />
            Địa chỉ
          </p>
          <p className="mt-2 text-2xl md:text-3xl">{visit.address.street}</p>
          <p className="mt-1 text-lg">
            {visit.address.district}, {visit.address.city}
          </p>
          <p className="mt-2 text-lg">{visit.services}</p>
          <a
            href={visit.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-ink px-5 py-2.5 text-white transition-colors hover:bg-brand-pink-800"
          >
            Xem bản đồ
            <IconExternalLink aria-hidden className="size-4" />
            <span className="sr-only"> (Google Maps, mở tab mới)</span>
          </a>
        </address>
        <dl className="mt-8 grid gap-6 border-t border-brand-ink/15 pt-8 sm:grid-cols-2">
          {rows.map(({ Icon, label, value, href }) => (
            <div key={label} className="text-center">
              <dt className="flex items-center justify-center gap-2 text-sm tracking-[0.2em] uppercase">
                <Icon aria-hidden className="size-5" />
                {label}
              </dt>
              <dd className="mt-2 text-lg">
                {value && href ? (
                  <a href={href} className="underline underline-offset-4">
                    {value}
                  </a>
                ) : (
                  (value ?? PENDING)
                )}
              </dd>
            </div>
          ))}
        </dl>
        {links.length > 0 && (
          <ul className="mt-10 flex flex-wrap justify-center gap-3">
            {links.map((s) => (
              <li key={s.name}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-ink px-5 py-2.5 text-white hover:bg-brand-pink-800"
                >
                  <SocialIcon name={s.icon} />
                  {s.name}
                  <span className="sr-only"> (mở tab mới)</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
