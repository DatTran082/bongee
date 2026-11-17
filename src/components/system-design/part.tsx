import type { ReactNode } from "react";

/** One numbered part of the /system-design page: an anchor, an eyebrow with its number, a light heading. */
export function Part({
  id,
  index,
  title,
  lead,
  children,
}: {
  id: string;
  index: number;
  title: string;
  lead?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="border-t border-silver-200 py-16 md:py-24">
      <p className="eyebrow">{String(index).padStart(2, "0")}</p>
      <h2 id={`${id}-title`} className="mt-4 text-3xl font-light tracking-tight md:text-4xl">
        {title}
      </h2>
      {lead && <p className="mt-4 max-w-2xl text-silver-700">{lead}</p>}
      <div className="mt-10">{children}</div>
    </section>
  );
}

/** A plain list with hairline rows. */
export function Rows({ items }: { items: readonly string[] }) {
  return (
    <ul className="divide-y divide-silver-200 border-y border-silver-200">
      {items.map((item) => (
        <li key={item} className="py-3">
          {item}
        </li>
      ))}
    </ul>
  );
}
