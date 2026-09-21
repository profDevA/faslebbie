/**
 * OC Links §09 Impact — live WP copy (fasandsabrina.com/case-studies/oc-links/ #user_impact).
 *
 * Order: 47% Reduction of Crisis Response Times → 92% Staff Satisfaction Rating
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-oc-links-impact-metrics.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-oc-links-impact-metrics.ts --with-user-token
 */
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const SLUG = "oc-links";

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

/** Live site #user_impact — left → right. */
const ITEMS = [
  {
    _type: "statItem" as const,
    _key: key(),
    value: 47,
    suffix: "%",
    label: "Reduction of Crisis Response Times",
    note: 'Direct validation of our "Accelerating Care Velocity" goal; streamlined workflows eliminated the administrative bottlenecks that previously delayed critical interventions.',
  },
  {
    _type: "statItem" as const,
    _key: key(),
    value: 92,
    suffix: "%",
    label: "Staff Satisfaction Rating",
    note: 'Achieving our target to "Reduce Cognitive Load," the shift from frustrated manual workarounds to reliable, unified tools transformed the daily responder experience.',
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
    console.log(`→ ${id}: Impact — 47% → 92% (live WP copy)`);
    if (!DRY) {
      await client
        .patch(id)
        .set({
          [`sections[${i}].sectionTitle`]: "Impact",
          [`sections[${i}].items`]: ITEMS,
        })
        .commit();
    }
  }

  console.log(`\n${DRY ? "(dry run) " : ""}${ids.length} doc(s) updated`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
