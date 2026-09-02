import type { Metadata } from "next";
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

export default async function CaseStudiesPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view: viewFromUrl } = await searchParams;
  const [projects, categories, config, testimonials] = await Promise.all([
    getAllStudies(),
    getCategories(),
    getWorkPage(),
    loadTestimonials(),
  ]);
  return (
    <>
      <Nav dark />
      <WorkBody
        projects={projects}
        categories={categories}
        config={config}
        testimonials={testimonials}
        viewFromUrl={viewFromUrl ?? null}
      />
    </>
  );
}
