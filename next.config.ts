import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // the 3D cups' GLBs are named after their content by sync-brand, so they can be cached for good
  async headers() {
    return [
      {
        source: "/models/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      // the menu's and the offers' pictures too (sync-brand names them after their content)
      ...["/menu/:path*", "/uu-dai/:path*"].map((source) => ({
        source,
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      })),
    ];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
