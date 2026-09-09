/**
 * Financial Data Exchange §09 Impact — live WP order + copy (faslebbie financial-data-exchange.html).
 *
 * Order: 20M+ Consumer Accounts → 67% User Trust → 30+ Institutions
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-fdx-impact-metrics.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-fdx-impact-metrics.ts --with-user-token
 */
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const SLUG = "financial-data-exchange";

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

/** Live site #user_impact — left → right. */
const ITEMS = [
  {
    _type: "statItem" as const,
    _key: key(),
    value: 20,
    suffix: "M+",
    label: "Consumer Accounts Protected",
    note: "Transitioned Intuit's active user base from insecure screen-scraping to FDX-compliant APIs",
  },
  {
    _type: "statItem" as const,
    _key: key(),
    value: 67,
    suffix: "%",
    label: "Increase in User Trust Signals",
    note: "Achieved by replacing screen-scraping with app-based authentication",
  },
  {
    _type: "statItem" as const,
    _key: key(),
    value: 30,
    suffix: "+",
    label: "Institutions Standardized",
    note: "Implemented FDX principles (Transparency, Granularity, Control) across banking institutions like Chase, Wells Fargo, etc.",
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
    console.log(`→ ${id}: 20M+ → 67% → 30+ (live order)`);
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
