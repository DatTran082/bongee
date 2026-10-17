import { IconClock, IconMapPin, IconPhone } from "@tabler/icons-react";
import { SectionHeading } from "@/components/section-heading";
import { SocialIcon } from "@/components/social-icon";
import { PENDING, sections, socials, visit } from "@/data/boongee";

/** Where and when to find Boongee. Unknown details read "Đang cập nhật"; unknown links are left out. */
export function Visit() {
  const rows = [
    { Icon: IconMapPin, label: "Địa chỉ", value: visit.address, href: visit.mapUrl },
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
      <div className="rounded-3xl bg-brand-pink-500 px-6 py-8 md:px-12 md:py-12">
        <dl className="grid gap-6 md:grid-cols-3">
          {rows.map(({ Icon, label, value, href }) => (
            <div key={label} className="text-center md:text-left">
              <dt className="flex items-center justify-center gap-2 text-sm tracking-[0.2em] uppercase md:justify-start">
                <Icon aria-hidden className="size-5" />
                {label}
              </dt>
              <dd className="mt-2 text-lg">
                {value && href ? (
                  <a
                    href={href}
                    className="underline underline-offset-4"
                    {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
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
