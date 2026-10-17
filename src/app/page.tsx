import { CupViewers } from "@/components/cup-viewers";
import { Drinks } from "@/components/drinks";
import { Hero } from "@/components/hero";
import { Story } from "@/components/story";
import { Visit } from "@/components/visit";
import type { Metadata } from "next";
import { brand, socials } from "@/data/boongee";
import { openGraphBase } from "@/lib/metadata";
import { SITE_URL } from "@/lib/site-url";

// The home page is the canonical URL (set here, not in the layout, so other routes never inherit it).
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { ...openGraphBase, url: "/" },
};

// Structured data for the site and its publisher, built only from facts in src/data/boongee.ts (social pages only
// once they are set). Add a CafeOrCoffeeShop block once the address and hours are known.
const sameAs = socials.flatMap((s) => (s.href ? [s.href] : []));
const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: brand.name,
    url: SITE_URL,
    inLanguage: "vi",
    publisher: { "@id": `${SITE_URL}/#organization` },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: brand.name,
    slogan: brand.slogan,
    url: SITE_URL,
    logo: `${SITE_URL}/apple-icon.png`, // raster, as Google asks for logos
    ...(sameAs.length ? { sameAs } : {}),
  },
];

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        // static data only; "<" is escaped so the JSON can never close the script tag
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <Hero />
      <Story />
      <Drinks />
      <CupViewers />
      <Visit />
    </>
  );
}
