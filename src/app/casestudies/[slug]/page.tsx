import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CaseStudyAccess from "@/components/CaseStudyAccess";
import { pageMetadataFromSanity } from "@/lib/pageMetadata";
import { findStudy, getSiteSettings, getStudySlugs } from "@/sanity/fetch";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getStudySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [found, site] = await Promise.all([findStudy(slug), getSiteSettings()]);
  if (!found) return {};
  const { project } = found;
  return pageMetadataFromSanity(project.seo, {
    title: `${project.name} — Fas Lebbie`,
    description: project.tagline || site?.siteDescription?.trim(),
    ogImage: project.image || site?.ogImage,
    ogImageAlt: site?.ogImageAlt || project.name,
  });
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const found = await findStudy(slug);
  if (!found) notFound();

  return (
    <CaseStudyAccess
      project={found.project}
      prev={found.prev}
      next={found.next}
    />
  );
}
