/**
 * Coral rollout (Fas Oct 20, docs/meetings/2026-10-20-2-actions.md "E4 rollout")
 * — three single-field Studio values that still differ from Coral:
 *   1. KPE "Title margin bottom (desktop)" 56 → 105 (Coral KPE, Figma 4556:37938)
 *      on Experian (stacked) + DVA (phoneRow). Note: this field is not in the
 *      GROQ projection, so the site renders the code default
 *      (MOTION_SHOWCASE_BAND_DEFAULTS, also set to 105) — the patch keeps
 *      Studio in sync with what renders.
 *   2. Highlights grid tile gap → 14 (Coral) on Snapback, Forever a Surfer, OC Links.
 *   3. CE View All popup "items before Load More" → 6 (Coral) where it showed
 *      every tile: Census, DVA, OC Nav, OC Links, Circle.
 * Sections are addressed by _key; published doc + draft (if any). Text only,
 * no assets. Dry by default.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-coral-rollout-oct21.ts --with-user-token
 *   npx sanity exec scripts/patch-coral-rollout-oct21.ts --with-user-token -- --apply
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const APPLY = process.argv.includes("--apply");

type Change = { slug: string; type: string; layout?: string; field: string; value: number };

const CHANGES: Change[] = [
  { slug: "experian-boost", type: "motionShowcase", layout: "stacked", field: "titleMarginBottomDesktop", value: 105 },
  { slug: "diamond-valuation-ai", type: "motionShowcase", layout: "phoneRow", field: "titleMarginBottomDesktop", value: 105 },
  { slug: "snapback-lifestyle", type: "highlightReel", field: "gridGap", value: 14 },
  { slug: "forever-a-surfer", type: "highlightReel", field: "gridGap", value: 14 },
  { slug: "oc-links", type: "highlightReel", field: "gridGap", value: 14 },
  { slug: "2020-us-census-benefit-calculator", type: "coreExperience", field: "popupItemsBeforeViewMore", value: 6 },
  { slug: "diamond-valuation-ai", type: "coreExperience", field: "popupItemsBeforeViewMore", value: 6 },
  { slug: "oc-digital-resource-navigator", type: "coreExperience", field: "popupItemsBeforeViewMore", value: 6 },
  { slug: "oc-links", type: "coreExperience", field: "popupItemsBeforeViewMore", value: 6 },
  { slug: "circle", type: "coreExperience", field: "popupItemsBeforeViewMore", value: 6 },
];

type Section = { _key: string; _type: string; layoutVariant?: string } & Record<string, unknown>;

async function patchOne(docId: string, c: Change) {
  const doc = await client.fetch<{ sections?: Section[] } | null>(`*[_id == $id][0]{ sections }`, { id: docId });
  if (!doc?.sections) return false;
  const matches = doc.sections.filter(
    (s) => s._type === c.type && (!c.layout || (s.layoutVariant ?? "stacked") === c.layout),
  );
  if (matches.length !== 1) throw new Error(`${docId}: expected 1 ${c.type}${c.layout ? `:${c.layout}` : ""}, found ${matches.length}`);
  const s = matches[0];
  const before = s[c.field];
  console.log(`  ${docId.padEnd(44)} ${c.type}[${s._key}].${c.field}: ${JSON.stringify(before)} → ${c.value}${before === c.value ? " (already)" : ""}`);
  if (APPLY && before !== c.value) {
    await client.patch(docId).set({ [`sections[_key=="${s._key}"].${c.field}`]: c.value }).commit();
  }
  return before !== c.value;
}

async function main() {
  console.log(`patch-coral-rollout-oct21 (${APPLY ? "APPLY" : "dry"})`);
  let changed = 0;
  for (const c of CHANGES) {
    const id = await client.fetch<string>(`*[_type == "caseStudy" && slug.current == $slug && !(_id in path("drafts.**"))][0]._id`, { slug: c.slug });
    if (!id) throw new Error(`no case study: ${c.slug}`);
    if (await patchOne(id, c)) changed++;
    const draftId = `drafts.${id}`;
    const hasDraft = await client.fetch<boolean>(`defined(*[_id == $id][0]._id)`, { id: draftId });
    if (hasDraft && (await patchOne(draftId, c))) changed++;
  }
  console.log(`${APPLY ? "✓ patched" : "would patch"} ${changed} field(s)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
