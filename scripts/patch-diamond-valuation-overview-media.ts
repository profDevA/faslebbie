/**
 * Diamond Valuation AI — overview side media fit/colour.
 *
 * Coral migration left contain + #1A1A1A, which letterboxed the mockup on mobile.
 * Figma 4001:75395 / 4001:79403 — full-bleed DA_PO.Jpg (cover, panel matches art).
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-diamond-valuation-overview-media.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-diamond-valuation-overview-media.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const PUB_ID = "cs-diamond-valuation-ai";

/** Medium gray in DA_PO.Jpg — Figma mobile panel, not black letterboxing. */
const PANEL_BG = "#808080";

type Section = { _type: string; _key: string };

function overviewIdx(sections: Section[]) {
  return sections.findIndex((s) => s._type === "overviewSection");
}

async function patchDoc(docId: string, idx: number) {
  const patch = client.patch(docId).set({
    [`sections[${idx}].sideImageFit`]: "cover",
    [`sections[${idx}].sideImageBackgroundColor`]: sanityColor(PANEL_BG),
  });
  if (!DRY) await patch.commit();
}

async function main() {
  console.log(`patch-diamond-valuation-overview-media (${DRY ? "dry" : "live"})`);

  const pub = await client.fetch<{ sections: Section[] }>(
    `*[_id == $id][0]{ sections[]{ _type, _key } }`,
    { id: PUB_ID },
  );
  if (!pub?.sections?.length) throw new Error(`Missing ${PUB_ID}`);

  const idx = overviewIdx(pub.sections);
  if (idx < 0) throw new Error("No overviewSection");

  console.log(`→ sideImageFit: cover, panel: ${PANEL_BG} (was contain + #1A1A1A)`);
  await patchDoc(PUB_ID, idx);

  const draftId = `drafts.${PUB_ID}`;
  if (await client.getDocument(draftId)) {
    console.log(`→ sync ${draftId}`);
    await patchDoc(draftId, idx);
  }

  if (DRY) {
    console.log("(dry run — no writes)");
    return;
  }

  console.log("✓ overview media settings patched");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
