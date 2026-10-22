import Link from "next/link";
import type { ReactNode } from "react";

// game-UI pills (lang-may.css, .button-game): white on ink is allowed by the brand rules; ink on cloud white else
const VARIANTS = { primary: "primary", outline: "outline" } as const;

export function ButtonLink({
  href,
  children,
  variant = "outline",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: keyof typeof VARIANTS;
  className?: string;
}) {
  return (
    <Link
      href={href}
      data-variant={VARIANTS[variant]}
      className={`button-game inline-flex items-center justify-center rounded-full px-6 py-3 text-base font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-ink ${className}`}
    >
      {children}
    </Link>
  );
}
