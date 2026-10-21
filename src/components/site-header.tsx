"use client";

import { IconMenu2, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/logo";
import { nav, sections } from "@/data/boongee";

const DESKTOP = "(min-width: 768px)"; // Tailwind md: the inline links replace the phone menu

/**
 * Sticky header: logo, the section links, "Ghé quán" as the button; a toggled menu on phones. Escape closes the menu
 * and returns focus to its button; the menu also closes when the window widens to the desktop layout, so it never
 * stays "open" while hidden.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const close = () => setOpen(false);
  const links = nav.filter((item) => item.id !== sections.visit); // "Ghé quán" is the button

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const desktop = window.matchMedia(DESKTOP);
    const onWiden = (event: MediaQueryListEvent) => event.matches && setOpen(false);
    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onWiden);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onWiden);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-ink/15 bg-brand-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" onClick={close} aria-label="Boongee — trang chủ">
          <Logo />
        </Link>
        <nav aria-label="Điều hướng chính" className="hidden items-center gap-8 md:flex">
          {links.map((item) => (
            <Link key={item.id} href={`/#${item.id}`} className="text-sm underline-offset-4 hover:underline">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href={`/#${sections.visit}`}
            className="hidden rounded-full border border-brand-ink px-5 py-2 text-sm transition-colors hover:bg-brand-ink hover:text-white md:inline-block"
          >
            Ghé quán
          </Link>
          <button
            ref={buttonRef}
            type="button"
            className="rounded-full p-2 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label="Menu"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <IconX aria-hidden /> : <IconMenu2 aria-hidden />}
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="mobile-nav"
          aria-label="Điều hướng"
          className="border-t border-brand-ink/15 bg-brand-bg px-4 pb-4 md:hidden"
        >
          <ul>
            {nav.map((item) => (
              <li key={item.id}>
                {/* Following an anchor moves the browser's focus start point to the section, so closing is enough. */}
                <Link href={`/#${item.id}`} onClick={close} className="block py-3 text-lg">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
