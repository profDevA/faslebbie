/**
 * Diamond Valuation AI §04 Core Experience Flow (Figma 4002:83429).
 *
 * Five phone tiles in mobileRow strip + Figma captions. Replaces legacy single
 * `image` composite. View More label is stored for when popup frames exist —
 * button stays hidden until `popupTabs` or `popupBody` is authored (Experian pattern).
 *
 * PNG source: public/work/diamond-valuation-ai/core-flow/01–05-*.png
 *   01 — 4002:83437 Valuation Method
 *   02 — 4002:83526 Guided Scanning
 *   03 — 4002:83601 Scan Completion
 *   04 — 4002:83683 AI Analysis
 *   05 — 4002:83737 Valuation Result
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-diamond-valuation-core-experience.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-diamond-valuation-core-experience.ts --with-user-token
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
const SLUG = "diamond-valuation-ai";
const PUB_ID = "cs-diamond-valuation-ai";
const FLOW_DIR = join(process.cwd(), "public/work/diamond-valuation-ai/core-flow");

/** Figma 4002:83429 band fill */
const BAND_BG = "#999999";
/** Figma 4002:83431 / captions — dark on gray */
const TEXT = "#171717";

const PREVIEW = [
  {
    file: "01-valuation-method.png",
    figma: "4002:83437",
    label: "Valuation Method:",
    description: "Choose how you want to scan",
  },
  {
    file: "02-guided-scanning.png",
    figma: "4002:83526",
    label: "Guided Scanning:",
    description: "Position your diamond for accurate image capture",
  },
  {
    file: "03-scan-completion.png",
    figma: "4002:83601",
    label: "Scan Completion:",
    description: "Review all required diamond views",
  },
  {
    file: "04-ai-analysis.png",
    figma: "4002:83683",
    label: "AI Analysis:",
    description: "Track your diamond valuation in real time",
  },
  {
    file: "05-valuation-result.png",
    figma: "4002:83737",
    label: "Valuation Result:",
    description: "Review your diamond's estimated market value",
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
    console.log(`${DRY ? "○" : "↑"} ${row.file} (${row.figma}) ${imageWidth}x${imageHeight}`);
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

function ceIdx(sections: { _type: string }[]) {
  return sections.findIndex((s) => s._type === "coreExperience");
}

async function patchDoc(docId: string, idx: number, previewScreens: unknown[]) {
  const patch = client.patch(docId).set({
    [`sections[${idx}].sectionTitle`]: "Core Experience Flow",
    [`sections[${idx}].body`]: [],
    [`sections[${idx}].layoutVariant`]: "mobileRow",
    [`sections[${idx}].previewScreens`]: previewScreens,
    [`sections[${idx}].viewMoreLabel`]: "View More",
    [`sections[${idx}].appearance.backgroundColor`]: sanityColor(BAND_BG),
    [`sections[${idx}].appearance.textColor`]: sanityColor(TEXT),
    [`sections[${idx}].appearance.contentAlignment`]: "center",
    [`sections[${idx}].previewAppearance.tileBackgroundColor`]: sanityColor(BAND_BG),
    [`sections[${idx}].previewAppearance.contentGap`]: 40,
  });
  patch.unset([
    `sections[${idx}].image`,
    `sections[${idx}].imageMobile`,
    `sections[${idx}].popupTabs`,
    `sections[${idx}].popupBody`,
    /** Full-frame PNGs include device radius — do not clip with Figma frame px. */
    `sections[${idx}].previewAppearance.tileBorderRadius`,
  ]);
  if (!DRY) await patch.commit();
}

async function main() {
  console.log(
    `patch-diamond-valuation-core-experience (${DRY ? "dry" : APPEARANCE_ONLY ? "appearance-only" : "live"})`,
  );

  const pub = await client.fetch<{ sections: { _type: string; _key: string }[] }>(
    `*[_id == $id][0]{ sections[]{ _type, _key } }`,
    { id: PUB_ID },
  );
  if (!pub?.sections?.length) throw new Error(`Missing ${PUB_ID}`);

  const idx = ceIdx(pub.sections);
  if (idx < 0) throw new Error("No coreExperience section");

  if (APPEARANCE_ONLY) {
    const appearancePatch = {
      [`sections[${idx}].previewAppearance.tileBackgroundColor`]: sanityColor(BAND_BG),
    };
    const appearanceUnset = [`sections[${idx}].previewAppearance.tileBorderRadius`];
    if (!DRY) {
      await client.patch(PUB_ID).set(appearancePatch).unset(appearanceUnset).commit();
      const draftId = `drafts.${PUB_ID}`;
      if (await client.getDocument(draftId)) {
        await client.patch(draftId).set(appearancePatch).unset(appearanceUnset).commit();
      }
    }
    console.log("✓ tileBorderRadius unset (full-frame PNGs — no wrapper clip)");
    return;
  }

  const previewScreens = await buildScreens();
  console.log(`→ patch ${PUB_ID} sections[${idx}] (${previewScreens.length} screens)`);
  await patchDoc(PUB_ID, idx, previewScreens);

  const draftId = `drafts.${PUB_ID}`;
  if (await client.getDocument(draftId)) {
    console.log(`→ sync ${draftId}`);
    await patchDoc(draftId, idx, previewScreens);
  }

  if (DRY) {
    console.log("(dry run — no writes)");
    return;
  }

  console.log("✓ core experience band patched (View More hidden until popup content)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
