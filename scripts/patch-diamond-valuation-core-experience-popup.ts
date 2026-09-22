/**
 * Diamond Valuation AI §04 View More popup — 7-tile flow grid (Figma 4002:88683).
 *
 * Tiles @4× (Israel composites, grey #999):
 *   4151:24099 splash trio
 *   4151:24208 scan flow
 *   4151:24607 analysis + result
 *   4151:24717 discovery / supporting docs
 *   4151:24895 miner stories
 *   4151:25221 account / settings
 *   4151:25839 join ROOT
 *
 * Band previewScreens unchanged — patch-diamond-valuation-core-experience.ts.
 * Single popup tab (tab bar hidden). All 7 tiles visible (no Load More).
 *
 * PNG source: public/work/diamond-valuation-ai/core-flow/modal/
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-diamond-valuation-core-experience-popup.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-diamond-valuation-core-experience-popup.ts --with-user-token
 *   npx sanity exec scripts/patch-diamond-valuation-core-experience-popup.ts --with-user-token -- --appearance-only
 *
 * Do not re-run full patch after manual Studio image uploads.
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const APPEARANCE_ONLY = process.argv.includes("--appearance-only");
const SLUG = "diamond-valuation-ai";
const PUB_ID = "cs-diamond-valuation-ai";
const MODAL_DIR = join(
  process.cwd(),
  "public/work/diamond-valuation-ai/core-flow/modal",
);

/** Figma 4002:88683 page fill — cream card; tiles #999 match band. */
const POPUP_BG = "#e3e3db";
const POPUP_TILE_BG = "#999999";
const TEXT = "#171717";

const INTRO =
  "The core design intervention is Root Ally, a mobile experience for artisanal miners in Sierra Leone who have been systematically undervalued by centralized diamond markets. Professional tools like DiamondMaster and Sarine scanners demand gemological training, paid subscriptions, and stable internet most miners lack. Root Ally inverts that model: a guided six-angle smartphone scan and on-device AI return a market value in minutes, online or offline, so miners can negotiate without traveling to a trading center or trusting a middleman with the only price in the room.";

const GRID = [
  { file: "01-splash-trio.png", figma: "4151:24099" },
  { file: "02-scan-flow.png", figma: "4151:24208" },
  { file: "03-analysis-result.png", figma: "4151:24607" },
  { file: "04-discovery-forms.png", figma: "4151:24717" },
  { file: "05-miner-stories.png", figma: "4151:24895" },
  { file: "06-account-settings.png", figma: "4151:25221" },
  { file: "07-join-root.png", figma: "4151:25839" },
] as const;

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

async function uploadImage(absPath: string) {
  const asset = await client.assets.upload("image", createReadStream(absPath), {
    filename: basename(absPath),
    contentType: "image/png",
  });
  return { _type: "image" as const, asset: { _type: "reference" as const, _ref: asset._id } };
}

function ceIdx(sections: { _type: string }[]) {
  return sections.findIndex((s) => s._type === "coreExperience");
}

async function patchDoc(docId: string, idx: number) {
  const appearancePatch = {
    [`sections[${idx}].popupAppearance.backgroundColor`]: sanityColor(POPUP_BG),
    [`sections[${idx}].popupAppearance.textColor`]: sanityColor(TEXT),
    [`sections[${idx}].popupAppearance.contentAlignment`]: "left",
    [`sections[${idx}].popupAppearance.tileBackgroundColor`]: sanityColor(POPUP_TILE_BG),
    [`sections[${idx}].popupAppearance.contentGap`]: 43,
    [`sections[${idx}].popupAppearance.contentGapInner`]: 87,
  };

  if (APPEARANCE_ONLY) {
    if (DRY) {
      console.log(`dry-run ${docId}: appearance-only bg=${POPUP_BG} tile=${POPUP_TILE_BG}`);
      return;
    }
    await client.patch(docId).set(appearancePatch).commit();
    console.log(`✓ ${docId}: DVA CE popup appearance`);
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
    [`sections[${idx}].popupItemsBeforeViewMore`]: 7,
    [`sections[${idx}].popupLoadMoreLabel`]: "Load More",
    [`sections[${idx}].viewMoreLabel`]: "View More",
    ...appearancePatch,
  };

  if (DRY) {
    console.log(`dry-run ${docId}: popupTabs=1 items=${items.length}`);
    return;
  }

  await client.patch(docId).set(patch).unset([`sections[${idx}].popupScreens`]).commit();
  console.log(`✓ ${docId}: DVA CE popup (${items.length} tiles)`);
}

async function main() {
  console.log(
    `patch-diamond-valuation-core-experience-popup (${DRY ? "dry" : APPEARANCE_ONLY ? "appearance-only" : "live"})`,
  );

  const pub = await client.fetch<{ sections: { _type: string }[] } | null>(
    `*[_id == $id][0]{ sections[]{ _type } }`,
    { id: PUB_ID },
  );
  if (!pub?.sections?.length) throw new Error(`Missing ${PUB_ID}`);

  const idx = ceIdx(pub.sections);
  if (idx < 0) throw new Error("No coreExperience section");

  await patchDoc(PUB_ID, idx);

  const draftId = `drafts.${PUB_ID}`;
  if (await client.getDocument(draftId)) {
    console.log(`→ sync ${draftId}`);
    await patchDoc(draftId, idx);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
