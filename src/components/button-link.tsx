import Link from "next/link";
import type { ReactNode } from "react";

const VARIANTS = {
  // white on ink is allowed by the brand rules; ink on the cream / white grounds everywhere else
  primary: "bg-brand-ink text-white border-brand-ink hover:bg-brand-pink-800 hover:border-brand-pink-800",
  outline: "border-brand-ink text-brand-ink hover:bg-brand-ink hover:text-white",
} as const;

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
      className={`inline-flex items-center justify-center rounded-full border px-6 py-3 text-base font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
