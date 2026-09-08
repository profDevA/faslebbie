/**
 * Acme Lending §09 Impact — live WP metric order + copy (faslebbie acme-lending.html).
 *
 * Order: 33% Verification Time → 78% Cost-to-Serve → 10% Digital Completion Rate
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-acme-impact-metrics.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-acme-impact-metrics.ts --with-user-token
 */
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const SLUG = "acme-lending";

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

/** Live site #user_impact — left → right. */
const ITEMS = [
  {
    _type: "statItem" as const,
    _key: key(),
    value: 33,
    suffix: "%",
    label: "Verification Time Reduction",
    note: "The average processing time dropped, with cumulative efficiency shaving 3-5 days off the total time to close a loan, bringing Acme Lending closer to industry-leading efficiency standards.",
  },
  {
    _type: "statItem" as const,
    _key: key(),
    value: 78,
    suffix: "%",
    label: "Cost-to-Serve Reduction",
    note: "Operational costs per loan dropped from ~$150 to <$40 via digital automation.",
  },
  {
    _type: "statItem" as const,
    _key: key(),
    value: 10,
    suffix: "%",
    label: "Digital Completion Rate Increase",
    note: "More borrowers successfully completed verification digitally, reducing manual intervention and improving overall loan origination throughput.",
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
    console.log(`→ ${id}: 33% → 78% → 10% (live order)`);
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
