/**
 * Patch buildPage project modal scroll bodies (Trigger → Insight grid).
 * Source: scripts/data/buildProjectDetails.ts — patch-only, not read at runtime.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-build-case-study-details.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

import { BUILD_PROJECT_DETAILS } from "./data/buildProjectDetails";

const client = getCliClient({ apiVersion: "2025-01-01" });

async function main() {
  const page = await client.fetch<{
    _id: string;
    projects?: { id?: string; caseStudyDetail?: unknown }[];
  } | null>(`*[_type == "buildPage"][0]{ _id, projects }`);

  if (!page?._id) throw new Error("buildPage not found");

  let patched = 0;
  const projects = (page.projects ?? []).map((p) => {
    const detail = p.id ? BUILD_PROJECT_DETAILS[p.id] : undefined;
    if (!detail) return p;
    patched += 1;
    console.log(`  · ${p.id}`);
    return {
      ...p,
      caseStudyDetail: {
        statusLabel: detail.statusLabel,
        trigger: detail.trigger,
        observation: detail.observation,
        hypothesis: detail.hypothesis,
        value: detail.value,
        experiment: detail.experiment,
        statusBody: detail.statusBody,
        checklist: detail.checklist,
        whoFor: detail.whoFor,
        howItWorks: detail.howItWorks,
        insights: detail.insights,
      },
    };
  });

  await client.patch(page._id).set({ projects }).commit({
    autoGenerateArrayKeys: true,
  });

  console.log(`✓ patched caseStudyDetail on ${patched} projects (${page._id})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
