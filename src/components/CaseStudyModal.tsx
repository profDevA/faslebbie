"use client";

import { useRouter } from "next/navigation";
import CaseStudy from "@/components/CaseStudy";
import type { WorkProject } from "@/lib/content";

/**
 * Overlay wrapper for the intercepted route (app/work/@modal/(.)[slug]). Renders
 * the shared case study as a fixed modal over /work and closes it by popping the
 * history entry, so Back returns to the grid and the URL stays shareable.
 */
export default function CaseStudyModal({
  project,
  prev,
  next,
}: {
  project: WorkProject;
  prev: WorkProject;
  next: WorkProject;
}) {
  const router = useRouter();
  return (
    <CaseStudy
      project={project}
      prev={prev}
      next={next}
      variant="overlay"
      onClose={() => router.back()}
      // Replace (not push) so paging Prev/Next never stacks modals/history —
      // one modal stays over /work and × (router.back) always closes to it.
      onNavigate={(slug) => router.replace(`/work/${slug}`)}
    />
  );
}
