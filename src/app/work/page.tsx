import type { Metadata } from "next";
import { Suspense } from "react";
import Nav from "@/components/Nav";
import WorkBody from "@/components/WorkBody";
import { pageMetadataFromSanity } from "@/lib/pageMetadata";
import { loadTestimonials } from "@/lib/testimonials";
import {
  getAllStudies,
  getCategories,
  getSiteSettings,
  getWorkPage,
} from "@/sanity/fetch";

// Work / "Design Work" page (Figma 807:2954 / 823:65046 / 840:74764). Mirrors
// the About architecture: a big "Design Work" watermark recedes as the dimmed
// content brightens forward, with two toggled views (".txt" narrative + ".img"
// masonry grid) and a project lightbox. Content is served from Sanity.
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const [work, site] = await Promise.all([getWorkPage(), getSiteSettings()]);
  return pageMetadataFromSanity(work?.seo, {
    title: "Case Studies — Fas Lebbie, Ph.D.",
    description: site?.siteDescription?.trim(),
    ogImage: site?.ogImage,
    ogImageAlt: site?.ogImageAlt,
  });
}

export default async function WorkPage() {
  const [projects, categories, config, testimonials] = await Promise.all([
    getAllStudies(),
    getCategories(),
    getWorkPage(),
    loadTestimonials(),
  ]);
  return (
    <>
      <Nav dark />
      {/* Suspense: WorkBody reads ?view= via useSearchParams (Fas 08/06). */}
      <Suspense fallback={null}>
        <WorkBody
          projects={projects}
          categories={categories}
          config={config}
          testimonials={testimonials}
        />
      </Suspense>
    </>
  );
}
