import Link from "next/link";
import { TeaHills } from "@/components/lang-may/tea-hills";
import { Logo } from "@/components/logo";
import { SocialIcon } from "@/components/social-icon";
import { brand, nav, socials } from "@/data/boongee";

/** Footer: tea hills across its top (Làng Mây), then the logo and slogan, the section links, the social pages that are set. */
export function SiteFooter() {
  const links = socials.flatMap((s) => (s.href ? [{ ...s, href: s.href }] : []));

  return (
    <footer>
      <TeaHills className="-mb-px" />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[2fr_1fr_1fr] md:py-14">
        <div>
          <Link href="/" aria-label="Boongee — trang chủ" className="inline-block">
            <Logo className="h-10 w-auto" />
          </Link>
          <p className="mt-3 text-sm tracking-[0.2em] uppercase">{brand.slogan}</p>
        </div>
        <nav aria-label="Liên kết cuối trang">
          <p className="mb-3 text-sm font-semibold">{brand.name}</p>
          <ul className="space-y-2 text-sm">
            {nav.map((item) => (
              <li key={item.id}>
                <Link href={`/#${item.id}`} className="underline-offset-4 hover:underline">
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
                    data-variant="outline"
                    className="button-game inline-flex rounded-full p-2"
                  >
                    <SocialIcon name={s.icon} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <p className="border-t border-brand-ink/15 px-4 py-5 text-center text-xs">
        © {brand.name} · {brand.slogan}
      </p>
    </footer>
  );
}
