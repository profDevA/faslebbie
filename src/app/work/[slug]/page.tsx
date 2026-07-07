import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CaseStudy from "@/components/CaseStudy";
import { findWorkProject, workProjects } from "@/lib/content";

// Standalone, shareable case-study page at /work/<slug> — renders on a direct
// visit / refresh / share. Inside the works page itself, clicking a project opens
// the same study as a client-side popup (see WorkBody), so no navigation happens.
export function generateStaticParams() {
  return workProjects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const found = findWorkProject(slug);
  if (!found) return {};
  const { project } = found;
  return {
    title: `${project.name} — Fas Lebbie`,
    description: project.tagline,
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const found = findWorkProject(slug);
  if (!found) notFound();

  return (
    <CaseStudy
      project={found.project}
      prev={found.prev}
      next={found.next}
      variant="page"
    />
  );
}
