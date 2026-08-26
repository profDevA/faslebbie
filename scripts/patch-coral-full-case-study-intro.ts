/**
 * Set Coral Health full-case-study intro + inline link label (Figma 2110:41721).
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-coral-full-case-study-intro.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

const SLUG = "coral-health";
const LABEL = "Full Case Study";
const INTRO =
  "This case study is intentionally condensed for a quick overview. Explore the complete research, process and outcomes in the";

async function main() {
  const doc = await client.fetch<{ _id: string; title?: string } | null>(
    `*[_type == "caseStudy" && slug.current == $slug][0]{ _id, title }`,
    { slug: SLUG },
  );
  if (!doc?._id) throw new Error(`case study not found: ${SLUG}`);

  await client
    .patch(doc._id)
    .set({ fullCaseStudyLabel: LABEL, fullCaseStudyIntro: INTRO })
    .commit();

  console.log(`✓ ${doc.title ?? SLUG} — fullCaseStudyIntro + label updated`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
