import { notFound } from "next/navigation";
import CaseStudyModal from "@/components/CaseStudyModal";
import { findWorkProject } from "@/lib/content";

// Intercepted route: on client-side navigation from /work, /work/[slug] renders
// here as a modal overlay over the grid (URL still becomes /work/<slug>). On a
// hard load / refresh it falls through to app/work/[slug]/page.tsx instead.
export default async function InterceptedCaseStudy({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const found = findWorkProject(slug);
  if (!found) notFound();

  return <CaseStudyModal project={found.project} prev={found.prev} next={found.next} />;
}
