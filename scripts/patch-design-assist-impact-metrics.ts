/**
 * Design Assist AI §09 Impact — live WP copy (fasandsabrina.com/case-studies/design-assist-ai/).
 *
 * Order: 15 hrs Time Reclaimed → 45% Capacity Growth → 90% Blueprint Adoption
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-design-assist-impact-metrics.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-design-assist-impact-metrics.ts --with-user-token
 */
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const SLUG = "design-assist-ai";

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

type StatItem = {
  _type: "statItem";
  _key: string;
  value: number;
  suffix?: string;
  label: string;
  note?: string;
};

/** Live site #user_impact — left → right. */
const LIVE_ITEMS: Omit<StatItem, "_key">[] = [
  {
    _type: "statItem",
    value: 15,
    suffix: "hrs",
    label: "Time Reclaimed",
    note: "Eliminated manual system searches and compliance checks per month",
  },
  {
    _type: "statItem",
    value: 45,
    suffix: "%",
    label: "Capacity Growth",
    note: "Equivalent to adding 2-3 designers without new headcount",
  },
  {
    _type: "statItem",
    value: 90,
    suffix: "%",
    label: "Blueprint Adoption",
    note: "Grew from ~45% to 90% within 9 months of launch.",
  },
];

function buildItems(existing?: StatItem[]): StatItem[] {
  return LIVE_ITEMS.map((item, i) => ({
    ...item,
    _key: existing?.[i]?._key ?? key(),
  }));
}

async function main() {
  const doc = await client.fetch<{
    _id: string;
    sections: { _type: string; items?: StatItem[]; sectionTitle?: string }[];
  }>(`*[_type == "caseStudy" && slug.current == $slug][0]{
    _id,
    sections[]{ _type, sectionTitle, items[]{ _key, _type, value, suffix, label, note } }
  }`, { slug: SLUG });
  if (!doc) throw new Error(`no case study: ${SLUG}`);

  const i = doc.sections.findIndex((s) => s._type === "statsSection");
  if (i < 0) throw new Error("no statsSection");

  const items = buildItems(doc.sections[i]?.items);
  const ids = [doc._id];
  const draftId = `drafts.${doc._id}`;
  if (await client.getDocument(draftId)) ids.push(draftId);

  for (const id of ids) {
    console.log(`→ ${id}: 15 hrs → 45% → 90% (live copy)`);
    items.forEach((item, n) => {
      console.log(`  [${n + 1}] ${item.value}${item.suffix ?? ""} ${item.label}`);
    });
    if (!DRY) {
      await client
        .patch(id)
        .set({
          [`sections[${i}].sectionTitle`]: "Impact",
          [`sections[${i}].items`]: items,
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
