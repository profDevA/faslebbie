/**
 * Copy published caseStudy.sections onto matching drafts.* so preview matches.
 *   sanity exec scripts/sync-study-drafts.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

const SLUGS = [
  "coral-health",
  "memory-tubes",
  "2020-us-census-benefit-calculator",
  "diamond-valuation-ai",
  "oc-links",
  "forever-a-surfer",
  "snapback-lifestyle",
];

async function main() {
  for (const slug of SLUGS) {
    const pub = await client.fetch<{ _id: string; sections: unknown[] } | null>(
      `*[_type=="caseStudy" && slug.current==$slug && !(_id in path("drafts.**"))][0]{ _id, sections }`,
      { slug },
    );
    if (!pub) {
      console.warn(`! no published ${slug}`);
      continue;
    }
    const draftId = `drafts.${pub._id.replace(/^drafts\./, "")}`;
    const draft = await client.getDocument(draftId);
    if (!draft) {
      console.log(`· ${slug}: no draft`);
      continue;
    }
    await client.patch(draftId).set({ sections: pub.sections }).commit();
    console.log(`✓ synced ${draftId}`);
  }
}

main();
