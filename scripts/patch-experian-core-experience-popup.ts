/**
 * Experian Boost — Core Experience View More popup (Holistic Figma modal grid).
 *
 * Desktop modal interior: 3947:17067 — eight staggered grid tiles @4×
 *   3947:17071 / 17333 / 17624 / 17777 / 18015 / 18170 / 27081 / 27246
 * Mobile reference: 3778:130910 (same flow sequence, fewer rows).
 *
 * Single grid tab (no Mobile/iPad/Desktop like Coral). Band previewScreens
 * are unchanged — patch-experian-core-experience.ts.
 *
 * PNG source: public/work/experian-boost/core-flow/modal/
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-experian-core-experience-popup.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-experian-core-experience-popup.ts --with-user-token
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const SLUG = "experian-boost";
const MODAL_DIR = join(process.cwd(), "public/work/experian-boost/core-flow/modal");
const POPUP_TILE_BG = "#282866";

const INTRO =
  "The core design intervention was Experian Boost, a mobile experience designed to target renters and utility payers who have been historically penalized by the credit system. Currently, 35% of credit-invisible Americans see no benefit from making their bill payments on time. To address this, we designed a secure data bridge that links their bank accounts directly to their Experian credit file. This works by inverting the traditional credit reporting model. Instead of waiting for a lender to report data, the user actively grants Experian permission to scan their transaction history for qualifying payments—such as water, electricity, and rent. We integrated this into a seamless flow that translates these existing behaviors into immediate points on their FICO® Score.";

/** Grid order matches Figma modal rows top → bottom, left → right. */
const GRID = [
  { file: "01-flow.png", figma: "3947:17071" },
  { file: "02-flow.png", figma: "3947:17333" },
  { file: "03-flow.png", figma: "3947:17624" },
  { file: "04-flow.png", figma: "3947:17777" },
  { file: "05-flow.png", figma: "3947:18015" },
  { file: "06-flow.png", figma: "3947:18170" },
  { file: "07-flow.png", figma: "3947:27081" },
  { file: "08-flow.png", figma: "3947:27246" },
] as const;

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

function sanityColor(hex: string, alpha = 1) {
  return { _type: "color" as const, hex, alpha };
}

async function uploadImage(absPath: string) {
  const asset = await client.assets.upload("image", createReadStream(absPath), {
    filename: basename(absPath),
  });
  return { _type: "image" as const, asset: { _type: "reference" as const, _ref: asset._id } };
}

async function main() {
  const docId = await client.fetch<string>(
    `*[_type == "caseStudy" && slug.current == $slug][0]._id`,
    { slug: SLUG },
  );
  if (!docId) throw new Error(`no case study: ${SLUG}`);

  const doc = await client.fetch<{ sections: { _key: string; _type: string }[] }>(
    `*[_id == $id][0]{ sections[]{ _key, _type } }`,
    { id: docId },
  );
  const idx = doc.sections.findIndex((s) => s._type === "coreExperience");
  if (idx < 0) throw new Error("no coreExperience section");

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

  const popupTabs = [
    {
      _key: key(),
      _type: "deviceTab" as const,
      label: "Flow screens",
      items,
    },
  ];

  const popupBody = [
    {
      _type: "block",
      _key: key(),
      style: "normal",
      markDefs: [],
      children: [{ _type: "span", _key: key(), text: INTRO, marks: [] }],
    },
  ];

  const patch = {
    [`sections[${idx}].popupTitle`]: "Core Experience Flows",
    [`sections[${idx}].popupBody`]: popupBody,
    [`sections[${idx}].popupTabs`]: popupTabs,
    [`sections[${idx}].popupItemsBeforeViewMore`]: 6,
    [`sections[${idx}].popupLoadMoreLabel`]: "Load More",
    [`sections[${idx}].viewMoreLabel`]: "View More",
    [`sections[${idx}].popupAppearance.tileBackgroundColor`]: sanityColor(POPUP_TILE_BG),
    [`sections[${idx}].popupAppearance.contentGap`]: 43,
    [`sections[${idx}].popupAppearance.contentGapInner`]: 87,
  };

  if (DRY) {
    console.log(`dry-run ${SLUG}: popupTabs=1 items=${items.length}`);
    return;
  }

  await client.patch(docId).set(patch).unset([`sections[${idx}].popupScreens`]).commit();
  console.log(`✓ ${docId}: popup grid=${items.length} tiles on #282866`);

  const draftId = `drafts.${docId}`;
  const draft = await client.fetch<{ sections?: unknown[] } | null>(
    `*[_id == $id][0]{ sections }`,
    { id: draftId },
  );
  if (draft?.sections) {
    await client.patch(draftId).set(patch).unset([`sections[${idx}].popupScreens`]).commit();
    console.log(`✓ synced ${draftId}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
