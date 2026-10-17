// The site's public origin, for metadataBase, the canonical URL, Open Graph, JSON-LD, sitemap.xml and robots.txt.
// Server-side only (layout, page, sitemap, robots): it may throw, so client components must not import it.
//
//   1. NEXT_PUBLIC_SITE_URL, e.g. https://boongee.vn: set it on the host once the domain exists (see .env.example);
//   2. on Vercel without it, the project's production domain (a Vercel system variable);
//   3. in development, http://localhost:3000.
// A production build with none of these fails, rather than telling search engines the site lives somewhere else.

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const url = explicit || (vercel ? `https://${vercel}` : undefined);
  if (url) return new URL(url).origin; // validates, and drops any trailing slash or path
  if (process.env.NODE_ENV !== "production") return "http://localhost:3000";
  throw new Error(
    "Thiếu NEXT_PUBLIC_SITE_URL: đặt tên miền của trang (ví dụ https://boongee.vn) trong .env.local hoặc trên host trước khi build.",
  );
}

export const SITE_URL = resolveSiteUrl();
