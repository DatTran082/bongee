import { contrast } from "@/lib/design/contrast";

export interface Swatch {
  name: string;
  hex: string;
  role?: string | null;
  pantone?: string | null;
}

/** A grid of colour chips: the colour, its token, hex, and what it is for. */
export function Swatches({ items }: { items: readonly Swatch[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {items.map((s) => (
        <li key={s.name}>
          <div className="aspect-[16/10] rounded-xl border border-silver-200" style={{ background: s.hex }} />
          <p className="mt-3 text-sm">{s.name}</p>
          <p className="text-xs tracking-[0.08em] text-silver-700 uppercase tabular-nums">{s.hex}</p>
          {s.pantone && <p className="text-xs text-silver-700">{s.pantone}</p>}
          {s.role && <p className="mt-1 text-xs leading-relaxed text-silver-700">{s.role}</p>}
        </li>
      ))}
    </ul>
  );
}

/** A mark colour on a ground, with its measured contrast. */
export function Pair({
  mark,
  ground,
  label,
  allowed,
}: {
  mark: Swatch;
  ground: Swatch;
  label: string;
  allowed: boolean;
}) {
  const ratio = contrast(mark.hex, ground.hex);
  return (
    <li className="overflow-hidden rounded-2xl border border-silver-200">
      <div
        className="flex aspect-[3/2] items-center justify-center text-3xl"
        style={{ background: ground.hex, color: mark.hex }}
      >
        Boongee
      </div>
      <div className="flex items-baseline justify-between gap-2 px-4 py-3 text-sm">
        <span>{label}</span>
        <span className={allowed ? "tabular-nums" : "text-silver-700 tabular-nums line-through"}>
          {ratio.toLocaleString("vi-VN")} : 1
        </span>
      </div>
    </li>
  );
}
