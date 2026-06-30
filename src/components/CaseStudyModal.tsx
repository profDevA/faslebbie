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
  next,
}: {
  project: WorkProject;
  next: WorkProject;
}) {
  const router = useRouter();
  return (
    <CaseStudy
      project={project}
      next={next}
      variant="overlay"
      onClose={() => router.back()}
    />
  );
}
