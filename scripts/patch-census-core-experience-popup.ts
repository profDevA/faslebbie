/**
 * US Census — Core Experience View More popup (flat 2-column flow grid).
 *
 * Eight screens — landing hero + wizard + results (Figma 4002:91685).
 * Desktop frames where available (3999:*); steps 2–4 from Holistic mobile art (4002:*).
 *
 * Figma references:
 *   4002:91694 landing hero (Frame 48096440)
 *   3999:59099 step-1-location
 *   4002:100324 step-2-children-redesigned
 *   4002:100097 ages-all-complete-redesigned (step 3)
 *   4002:99859 step-4-household-income-redesigned
 *   3999:59152 step-5-review-answers-redesigned
 *   3999:59232 results-redesigned
 *   3999:59361 programme-detail-redesigned
 *
 * Band previewScreens unchanged — patch-census-core-experience.ts.
 *
 * PNG source: public/work/2020-us-census-benefit-calculator/core-flow/modal/
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-census-core-experience-popup.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-census-core-experience-popup.ts --with-user-token
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const APPEARANCE_ONLY = process.argv.includes("--appearance-only");
const SLUG = "2020-us-census-benefit-calculator";
const MODAL_DIR = join(
  process.cwd(),
  "public/work/2020-us-census-benefit-calculator/core-flow/modal",
);

/** Navy popup interior — Figma modal chrome #0A2A58 on white cards. */
const POPUP_BG = "#0A2A58";
const POPUP_TILE_BG = "#ffffff";

const INTRO =
  "The design intervention targets immigrant parents in New York City who distrust government institutions yet prioritize their children's welfare. Currently, more than half a million kids in New York state risk being undercounted, losing federal funding. To address this, we proposed the Census Benefit Calculator — a web application that connects users' locations, incomes, and children's ages to personalized federal programmes and their corresponding participation funds.";

/** Grid order — landing, wizard steps 1→5, then matches + detail. */
const GRID = [
  { file: "00-landing-hero.png", figma: "4002:91694" },
  { file: "01-step-1-location.png", figma: "3999:59099" },
  { file: "02-step-2-children.png", figma: "4002:100324" },
  { file: "03-step-3-ages.png", figma: "4002:100097" },
  { file: "04-step-4-income.png", figma: "4002:99859" },
  { file: "05-step-5-review.png", figma: "3999:59152" },
  { file: "06-results.png", figma: "3999:59232" },
  { file: "07-programme-detail.png", figma: "3999:59361" },
] as const;

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

function sanityColor(hex: string, alpha = 1) {
  return { _type: "color" as const, hex, alpha };
}

async function uploadImage(absPath: string) {
  const asset = await client.assets.upload("image", createReadStream(absPath), {
    filename: basename(absPath),
    contentType: "image/png",
  });
  return { _type: "image" as const, asset: { _type: "reference" as const, _ref: asset._id } };
}

async function patchDoc(docId: string, idx: number) {
  const appearancePatch = {
    [`sections[${idx}].popupAppearance.backgroundColor`]: sanityColor(POPUP_BG),
    [`sections[${idx}].popupAppearance.textColor`]: sanityColor("#ffffff"),
    [`sections[${idx}].popupAppearance.contentAlignment`]: "left",
    [`sections[${idx}].popupAppearance.tileBackgroundColor`]: sanityColor(POPUP_TILE_BG),
    [`sections[${idx}].popupAppearance.contentGap`]: 43,
    [`sections[${idx}].popupAppearance.contentGapInner`]: 87,
  };

  if (APPEARANCE_ONLY) {
    if (DRY) {
      console.log(`dry-run ${docId}: appearance-only bg=${POPUP_BG}`);
      return;
    }
    await client.patch(docId).set(appearancePatch).commit();
    console.log(`✓ ${docId}: Census CE popup appearance (bg ${POPUP_BG})`);
    return;
  }

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

  const popupTabs = [
    {
      _key: key(),
      _type: "deviceTab" as const,
      label: "Flow screens",
      items,
    },
  ];

  const patch = {
    [`sections[${idx}].popupTitle`]: "Core Experience Flow",
    [`sections[${idx}].popupBody`]: popupBody,
    [`sections[${idx}].popupTabs`]: popupTabs,
    [`sections[${idx}].popupItemsBeforeViewMore`]: 8,
    [`sections[${idx}].popupLoadMoreLabel`]: "Load More",
    [`sections[${idx}].viewMoreLabel`]: "View More",
    ...appearancePatch,
  };

  if (DRY) {
    console.log(`dry-run ${docId}: popupTabs=1 items=${items.length}`);
    return;
  }

  await client.patch(docId).set(patch).unset([`sections[${idx}].popupScreens`]).commit();
  console.log(`✓ ${docId}: Census CE popup (${items.length} tiles)`);
}

async function main() {
  const docId = await client.fetch<string>(
    `*[_type == "caseStudy" && slug.current == $slug][0]._id`,
    { slug: SLUG },
  );
  if (!docId) throw new Error(`no case study: ${SLUG}`);

  const doc = await client.fetch<{ sections: { _type: string }[] }>(
    `*[_id == $id][0]{ sections[]{ _type } }`,
    { id: docId },
  );
  const idx = doc.sections.findIndex((s) => s._type === "coreExperience");
  if (idx < 0) throw new Error("no coreExperience section");

  await patchDoc(docId, idx);

  const draftId = `drafts.${docId}`;
  const draft = await client.fetch<{ sections?: unknown[] } | null>(
    `*[_id == $id][0]{ sections }`,
    { id: draftId },
  );
  if (draft?.sections && !DRY) {
    await patchDoc(draftId, idx);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
