/**
 * Experian Boost §09 Impact — add 13 pts (Overview lead) to the metrics band.
 * Replaces Bank-Link Trust Rating (92%) — trust still appears in Reflection copy.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-experian-impact-metrics.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-experian-impact-metrics.ts --with-user-token
 */
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const SLUG = "experian-boost";

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

const ITEMS = [
  {
    _type: "statItem" as const,
    _key: key(),
    value: 13,
    suffix: "pts",
    label: "Average Score Increase",
    note: "Average FICO Score lift for users who connected eligible bill payments through Boost.",
  },
  {
    _type: "statItem" as const,
    _key: key(),
    value: 86,
    suffix: "%",
    label: "Thin-File Access Unlocked",
    note: "Thin-file users gained real credit access through recognized payments.",
  },
  {
    _type: "statItem" as const,
    _key: key(),
    value: 33,
    suffix: "%",
    label: "Faster Loan Origination",
    note: "Validating payment data upfront shortened lenders' loan decision timelines.",
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
    console.log(`→ ${id}: 13 pts + 86% + 33%`);
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
