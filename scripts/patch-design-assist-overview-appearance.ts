/**
 * Design Assist AI §02 Overview — right media column only (Figma 3719:64877
 * side panel ~#f4f7fc). Copy column stays template cream via unset appearance.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-design-assist-overview-appearance.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-design-assist-overview-appearance.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const PUB_ID = "cs-design-assist-ai";

const SIDE_PANEL = "#f4f7fc";

type Section = { _type: string; _key: string };

function overviewIdx(sections: Section[]) {
  return sections.findIndex((s) => s._type === "overviewSection");
}

async function patchDoc(docId: string) {
  const doc = await client.getDocument(docId);
  if (!doc) return false;
  const sections = (doc.sections ?? []) as Section[];
  const idx = overviewIdx(sections);
  if (idx < 0) throw new Error(`${docId}: no overviewSection`);

  const patch = client.patch(docId).set({
    [`sections[${idx}].sideImageBackgroundColor`]: sanityColor(SIDE_PANEL),
    [`sections[${idx}].sideImageFit`]: "contain",
  });
  patch.unset([
    `sections[${idx}].image`,
    `sections[${idx}].appearance.backgroundColor`,
    `sections[${idx}].appearance.textColor`,
  ]);

  if (!DRY) await patch.commit();
  return true;
}

async function main() {
  console.log(
    `patch-design-assist-overview-appearance (${DRY ? "dry" : "live"})`,
  );
  console.log(`  side panel only ${SIDE_PANEL}`);

  console.log(`→ patch ${PUB_ID}`);
  await patchDoc(PUB_ID);

  const draftId = `drafts.${PUB_ID}`;
  if (await client.getDocument(draftId)) {
    console.log(`→ sync ${draftId}`);
    await patchDoc(draftId);
  }

  if (DRY) {
    console.log("(dry run — no writes)");
    return;
  }
  console.log("✓ Design Assist overview side panel patched");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
