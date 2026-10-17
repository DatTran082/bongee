import Link from "next/link";
import { Logo } from "@/components/logo";
import { SocialIcon } from "@/components/social-icon";
import { brand, nav, socials } from "@/data/boongee";

/** Footer: logo and slogan, the section links, the social pages that are set. */
export function SiteFooter() {
  const links = socials.flatMap((s) => (s.href ? [{ ...s, href: s.href }] : []));

  return (
    <footer className="border-t border-brand-line">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[2fr_1fr_1fr] md:py-14">
        <div>
          <Link href="/" aria-label="Boongee — trang chủ" className="inline-block">
            <Logo className="h-10 w-auto" />
          </Link>
          <p className="mt-3 text-sm tracking-[0.2em] text-brand-ink-muted uppercase">{brand.slogan}</p>
        </div>
        <nav aria-label="Liên kết cuối trang">
          <p className="mb-3 text-sm font-semibold">{brand.name}</p>
          <ul className="space-y-2 text-sm text-brand-ink-muted">
            {nav.map((item) => (
              <li key={item.id}>
                <Link href={`/#${item.id}`} className="underline-offset-4 hover:text-brand-ink hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {links.length > 0 && (
          <div>
            <p className="mb-3 text-sm font-semibold">Theo dõi</p>
            <ul className="flex gap-3">
              {links.map((s) => (
                <li key={s.name}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${s.name} (mở tab mới)`}
                    className="inline-flex rounded-full border border-brand-ink p-2 hover:bg-brand-ink hover:text-white"
                  >
                    <SocialIcon name={s.icon} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <p className="border-t border-brand-line px-4 py-5 text-center text-xs text-brand-ink-muted">
        © {brand.name} · {brand.slogan}
      </p>
    </footer>
  );
}
