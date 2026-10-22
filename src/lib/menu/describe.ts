// A dish's plain line under its name on the menu ("Trà sữa dành dành", "Trà trúc, nho tươi, tắc"), so a visitor knows
// what a poetic name like "Bạch Thiên Hương" is. Written from the dish's own recipe in the shop's Odoo, never by
// hand: the tea, then what makes the drink (fruit, cream, coffee, syrup flavour), leaving out what every drink has
// (sugar, ice, the milk itself, which turns "trà" into "trà sữa"). No recipe, no line. Used by scripts/sync-menu.mjs.

// (JavaScript's \b knows only ASCII letters: "đá" needs an explicit end, (\s|$).)
/** Components every drink has: they say nothing about this one. */
const COMMON = /^(đường|đá(\s|$)|nước( lọc| sôi| nóng)?$|rich(\s|$)|bột kem|sữa đặc)/i;
/** Milk: it is what makes "trà" "trà sữa" (or adds "sữa" after a coffee). */
const MILK = /^sữa(\s|$)/i;
/** Words that say how a part is made, not what it is: "mứt nho xanh" → "nho xanh". */
const FORM = /^(cốt|mứt|sốt|syrup|siro|puree|nước ép|tép)\s+/i;
/** Stock words after the name: how it is packed, or its maker ("tép bưởi lon", "bưởi Boduo"). */
const STOCK = /\s+(lon|hộp|chai|túi|gói|boduo)$/i;
/** At most this many parts in all. */
const MAX_PARTS = 4;

const lower = (text: string) => text.toLocaleLowerCase("vi");
const upper = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** The line for a dish from its recipe's component names (packaging left out), or null when they say nothing. */
export function describeDish(components: readonly string[]): string | null {
  const names = components.map((c) => c.trim()).filter(Boolean);
  const milk = names.some((n) => MILK.test(n));
  const parts: string[] = [];
  const add = (part: string) => {
    if (!parts.includes(part)) parts.push(part);
  };
  // the tea or the coffee first
  for (const name of names) {
    if (/^cốt trà\s+/i.test(name)) add(`trà${milk ? " sữa" : ""} ${lower(name.replace(/^cốt trà\s+/i, ""))}`);
  }
  for (const name of names) {
    if (/^cà phê/i.test(name)) add(lower(name));
  }
  const coffee = parts.some((p) => p.startsWith("cà phê"));
  if (coffee && milk) add("sữa");
  // then what makes this drink
  for (const name of names) {
    if (COMMON.test(name) || MILK.test(name) || /^cốt trà|^cà phê/i.test(name)) continue;
    add(lower(name.replace(FORM, "").replace(STOCK, "")));
  }
  // "bưởi" says less than "bưởi hồng", "hồng bì" less than "quất hồng bì": keep the fuller one
  const within = (part: string, other: string) => other.startsWith(`${part} `) || other.endsWith(` ${part}`);
  const kept = parts.filter((part, i) => !parts.some((other, j) => j !== i && within(part, other)));
  if (!kept.length) return null;
  return upper(kept.slice(0, MAX_PARTS).join(", "));
}
