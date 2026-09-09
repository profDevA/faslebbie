/**
 * Financial Data Exchange §04 — per-screen Core Experience band (Figma 3737:89837).
 *
 * Replaces legacy single combined `image` with five phone tiles + Figma captions.
 * mobileRow layout (Coral-style horizontal strip). Does not touch popup tabs.
 *
 * PNG source: public/work/financial-data-exchange/core-flow/01–05-*.png
 * (Figma phone frames 3737:89845, 89896, 89948, 90008, 90062 @4×).
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-fdx-core-experience.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-fdx-core-experience.ts --with-user-token
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import sharp from "sharp";
import { getCliClient } from "sanity/cli";

import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const SLUG = "financial-data-exchange";
const FLOW_DIR = join(process.cwd(), "public/work/financial-data-exchange/core-flow");

/** Figma 3737:89837 band background. */
const BAND_BG = "#33ab9f";

const PREVIEW = [
  {
    file: "01-understand-the-process.png",
    label: "Understand the Process:",
    description: "Learn how your bank account will be connected.",
  },
  {
    file: "02-review-data-permissions.png",
    label: "Review Data Permissions:",
    description: "See what information will be accessed and shared.",
  },
  {
    file: "03-choose-financial-institution.png",
    label: "Choose a Financial Institution:",
    description: "Select an available banking app or find another institution.",
  },
  {
    file: "04-select-accounts.png",
    label: "Select Accounts:",
    description: "Choose which individual accounts can be connected and shared.",
  },
  {
    file: "05-connection-confirmed.png",
    label: "Connection Confirmed:",
    description:
      "Receive clear confirmation that the selected bank account has been securely linked.",
  },
] as const;

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

async function uploadImage(absPath: string) {
  const asset = await client.assets.upload("image", createReadStream(absPath), {
    filename: basename(absPath),
    contentType: "image/png",
  });
  return { _type: "image" as const, asset: { _type: "reference" as const, _ref: asset._id } };
}

async function main() {
  const docs = await client.fetch<{ _id: string; sections: { _key: string; _type: string }[] }[]>(
    `*[_type == "caseStudy" && slug.current == $slug]{ _id, sections[]{ _key, _type } }`,
    { slug: SLUG },
  );
  if (!docs.length) throw new Error(`no case study: ${SLUG}`);

  const previewScreens = [];
  for (const row of PREVIEW) {
    const abs = join(FLOW_DIR, row.file);
    if (!existsSync(abs)) throw new Error(`missing ${abs}`);
    const meta = await sharp(abs).metadata();
    const imageWidth = meta.width ?? 0;
    const imageHeight = meta.height ?? 0;
    console.log(`  ↑ ${row.file} ${imageWidth}x${imageHeight}`);
    if (!DRY) {
      previewScreens.push({
        _key: key(),
        _type: "coreExperienceScreen" as const,
        image: await uploadImage(abs),
        label: row.label,
        description: row.description,
        imageWidth,
        imageHeight,
      });
    }
  }

  if (DRY) {
    console.log(`(dry run — would patch ${previewScreens.length || PREVIEW.length} preview screen(s))`);
    return;
  }

  for (const doc of docs) {
    const idx = doc.sections.findIndex((s) => s._type === "coreExperience");
    if (idx < 0) {
      console.log(`skip ${doc._id}: no coreExperience`);
      continue;
    }
    const patch = client.patch(doc._id);
    patch.set({
      [`sections[${idx}].sectionTitle`]: "Core Experience Flow",
      [`sections[${idx}].layoutVariant`]: "mobileRow",
      [`sections[${idx}].previewScreens`]: previewScreens,
      [`sections[${idx}].appearance.backgroundColor`]: sanityColor(BAND_BG),
      [`sections[${idx}].appearance.textColor`]: sanityColor("#ffffff"),
      [`sections[${idx}].previewAppearance.tileBackgroundColor`]: sanityColor(BAND_BG),
    });
    patch.unset([
      `sections[${idx}].image`,
      `sections[${idx}].imageMobile`,
    ]);
    await patch.commit();
    console.log(
      `✓ ${doc._id}: previewScreens=${previewScreens.length}, legacy image unset`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
