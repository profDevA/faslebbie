import type { Metadata } from "next";
import { Suspense } from "react";
import Nav from "@/components/Nav";
import LeadershipBody from "@/components/LeadershipBody";
import { leadershipFromSanity } from "@/lib/leadershipFromSanity";
import { pageMetadataFromSanity } from "@/lib/pageMetadata";
import { getLeadershipPage, getSiteSettings } from "@/sanity/fetch";
import { loadTestimonials } from "@/lib/testimonials";

// Leadership page (Figma 1-44995 / 1-45057 / 1-45118) — holistic ".txt" / ".img"
// design mirroring Work: a pinned "Leadership" watermark reveal over the prose
// (".txt"), and a masonry of moment cards (".img") that open the unified
// image / name / role / testimonial popup. The watermark is rendered inside
// LeadershipBody so it can force its receded state in the ".img" view.

export async function generateMetadata(): Promise<Metadata> {
  const [page, site] = await Promise.all([
    getLeadershipPage(),
    getSiteSettings(),
  ]);
  return pageMetadataFromSanity(page?.seo, {
    title: "Approach — Fas Lebbie, Ph.D.",
    description: site?.siteDescription?.trim(),
    ogImage: site?.ogImage,
    ogImageAlt: site?.ogImageAlt,
  });
}

export default async function LeadershipPage() {
  const [raw, testimonials] = await Promise.all([
    getLeadershipPage(),
    loadTestimonials(),
  ]);
  const content = leadershipFromSanity(raw);
  return (
    <>
      <Nav dark />
      <Suspense fallback={null}>
        <LeadershipBody content={content} testimonials={testimonials} />
      </Suspense>
    </>
  );
}
