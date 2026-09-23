/**
 * Circle §04 View More popup — 8-plate grid (Figma `4409:26000`).
 *
 * Composite phone plates, not the band’s five single phones (`4171:48253`).
 * Plates @4×, dark fill `#222222` on cream `#e3e3db`.
 *   4409:26004 onboarding
 *   4409:26091 taste
 *   4409:26208 find people
 *   4409:26278 nearby
 *   4409:26518 venues
 *   4409:26680 saved
 *   4409:26772 share
 *   4409:27025 saved (same plate as 4409:26680 in the Figma frame)
 *
 * Heading “Design Interventions” + the Figma lorem under it. Single tab, all
 * 8 visible. Grid gaps 43/87. Band `previewScreens` stay on
 * `patch-circle-core-experience.ts`.
 *
 * PNG: public/work/circle/core-flow/modal/
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-circle-core-experience-popup.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-circle-core-experience-popup.ts --with-user-token
 *
 * Do not re-run after manual Studio image uploads.
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const PUB_ID = "cs-circle";
const MODAL_DIR = join(process.cwd(), "public/work/circle/core-flow/modal");

const POPUP_BG = "#e3e3db";
const POPUP_TILE_BG = "#222222";
const TEXT = "#171717";

const INTRO =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

const GRID = [
  { file: "01-onboarding.png", figma: "4409:26004" },
  { file: "02-taste.png", figma: "4409:26091" },
  { file: "03-find-people.png", figma: "4409:26208" },
  { file: "04-nearby.png", figma: "4409:26278" },
  { file: "05-flow.png", figma: "4409:26518" },
  { file: "06-flow.png", figma: "4409:26680" },
  { file: "07-flow.png", figma: "4409:26772" },
  { file: "08-flow.png", figma: "4409:27025" },
] as const;

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

async function uploadImage(absPath: string) {
  const asset = await client.assets.upload("image", createReadStream(absPath), {
    filename: basename(absPath),
    contentType: "image/png",
  });
  console.log(`  ↑ ${basename(absPath)} → ${asset._id}`);
  return {
    _type: "image" as const,
    asset: { _type: "reference" as const, _ref: asset._id },
  };
}

async function patchDoc(docId: string) {
  const doc = await client.getDocument(docId);
  if (!doc) return;
  const sections = (doc.sections ?? []) as { _type: string }[];
  const idx = sections.findIndex((s) => s._type === "coreExperience");
  if (idx < 0) throw new Error(`${docId}: no coreExperience`);

  const items = [];
  for (const row of GRID) {
    const abs = join(MODAL_DIR, row.file);
    if (!existsSync(abs)) throw new Error(`Missing PNG: ${abs}`);
    console.log(`${DRY ? "○" : "↑"} ${row.file} (${row.figma})`);
    items.push({
      _key: key(),
      _type: "galleryItem" as const,
      image: DRY
        ? { _type: "image", asset: { _type: "reference", _ref: "dry-run" } }
        : await uploadImage(abs),
    });
  }

  const popupBody = [
    {
      _type: "block",
      _key: key(),
      style: "normal",
      markDefs: [],
      children: [{ _type: "span", _key: key(), text: INTRO, marks: [] }],
    },
  ];

  console.log(`→ patch ${docId} coreExperience[${idx}] popup (${items.length} plates)`);
  if (DRY) return;

  await client
    .patch(docId)
    .set({
      [`sections[${idx}].popupTitle`]: "Design Interventions",
      [`sections[${idx}].popupBody`]: popupBody,
      [`sections[${idx}].popupTabs`]: [
        {
          _key: key(),
          _type: "deviceTab",
          label: "Flow screens",
          items,
        },
      ],
      [`sections[${idx}].popupItemsBeforeViewMore`]: items.length,
      [`sections[${idx}].popupAppearance.backgroundColor`]: sanityColor(POPUP_BG),
      [`sections[${idx}].popupAppearance.textColor`]: sanityColor(TEXT),
      [`sections[${idx}].popupAppearance.contentAlignment`]: "left",
      [`sections[${idx}].popupAppearance.tileBackgroundColor`]:
        sanityColor(POPUP_TILE_BG),
      [`sections[${idx}].popupAppearance.contentGap`]: 43,
      [`sections[${idx}].popupAppearance.contentGapInner`]: 87,
    })
    .commit();
}

async function main() {
  console.log(`patch-circle-core-experience-popup (${DRY ? "dry" : "live"})`);
  const pub = await client.fetch<{ _id: string } | null>(
    `*[_id == $id][0]{ _id }`,
    { id: PUB_ID },
  );
  if (!pub) throw new Error(`Missing ${PUB_ID}`);

  await patchDoc(pub._id);

  const draftId = `drafts.${pub._id}`;
  if (await client.getDocument(draftId)) {
    await patchDoc(draftId);
  }

  if (DRY) {
    console.log("(dry run — no writes)");
    return;
  }
  console.log(`✓ Circle CE popup (${GRID.length} plates, ${POPUP_BG})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
