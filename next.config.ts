import type { NextConfig } from "next";

// Page HTML (and its ?_rsc= requests): a repeat visit within 1 minute shows the
// browser's saved copy instantly; after that the browser checks with the server
// first (ETag → usually a 304), so a page is never more than a minute old.
// (Plain `no-cache` added a server round trip, ~0.3–0.6 s, to every repeat visit.)
// Next's own ISR header (`s-maxage=60, stale-while-revalidate=…`, no max-age) let
// Safari show its copy from any earlier visit while revalidating in the background
// — after a deploy that copy linked deleted CSS / JS and Home rendered unstyled
// (Fas's iPhone, Nov 24; docs/meetings/2026-11-23-actions.md item 1). Next only
// sets its header when none is set yet (send-payload.js), so these values win.
// Server-side ISR (Next's cache, revalidate = 60) is unchanged.
//
// Not matched: /_next/* (static stays `immutable`), /api/*, and any path with a
// dot (public/ files, robots.txt, sitemap.xml) — they keep Next's headers.
const PAGE_CACHE_CONTROL = "max-age=0, stale-while-revalidate=60";
// Dynamically rendered pages (they read ?view= / ?project=, or are [slug]
// routes without generateStaticParams) keep the header Next sends them, so the
// rule above doesn't weaken `no-store`. Later rules override earlier ones.
const DYNAMIC_PAGE_CACHE_CONTROL =
  "private, no-cache, no-store, max-age=0, must-revalidate";
const DYNAMIC_PAGES = [
  "/:page(work|build|teaching|blogs)",
  "/:page(work|build)/:slug([^/.]+)",
  "/blogs/media/:talk([^/.]+)",
  "/teaching/students/:slug([^/.]+)",
];

/** Old WordPress paths → new pages, [source, destination]. Order matters: a
 *  specific rule must come before a general one that also matches it. */
const LEGACY_WP_REDIRECTS: [string, string][] = [
  ["/case-studies/remote-assistant-object-detection", "/work/the-ar-handbook"],
  ["/case-studies/:slug", "/work/:slug"],
  ["/works", "/work"],
  ["/podcast", "/blogs/media/design-again-podcast"],
  ["/leadership", "/approach"],
  // Fas may point this at /research later.
  ["/academic", "/teaching"],
  ["/testimonials", "/about/testimonials"],
  ["/students-work", "/teaching/student-projects"],
  ["/sfk-beijeing-exhibition", "/teaching/exhibition"],
  // Leftover "My Story… coming soon" placeholder (src/app/[section]); the
  // story is on About. Only `story` was in that page's list.
  ["/story", "/about"],
  // Blog posts (WordPress served them at the site root).
  [
    "/design-pulse-a-framework-for-reading-organizational-design-health-in-real-time",
    "/blogs/design-pulse-org-design-health-monitor",
  ],
  ["/the-tetrahedral-product-organization", "/blogs/tetrahedral-model"],
  ["/building-a-design-handbook-that-works", "/blogs/design-handbook-that-works"],
  [
    "/setting-clear-expectations-a-design-leaders-framework",
    "/blogs/trust-through-five-expectations",
  ],
  ["/my-five-commitments-to-a-team-2", "/blogs/commitments-to-a-design-team"],
  // "Won’t" with a curly apostrophe (as linked), its URL-encoded form, a
  // plain apostrophe, or none. Matching is case-insensitive.
  ...[
    "/design-big-design-why-the-super-IC-Won’t-Save-Us",
    "/design-big-design-why-the-super-IC-Won%E2%80%99t-Save-Us",
    "/design-big-design-why-the-super-IC-Won't-Save-Us",
    "/design-big-design-why-the-super-IC-Won%27t-Save-Us",
    "/design-big-design-why-the-super-IC-Wont-Save-Us",
  ].map((source): [string, string] => [
    source,
    "/blogs/big-design-why-the-super-ic-wont-save-us",
  ]),
  ...[
    "six-roles-that-drive-your-design-process-and-practice",
    "scalar-approach-to-design-leadership",
    "extractive-2-0-the-enduring-logic-of-the-extractive-empire",
    "ai-design-led-research-reclaiming-agency-in-the-age-of-llms",
    "the-great-value-inversion-earth-over-algorithms",
  ].map((slug): [string, string] => [`/${slug}`, `/blogs/${slug}`]),
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/((?!_next/|api/)(?!.*\\.).*)",
        headers: [{ key: "Cache-Control", value: PAGE_CACHE_CONTROL }],
      },
      ...DYNAMIC_PAGES.map((source) => ({
        source,
        headers: [{ key: "Cache-Control", value: DYNAMIC_PAGE_CACHE_CONTROL }],
      })),
    ];
  },
  async redirects() {
    return [
      {
        source: "/casestudies/remote-assistant-object-detection",
        destination: "/work/the-ar-handbook",
        permanent: true,
      },
      {
        source: "/work/remote-assistant-object-detection",
        destination: "/work/the-ar-handbook",
        permanent: true,
      },
      // Work lives at /work since Nov 17 (Xian: "for work menu, slug should be
      // also work"). Old /casestudies links keep working (query kept).
      { source: "/casestudies", destination: "/work", permanent: true },
      { source: "/casestudies/:slug*", destination: "/work/:slug*", permanent: true },
      // Old WordPress addresses (faslebbie.com before the rebuild), Nov 27.
      // None of these paths is a page here (checked against src/app), so no
      // live route changes. Trailing-slash forms work too: Next first drops
      // the slash (308), then the rule below applies (308).
      ...LEGACY_WP_REDIRECTS.map(([source, destination]) => ({
        source,
        destination,
        permanent: true,
      })),
    ];
  },
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
    // Sanity URLs request q=90; next/image maps that to quality 92.
    // Next 16 only allows 75 unless listed here, and unlisted values warn
    // (and can fail to optimize) on every page that uses those assets.
    qualities: [75, 92],
    // Local dev: the optimizer pulls remotes from Node. Slow VPN / Sanity CDN
    // hits "upstream image response timed out" and every portrait/cover breaks.
    // Production keeps the default optimizer path.
    unoptimized: process.env.NODE_ENV === "development",
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
