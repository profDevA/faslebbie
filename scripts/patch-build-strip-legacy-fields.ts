/**
 * Remove pre–caseStudyDetail modal fields from buildPage.projects.
 * Run after patch-build-case-study-details.ts. Safe to re-run.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-build-strip-legacy-fields.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

const LEGACY = ["description", "howItWorks", "note", "supportedTools"] as const;

async function main() {
  const page = await client.fetch<{
    _id: string;
    projects?: Record<string, unknown>[];
  } | null>(`*[_type == "buildPage"][0]{ _id, projects }`);

  if (!page?._id) throw new Error("buildPage not found");

  let stripped = 0;
  const projects = (page.projects ?? []).map((p) => {
    let touched = false;
    const next = { ...p };
    for (const key of LEGACY) {
      if (key in next) {
        delete next[key];
        touched = true;
      }
    }
    if (touched) {
      stripped += 1;
      console.log(`  · ${String(p.id ?? "(no id)")}`);
    }
    return next;
  });

  await client.patch(page._id).set({ projects }).commit({
    autoGenerateArrayKeys: true,
  });

  console.log(`✓ stripped legacy fields from ${stripped} projects (${page._id})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
