import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/siteUrl";

// /robots.txt — crawl everything except the Studio and API routes, and point
// crawlers at the sitemap (Nov 18).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/studio", "/api/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
