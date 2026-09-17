/**
 * The AR Handbook §04 Core Experience Flow (Figma 4152:122786).
 *
 * Four tablet tiles — 2×2 staggered desktopGrid + mobile stack (Census pattern).
 * View More popup — patch-ar-handbook-core-experience-popup-tabs.ts (Coral-style device tabs).
 *
 * PNG source: public/work/the-ar-handbook/core-flow/01–04-*.png
 *   01 — 4152:122791 Choose a Task
 *   02 — 4152:122792 AI Part Recognition (Classify)
 *   03 — 4152:122799 AI Part Recognition (Detect)
 *   04 — 4152:122800 Label & Train
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-ar-handbook-core-experience.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-ar-handbook-core-experience.ts --with-user-token
 *   npx sanity exec scripts/patch-ar-handbook-core-experience.ts --with-user-token -- --appearance-only
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import sharp from "sharp";
import { getCliClient } from "sanity/cli";

import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const APPEARANCE_ONLY = process.argv.includes("--appearance-only");
const SLUG = "the-ar-handbook";
const PUB_ID = "cs-remote-assistant-object-detection";
const FLOW_DIR = join(
  process.cwd(),
  "public/work/the-ar-handbook/core-flow",
);

/** Figma 4152:122786 band fill */
const BAND_BG = "#4c6060";
/** Figma 4152:122803 / captions */
const TEXT = "#e3e3db";

const PREVIEW = [
  {
    file: "01-choose-task.png",
    figma: "4152:122791",
    label: "Choose a Task:",
    description: "Select Classify or Detect to begin the appropriate field workflow.",
  },
  {
    file: "02-ai-part-recognition-classify.png",
    figma: "4152:122792",
    label: "AI Part Recognition:",
    description:
      "Scan equipment as the system identifies the part and surfaces its match confidence.",
  },
  {
    file: "03-ai-part-recognition-detect.png",
    figma: "4152:122799",
    label: "AI Part Recognition:",
    description:
      "Scan equipment as the system identifies the part and surfaces its match confidence.",
  },
  {
    file: "04-label-and-train.png",
    figma: "4152:122800",
    label: "Label & Train:",
    description:
      "Confirm or correct the part label to add verified training data to the recognition model.",
  },
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

async function buildScreens() {
  const screens = [];
  for (const row of PREVIEW) {
    const abs = join(FLOW_DIR, row.file);
    if (!existsSync(abs)) throw new Error(`Missing ${abs}`);
    const meta = await sharp(abs).metadata();
    const imageWidth = meta.width ?? 0;
    const imageHeight = meta.height ?? 0;
    console.log(
      `${DRY ? "○" : "↑"} ${row.file} (${row.figma}) ${imageWidth}x${imageHeight}`,
    );
    screens.push({
      _key: key(),
      _type: "coreExperienceScreen" as const,
      image: DRY
        ? { _type: "image", asset: { _type: "reference", _ref: "dry-run" } }
        : await uploadImage(abs),
      label: row.label,
      description: row.description,
      imageWidth,
      imageHeight,
    });
  }
  return screens;
}

function appearancePatch(idx: number) {
  return {
    [`sections[${idx}].sectionTitle`]: "Core Experience Flow",
    [`sections[${idx}].layoutVariant`]: "desktopGrid",
    [`sections[${idx}].previewColumns`]: 2,
    [`sections[${idx}].previewRowStagger`]: 191,
    [`sections[${idx}].viewMoreLabel`]: "View More",
    [`sections[${idx}].appearance.backgroundColor`]: sanityColor(BAND_BG),
    [`sections[${idx}].appearance.textColor`]: sanityColor(TEXT),
    [`sections[${idx}].appearance.contentAlignment`]: "center",
    /** Match band — full-frame PNGs have transparent rounded corners (9/14 Israel call). */
    [`sections[${idx}].previewAppearance.tileBackgroundColor`]:
      sanityColor(BAND_BG),
    [`sections[${idx}].previewAppearance.contentGap`]: 56,
    [`sections[${idx}].previewAppearance.contentGapInner`]: 115,
  };
}

function findCeIndex(sections: { _type: string }[]) {
  return sections.findIndex((s) => s._type === "coreExperience");
}

async function main() {
  const doc = await client.fetch<{ _id: string; sections: { _type: string }[] }>(
    `*[_type == "caseStudy" && slug.current == $slug][0]{ _id, sections[]{ _type } }`,
    { slug: SLUG },
  );
  if (!doc) throw new Error(`no case study: ${SLUG}`);

  const idx = findCeIndex(doc.sections);
  if (idx < 0) throw new Error("no coreExperience section");

  const ids = [doc._id];
  const draftId = `drafts.${PUB_ID}`;
  if (await client.getDocument(draftId)) ids.push(draftId);

  console.log(
    `patch-ar-handbook-core-experience (${DRY ? "dry" : APPEARANCE_ONLY ? "appearance-only" : "live"})`,
  );

  for (const id of ids) {
    if (APPEARANCE_ONLY) {
      console.log(`→ ${id}: band ${BAND_BG}, tile bg = band, no tileBorderRadius`);
      if (!DRY) {
        await client
          .patch(id)
          .set(appearancePatch(idx))
          .unset([`sections[${idx}].previewAppearance.tileBorderRadius`])
          .commit();
      }
      continue;
    }

    const previewScreens = await buildScreens();
    const patch = {
      ...appearancePatch(idx),
      [`sections[${idx}].body`]: [],
      [`sections[${idx}].previewScreens`]: previewScreens,
    };

    console.log(`→ ${id}: desktopGrid ×4 (${BAND_BG})`);
    if (!DRY) {
      await client
        .patch(id)
        .set(patch)
        .unset([
          `sections[${idx}].image`,
          `sections[${idx}].imageMobile`,
          `sections[${idx}].mobilePreviewScreens`,
          `sections[${idx}].previewAppearance.tileBorderRadius`,
        ])
        .commit();
    }
  }

  console.log(`\n${DRY ? "(dry run) " : ""}${ids.length} doc(s) updated`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
