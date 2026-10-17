import type { Metadata } from "next";
import { brand, site } from "@/data/boongee";

/** Open Graph fields shared by every page. Metadata merges shallowly, so a page that sets openGraph spreads this. */
export const openGraphBase: NonNullable<Metadata["openGraph"]> = {
  type: "website",
  siteName: brand.name,
  locale: site.locale,
  title: site.title,
  description: site.description,
};
