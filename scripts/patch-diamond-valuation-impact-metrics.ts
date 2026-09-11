/**
 * Diamond Valuation AI §09 Impact — live WP copy (faslebbie diamond-valuation-ai.html #user_impact).
 *
 * Order: 70% Miners Empowered → 40% Fair-value Increase
 * (500 miners count lives in the first metric note — same as live site.)
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-diamond-valuation-impact-metrics.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-diamond-valuation-impact-metrics.ts --with-user-token
 */
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const SLUG = "diamond-valuation-ai";

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

/** Live site #user_impact — left → right. */
const ITEMS = [
  {
    _type: "statItem" as const,
    _key: key(),
    value: 70,
    suffix: "%",
    label: "Miners Empowered",
    note: "500 artisanal miners accessing fair market valuation tools",
  },
  {
    _type: "statItem" as const,
    _key: key(),
    value: 40,
    suffix: "%",
    label: "Fair-value Increase",
    note: "Miners are capturing more value through pricing insights",
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
    console.log(`→ ${id}: Impact — 70% → 40% (live WP copy)`);
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
