/**
 * US Census §09 Impact — live WP order + copy (faslebbie 2020-us-census-benefit-calculator.html).
 *
 * Order: 40B+ Federal Funding → 17% Response Rate → 500K Children Made Visible
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-census-impact-metrics.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-census-impact-metrics.ts --with-user-token
 */
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const SLUG = "2020-us-census-benefit-calculator";

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

/** Live site #user_impact — left → right. */
const ITEMS = [
  {
    _type: "statItem" as const,
    _key: key(),
    value: 40,
    suffix: "B+",
    label: "In Federal Funding Retained",
    note: "projected by increasing census participation among immigrant families and reducing undercount risk in hard-to-reach NYC districts",
  },
  {
    _type: "statItem" as const,
    _key: key(),
    value: 17,
    suffix: "%",
    label: "Estimated Increase in Census Response Rate",
    note: "based on targeted fieldworker interventions using the benefit calculator to reframe participation as a pathway to tangible family resources",
  },
  {
    _type: "statItem" as const,
    _key: key(),
    value: 500,
    suffix: "K",
    label: "At-risk Children Made Visible",
    note: "by helping immigrant households count every child, unlocking funding for schools, healthcare, and housing support",
  },
];

async function main() {
  const doc = await client.fetch<{ _id: string; sections: { _type: string }[] }>(
    `*[_type == "caseStudy" && slug.current == $slug][0]{ _id, sections[]{ _type } }`,
    { slug: SLUG },
  );
  if (!doc) throw new Error(`no case study: ${SLUG}`);

  const i = doc.sections.findIndex((s) => s._type === "statsSection");
  if (i < 0) throw new Error("no statsSection");

  const ids = [doc._id];
  const draftId = `drafts.${doc._id}`;
  if (await client.getDocument(draftId)) ids.push(draftId);

  for (const id of ids) {
    console.log(`→ ${id}: 40B+ → 17% → 500K (live order)`);
    if (!DRY) {
      await client.patch(id).set({ [`sections[${i}].items`]: ITEMS }).commit();
    }
  }

  console.log(`\n${DRY ? "(dry run) " : ""}${ids.length} doc(s) updated`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
