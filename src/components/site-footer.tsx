import Link from "next/link";
import { Logo } from "@/components/logo";
import { SocialIcon } from "@/components/social-icon";
import { brand, nav, socials } from "@/data/boongee";

/** Footer on pale silver: the logo and slogan, the section links, the social pages that are set. */
export function SiteFooter() {
  const links = socials.flatMap((s) => (s.href ? [{ ...s, href: s.href }] : []));

  return (
    <footer className="border-t border-silver-200 bg-silver-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[2fr_1fr_1fr] md:py-14">
        <div>
          <Link href="/" aria-label="Boongee — trang chủ" className="inline-block">
            <Logo className="h-8 w-auto" />
          </Link>
          <p className="mt-4 text-xs tracking-[0.32em] text-silver-700 uppercase">{brand.slogan}</p>
        </div>
        <nav aria-label="Liên kết cuối trang">
          <p className="mb-4 text-xs tracking-[0.24em] text-silver-700 uppercase">{brand.name}</p>
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
            <p className="mb-4 text-xs tracking-[0.24em] text-silver-700 uppercase">Theo dõi</p>
            <ul className="flex gap-3">
              {links.map((s) => (
                <li key={s.name}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${s.name} (mở tab mới)`}
                    data-variant="outline"
                    className="btn p-2"
                  >
                    <SocialIcon name={s.icon} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <p className="border-t border-silver-200 px-4 py-6 text-center text-xs tracking-[0.12em] text-silver-700">
        © {brand.name} · {brand.slogan}
      </p>
    </footer>
  );
}
