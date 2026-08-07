import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CaseStudyView from "@/components/CaseStudyView";
import { pageMetadataFromSanity } from "@/lib/pageMetadata";
import { findStudy, getSiteSettings, getStudySlugs } from "@/sanity/fetch";

// Standalone, shareable case-study page at /work/<slug> — renders on a direct
// visit / refresh / share. Inside the works page itself, clicking a project opens
// the same study as a client-side popup (see WorkBody), so no navigation happens.
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
    <CaseStudyView
      project={found.project}
      prev={found.prev}
      next={found.next}
      variant="page"
    />
  );
}
