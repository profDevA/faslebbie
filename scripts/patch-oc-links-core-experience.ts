/**
 * OC Links §04 Core Experience Flow band (Figma 4004:114080).
 *
 * Four desktop tiles — 2×2 staggered desktopGrid + mobile stack (Census / AR Handbook).
 * View More popup: patch-oc-links-core-experience-popup.ts (Figma 4151:34943).
 *
 * PNG source: public/work/oc-links/core-flow/01–04-*
 *   01 — 4004:115525 Contact Information
 *   02 — 4004:115523 Crisis Assessment
 *   03 — 4004:115522 Needs Assessment
 *   04 — 4004:115524 Resource Matching
 *
 * Captions from Figma 4004:114384 / 114385 / 114725 / 114726 (not WP legacy).
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-oc-links-core-experience.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-oc-links-core-experience.ts --with-user-token
 *   npx sanity exec scripts/patch-oc-links-core-experience.ts --with-user-token -- --appearance-only
 *
 * Does not write popup tabs. Do not re-run after manual Studio image uploads.
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
const SLUG = "oc-links";
const PUB_ID = "cs-oc-links";
const FLOW_DIR = join(process.cwd(), "public/work/oc-links/core-flow");

/** Figma 4004:114080 band fill (sampled). */
const BAND_BG = "#384e73";
const TEXT = "#e3e3db";

const PREVIEW = [
  {
    file: "01-contact-information.png",
    figma: "4004:115525",
    label: "Contact Information:",
    description: "Capture essential caller details to begin a new case.",
  },
  {
    file: "02-crisis-assessment.png",
    figma: "4004:115523",
    label: "Crisis Assessment:",
    description:
      "Identify immediate risks and determine the appropriate level of response.",
  },
  {
    file: "03-needs-assessment.png",
    figma: "4004:115522",
    label: "Needs Assessment:",
    description:
      "Identify the caller’s needs and select the issues requiring support.",
  },
  {
    file: "04-resource-matching.png",
    figma: "4004:115524",
    label: "Resource Matching:",
    description:
      "Review relevant services and connect the caller with appropriate support.",
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
    [`sections[${idx}].previewAppearance.tileBackgroundColor`]:
      sanityColor(BAND_BG),
    [`sections[${idx}].previewAppearance.contentGap`]: 56,
    [`sections[${idx}].previewAppearance.contentGapInner`]: 115,
  };
}

function ceIdx(sections: { _type: string }[]) {
  return sections.findIndex((s) => s._type === "coreExperience");
}

async function patchDoc(docId: string, idx: number) {
  if (APPEARANCE_ONLY) {
    if (DRY) {
      console.log(`dry-run ${docId}: appearance-only bg=${BAND_BG}`);
      return;
    }
    await client
      .patch(docId)
      .set(appearancePatch(idx))
      .unset([`sections[${idx}].previewAppearance.tileBorderRadius`])
      .commit();
    console.log(`✓ ${docId}: OC Links CE band appearance`);
    return;
  }

  const previewScreens = await buildScreens();
  const patch = {
    ...appearancePatch(idx),
    [`sections[${idx}].body`]: [],
    [`sections[${idx}].previewScreens`]: previewScreens,
  };

  if (DRY) {
    console.log(`dry-run ${docId}: preview=${previewScreens.length}, desktopGrid`);
    return;
  }

  await client
    .patch(docId)
    .set(patch)
    .unset([
      `sections[${idx}].image`,
      `sections[${idx}].imageMobile`,
      `sections[${idx}].mobilePreviewScreens`,
      `sections[${idx}].previewAppearance.tileBorderRadius`,
    ])
    .commit();
  console.log(`✓ ${docId}: OC Links CE band (${previewScreens.length} tiles, ${BAND_BG})`);
}

async function main() {
  console.log(
    `patch-oc-links-core-experience (${DRY ? "dry" : APPEARANCE_ONLY ? "appearance-only" : "live"})`,
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
