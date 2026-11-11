import type { NextConfig } from "next";

/**
 * The site is exported as static HTML so it can be hosted on GitHub Pages.
 * On a project page the app lives under `/<repo-name>`, so the deploy workflow
 * passes that prefix in through NEXT_PUBLIC_BASE_PATH. Locally it stays empty.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: basePath || undefined,
  images: {
    // No image optimisation server on a static host. Photos are pre-sized.
    unoptimized: true,
  },
  experimental: {
    // Each language has its own root layout, so the 404 page is a standalone
    // document (`app/global-not-found.tsx`).
    globalNotFound: true,
  },
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
