import { IconExternalLink, IconMotorbike } from "@tabler/icons-react";
import Image from "next/image";
import grabfood from "@/assets/lang-may/grabfood.svg";
import shopeefood from "@/assets/lang-may/shopeefood.svg";
import { delivery } from "@/data/boongee";

const BADGES = { grabfood, shopeefood } as const;

/**
 * The delivery apps (src/data/boongee.ts → delivery), each with its painted badge (the Làng Mây edition's
 * giao_hang.py): a link to the shop's page in the app when it is set, otherwise the app's name and a word to search
 * for the shop there.
 */
export function DeliveryApps() {
  return (
    <div className="mt-8 border-t border-brand-ink/15 pt-8 text-center">
      <p className="flex items-center justify-center gap-2 text-sm tracking-[0.2em] uppercase">
        <IconMotorbike aria-hidden className="size-5" />
        {delivery.title}
      </p>
      <p className="mt-2 text-lg">{delivery.line}</p>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {delivery.apps.map((app) => {
          const inner = (
            <>
              <Image src={BADGES[app.badge]} alt="" aria-hidden className="size-12 shrink-0 sm:size-14" />
              <span className="min-w-0 text-left">
                <span className="block text-lg leading-tight font-semibold">{app.name}</span>
                <span className="block text-sm whitespace-nowrap text-brand-ink-muted">
                  {app.href ? "Đặt món" : delivery.search}
                </span>
              </span>
            </>
          );
          return (
            <li key={app.name}>
              {app.href ? (
                <a
                  href={app.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-variant="outline"
                  className="button-game flex items-center gap-3 rounded-3xl px-4 py-3"
                >
                  {inner}
                  <IconExternalLink aria-hidden className="ml-auto size-4 shrink-0" />
                  <span className="sr-only"> (mở tab mới)</span>
                </a>
              ) : (
                <div className="flex items-center gap-3 rounded-3xl border border-brand-line bg-brand-bg-alt px-4 py-3">
                  {inner}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
