import type { Metadata, Viewport } from "next";
import { Fraunces } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { brand, site } from "@/data/boongee";
import { openGraphBase } from "@/lib/metadata";
import { SITE_URL } from "@/lib/site-url";
import tokens from "@/data/brand-tokens.json";
import "./globals.css";

// The brand's only typeface (SIL OFL), self-hosted by next/font. The Vietnamese subset carries the diacritics; the
// SOFT / WONK / opsz axes are the ones the wordmark is drawn with.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext", "vietnamese"],
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

// Icons (icon.svg, favicon.ico, apple-icon.png) and share images (opengraph-image.jpg, twitter-image.jpg) are file
// conventions in this folder, written by `npm run sync-brand`.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: site.title, template: `%s — ${brand.name}` },
  description: site.description,
  applicationName: brand.name,
  openGraph: openGraphBase,
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
};

export const viewport: Viewport = {
  themeColor: tokens["bg"], // the page's cream ground
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${fraunces.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#noi-dung"
          className="sr-only rounded-full bg-brand-ink px-5 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60]"
        >
          Bỏ qua điều hướng
        </a>
        <SiteHeader />
        <main id="noi-dung" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
