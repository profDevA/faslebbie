/**
 * US Census §04 — Core Experience Flow band (Figma 3999:59093 desktop / 3999:54903 mobile).
 *
 * Four condensed tiles — 2×2 staggered grid on desktop, same four stacked on mobile.
 * View More popup (8 screens): patch-census-core-experience-popup.ts.
 *
 * PNG source: public/work/2020-us-census-benefit-calculator/core-flow/01–04-*
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-census-core-experience.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-census-core-experience.ts --with-user-token
 *
 * **Manual images:** Replace in Studio if MCP exports are off. Do not re-run after manual uploads.
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import sharp from "sharp";
import { getCliClient } from "sanity/cli";

import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const SLUG = "2020-us-census-benefit-calculator";
const FLOW_DIR = join(
  process.cwd(),
  "public/work/2020-us-census-benefit-calculator/core-flow",
);

/** Figma 3999:59093 band background. */
const BAND_BG = "#384e73";

/** Band tiles — desktop grid + mobile stack (Figma 3999:54903). */
const PREVIEW = [
  {
    file: "01-location-discovery.png",
    figma: "3999:59099",
    label: "Location-Based Discovery:",
    description:
      "Enter your ZIP code to uncover benefits available in your local community.",
  },
  {
    file: "02-personalized-profile.png",
    figma: "3999:59152",
    label: "Personalized Profile:",
    description:
      "Review household information before generating tailored programme matches.",
  },
  {
    file: "03-programme-matches.png",
    figma: "3999:59232",
    label: "Programme Matches:",
    description:
      "Discover personalized government benefits based on your household information.",
  },
  {
    file: "04-programme-details.png",
    figma: "3999:59361",
    label: "Programme Details:",
    description:
      "Explore eligibility, required documents, benefits and application guidance.",
  },
] as const;

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

async function uploadImage(absPath: string) {
  const asset = await client.assets.upload("image", createReadStream(absPath), {
    filename: basename(absPath),
    contentType: "image/png",
  });
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

async function patchDoc(docId: string, idx: number) {
  const previewScreens = await buildScreens();

  const patch = {
    [`sections[${idx}].sectionTitle`]: "Core Experience Flow",
    [`sections[${idx}].body`]: [],
    [`sections[${idx}].layoutVariant`]: "desktopGrid",
    [`sections[${idx}].previewColumns`]: 2,
    [`sections[${idx}].previewRowStagger`]: 145,
    [`sections[${idx}].previewScreens`]: previewScreens,
    [`sections[${idx}].viewMoreLabel`]: "View More",
    [`sections[${idx}].appearance.backgroundColor`]: sanityColor(BAND_BG),
    [`sections[${idx}].appearance.textColor`]: sanityColor("#e3e3db"),
    [`sections[${idx}].appearance.contentAlignment`]: "center",
    [`sections[${idx}].previewAppearance.tileBackgroundColor`]:
      sanityColor("#ffffff"),
    [`sections[${idx}].previewAppearance.contentGap`]: 43,
    [`sections[${idx}].previewAppearance.contentGapInner`]: 116,
  };

  if (DRY) {
    console.log(`dry-run ${docId}: preview=${previewScreens.length}, unset mobilePreviewScreens`);
    return;
  }

  await client
    .patch(docId)
    .set(patch)
    .unset([`sections[${idx}].mobilePreviewScreens`])
    .commit();
  console.log(`✓ ${docId}: Census CE band (${previewScreens.length} tiles, ${BAND_BG})`);
}

async function main() {
  console.log(`${SLUG} — Core Experience Flow (Figma 3999:59093 / 3999:54903)`);

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
