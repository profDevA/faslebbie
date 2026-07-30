import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the Turbopack workspace root to this app. The repo has a second
  // lockfile at the monorepo root (for the /scripts extractor tooling), which
  // otherwise makes Next infer the wrong root and mis-resolve modules.
  turbopack: {
    root: __dirname,
  },
  // Sanity-hosted assets (covers, in-article diagrams, thumbnails) are served
  // from the CDN and rendered through next/image.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },
  // Keep the huge case-study media out of serverless bundles (Vercel 250MB
  // limit). Do NOT exclude all of `public/` — About logo SVGs are read via
  // `getAboutLogoSvgs()` → `readFileSync(public/about-logos/…)`, and excluding
  // them made the chips blank on Vercel while still working locally (Fas 07/30).
  outputFileTracingExcludes: {
    "/**": ["./public/work/**/*"],
  },
  // Explicit include so the tracer always packs the About brand chips even if
  // the dynamic `readFileSync(join(…, src))` path isn't statically visible.
  outputFileTracingIncludes: {
    "/**": ["./public/about-logos/**/*"],
  },
};

export default nextConfig;
