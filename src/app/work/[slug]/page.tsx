import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CaseStudy from "@/components/CaseStudy";
import { findWorkProject, workProjects } from "@/lib/content";

// Standalone, shareable case-study page at /work/<slug>. This is what renders on
// a direct visit / refresh / share; client-side navigation from /work shows the
// same study as an intercepted overlay (app/work/@modal/(.)[slug]) instead.
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

  return <CaseStudy project={found.project} next={found.next} variant="page" />;
}
