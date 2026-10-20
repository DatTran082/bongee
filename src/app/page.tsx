import type { Metadata } from "next";
import { CupStage } from "@/components/cup-stage";
import { Faq } from "@/components/faq";
import { Hero } from "@/components/hero";
import { Menu } from "@/components/menu";
import { Offers } from "@/components/offers";
import { Promises } from "@/components/promises";
import { Story } from "@/components/story";
import { Visit } from "@/components/visit";
import { brand, sections, socials, visit } from "@/data/boongee";
import { faq } from "@/data/faq";
import { priceRange, pricesAreIllustrative } from "@/data/menu";
import { openGraphBase } from "@/lib/metadata";
import { SITE_URL } from "@/lib/site-url";

// The home page is the canonical URL (set here, not in the layout, so other routes never inherit it).
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { ...openGraphBase, url: "/" },
};

// Structured data, built only from the facts the page shows (src/data/). Unconfirmed facts stay out of it, so
// search engines never index them: the address until visit.address.confirmed, the prices while menu-data.json marks
// them illustrative. Social pages appear once they are set; add openingHours / telephone once they are known.
const sameAs = socials.flatMap((s) => (s.href ? [s.href] : []));
const vnd = (thousands: number) => `${(thousands * 1000).toLocaleString("vi-VN")} ₫`;
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
    "@type": "CafeOrCoffeeShop",
    "@id": `${SITE_URL}/#organization`,
    name: brand.name,
    slogan: brand.slogan,
    url: SITE_URL,
    logo: `${SITE_URL}/apple-icon.png`, // raster, as Google asks for logos
    image: `${SITE_URL}/opengraph-image.jpg`,
    ...(visit.address.confirmed
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: visit.address.street,
            addressLocality: visit.address.district,
            addressRegion: visit.address.city,
            addressCountry: "VN",
          },
          hasMap: visit.mapUrl,
        }
      : {}),
    servesCuisine: ["Trà sữa", "Trà trái cây", "Cà phê"],
    ...(pricesAreIllustrative ? {} : { priceRange: `${vnd(priceRange.min)} – ${vnd(priceRange.max)}` }),
    hasMenu: `${SITE_URL}/#${sections.menu}`,
    ...(sameAs.length ? { sameAs } : {}),
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq
      .filter((item) => !(item.topic === "address" && !visit.address.confirmed))
      .filter((item) => !(item.topic === "price" && pricesAreIllustrative))
      .map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
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
      {/* the 3D cup: a fixed canvas behind the page (globals.css); after the hero, so its control follows the hero's buttons */}
      <CupStage />
      <Story />
      <Promises />
      <Menu />
      <Offers />
      <Faq />
      <Visit />
    </>
  );
}
