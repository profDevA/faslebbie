/**
 * The AR Handbook §09 Impact — live WP order + copy (faslebbie remote-assistant-object-detection #user_impact).
 *
 * Order: 40% Faster Part Recognition → 30% Error Reduction → 20M ARR
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-ar-handbook-impact-metrics.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-ar-handbook-impact-metrics.ts --with-user-token
 */
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const SLUG = "the-ar-handbook";

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

/** Live site #user_impact — left → right. */
const ITEMS = [
  {
    _type: "statItem" as const,
    _key: key(),
    value: 40,
    suffix: "%",
    label: "Faster Part Recognition",
    note: "Part identification improved from 15-20 min to 10-12 min.",
  },
  {
    _type: "statItem" as const,
    _key: key(),
    value: 30,
    suffix: "%",
    label: "Error Reduction",
    note: "Fewer inspection mistakes through AI-assisted verification.",
  },
  {
    _type: "statItem" as const,
    _key: key(),
    value: 20,
    suffix: "M",
    label: "ARR",
    note: "Pilot contracts with Porsche, German automotive OEMs, and IKEA, generating significant revenue across.",
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
    console.log(`→ ${id}: 40% → 30% → 20M ARR (live order)`);
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
