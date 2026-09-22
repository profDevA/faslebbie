/**
 * Memory Tubes §09 Impact — collab copy (ignore Figma Coral leftover metrics).
 *
 * Source: scripts/data/caseStudyCollabCopy.json → memory-tubes.impact
 * Order: 3× Engagement Jump → 78% Positive Responses → 3 Interaction Time
 *
 * Band appearance (#e6ece8 mint) stays as set in Studio — not patched here.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-memory-tubes-impact-metrics.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-memory-tubes-impact-metrics.ts --with-user-token
 */
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import collab from "./data/caseStudyCollabCopy.json";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const SLUG = "memory-tubes";

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

type CollabMetric = {
  value: string;
  suffix?: string;
  label: string;
  note?: string;
};

type StatItem = {
  _type: "statItem";
  _key: string;
  value: number;
  suffix?: string;
  label: string;
  note?: string;
};

const METRICS = (
  collab[SLUG as keyof typeof collab] as { impact?: { metrics?: CollabMetric[] } }
).impact?.metrics;

if (!METRICS?.length) throw new Error(`No collab impact metrics for ${SLUG}`);

function buildItems(existing?: StatItem[]): StatItem[] {
  return METRICS.map((m, i) => ({
    _type: "statItem" as const,
    _key: existing?.[i]?._key ?? key(),
    value: Number.parseInt(m.value, 10),
    suffix: m.suffix || undefined,
    label: m.label,
    note: m.note?.trim() || undefined,
  }));
}

async function main() {
  const doc = await client.fetch<{
    _id: string;
    sections: { _type: string; items?: StatItem[]; sectionTitle?: string }[];
  }>(
    `*[_type == "caseStudy" && slug.current == $slug && !(_id in path("drafts.**"))][0]{
      _id,
      sections[]{ _type, sectionTitle, items[]{ _key, _type, value, suffix, label, note } }
    }`,
    { slug: SLUG },
  );
  if (!doc) throw new Error(`no case study: ${SLUG}`);

  const i = doc.sections.findIndex((s) => s._type === "statsSection");
  if (i < 0) throw new Error("no statsSection");

  const items = buildItems(doc.sections[i]?.items);
  const ids = [doc._id];
  const draftId = `drafts.${doc._id}`;
  if (await client.getDocument(draftId)) ids.push(draftId);

  console.log(`patch-memory-tubes-impact-metrics (${DRY ? "dry" : "live"}) — collab, not Figma`);

  for (const id of ids) {
    console.log(`→ ${id}: Impact`);
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
