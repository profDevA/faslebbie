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
  // Keep `public/` out of the serverless function bundles. `getAboutLogoSvgs()`
  // reads logo SVGs via `readFileSync(process.cwd()/public/<dynamic>)`, which the
  // file tracer can't resolve statically — so it copies ALL of `public/` (the
  // ~350MB of case-study videos/images) into the function and blows past
  // Vercel's 250MB limit. Public assets are CDN-served and never needed inside a
  // function; the SVG reads run at build time during static prerender.
  outputFileTracingExcludes: {
    "/**": ["./public/**/*"],
  },
};

export default nextConfig;
