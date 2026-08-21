/**
 * Patch buildPage project subtitles, blurbs, kickers (collaboration doc).
 * Does not touch intro or images. Popup long bodies live in buildProjectDetails.ts.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-build-project-copy.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

import { BUILD_PROJECT_COPY } from "../src/lib/buildProjectDetails";

const client = getCliClient({ apiVersion: "2025-01-01" });

async function main() {
  const page = await client.fetch<{
    _id: string;
    projects?: { id?: string; subtitle?: string; blurb?: string; kicker?: string }[];
  } | null>(`*[_type == "buildPage"][0]{ _id, projects }`);

  if (!page?._id) throw new Error("buildPage not found");

  let patched = 0;
  const projects = (page.projects ?? []).map((p) => {
    const copy = p.id ? BUILD_PROJECT_COPY[p.id] : undefined;
    if (!copy) return p;
    patched += 1;
    console.log(`  · ${p.id}`);
    return {
      ...p,
      subtitle: copy.subtitle,
      blurb: copy.blurb,
      kicker: copy.kicker,
    };
  });

  await client.patch(page._id).set({ projects }).commit({
    autoGenerateArrayKeys: true,
  });

  console.log(`✓ patched ${patched} projects on ${page._id}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
