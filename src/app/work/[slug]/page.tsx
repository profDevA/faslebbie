import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import CaseStudyAccess from "@/components/CaseStudyAccess";
import { caseStudyHref } from "@/lib/caseStudyNav";
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
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { slug } = await params;
  const { view } = await searchParams;
  // Old links carried ?view=txt / ?view=img (before Nov 17). One address per
  // study for sharing and Google (Fas, Nov 16 evening: "I need to clean up the
  // URL"): 308 to the clean /work/<slug>. The "Work" / × link then goes back to
  // the view this tab last used (sessionStorage, CaseStudyAccess), else .img.
  if (view !== undefined) permanentRedirect(`/work/${encodeURIComponent(slug)}`);
  const found = await findStudy(slug);
  if (!found) notFound();

  return (
    <CaseStudyAccess
      project={found.project}
      prev={found.prev}
      next={found.next}
      pager={{
        hrefs: found.order.map((s) => caseStudyHref(s.slug)),
        labels: found.order.map((s) => s.name),
        active: found.index,
      }}
    />
  );
}
