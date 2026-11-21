import { GroupMark } from "@/components/group-mark";
import { categories } from "@/data/menu";

const groups = categories.filter((c) => c.id !== "topping");

/** One run of the drink groups' names, each after its mark; every other name drawn as a silver outline. */
function Run() {
  return (
    <ul className="flex shrink-0 items-center">
      {groups.map((group, i) => (
        <li key={group.id} className="flex items-center gap-[4vw] pr-[4vw] whitespace-nowrap">
          <GroupMark title={group.title} className="size-[clamp(1.75rem,4vw,3.5rem)] bg-silver-500" />
          <span className={i % 2 ? "text-outline" : undefined}>{group.title}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * A band of the drink groups' names (the till's, Odoo) set very large and running sideways without end: the page's
 * breath between the hero and the lookbook. A CSS animation of one transform (two runs side by side, moved by half),
 * so it costs the main thread nothing; still with reduced motion. Decorative: the menu below names the groups.
 */
export function Marquee() {
  return (
    <div aria-hidden className="overflow-hidden border-y border-silver-200 bg-white py-8 md:py-12">
      <div className="marquee flex w-max text-[clamp(2.75rem,8.5vw,8.5rem)] leading-none font-light tracking-[-0.02em]">
        <Run />
        <Run />
      </div>
    </div>
  );
}
