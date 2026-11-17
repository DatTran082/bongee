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
    <div className="mt-8 border-t border-silver-200 pt-8">
      <p className="flex items-center gap-2 text-xs tracking-[0.28em] text-silver-700 uppercase">
        <IconMotorbike aria-hidden className="size-4" />
        {delivery.title}
      </p>
      <p className="mt-3">{delivery.line}</p>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {delivery.apps.map((app) => {
          const inner = (
            <>
              <Image src={BADGES[app.badge]} alt="" aria-hidden className="size-11 shrink-0" />
              <span className="min-w-0 text-left">
                <span className="block leading-tight">{app.name}</span>
                <span className="block text-sm whitespace-nowrap text-silver-700">
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
                  className="btn flex rounded-2xl px-4 py-3"
                >
                  {inner}
                  <IconExternalLink aria-hidden className="ml-auto size-4 shrink-0" />
                  <span className="sr-only"> (mở tab mới)</span>
                </a>
              ) : (
                <div className="flex items-center gap-3 rounded-2xl border border-silver-200 bg-white px-4 py-3">
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
