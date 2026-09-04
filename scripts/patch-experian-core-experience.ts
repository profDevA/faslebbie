/**
 * Experian Boost — Core Experience Flow band tiles only.
 *
 * Israel's Figma frames PNG @4× (3860:6648 / 6647 / 6646 / 6203 / 6250).
 * No crop / resize — bytes are the Figma export of those nodes.
 *
 * View More / modal: Israel is still designing it. Leave popup fields empty
 * so the button stays hidden. Do not restore the old WP Design Interventions
 * popup. When the modal assets land, set Studio popupTabs (Coral-style) —
 * the frontend shows View More as soon as tabs or popupBody have content.
 *
 * PNG source: public/work/experian-boost/core-flow/
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-experian-core-experience.ts --with-user-token
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import sharp from "sharp";
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

const SLUG = "experian-boost";
const PUBLIC = join(process.cwd(), "public");
const FLOW_DIR = join(PUBLIC, "work/experian-boost/core-flow");
const BAND_BG = "#33356e";

const PREVIEW = [
  {
    file: "01-credit-starting-point.png",
    label: "Credit Starting Point:",
    description: "Understand your score and the opportunity to improve it",
  },
  {
    file: "02-connect-account.png",
    label: "Connect Account:",
    description: "Securely connect the accounts used to pay bills",
  },
  {
    file: "03-find-eligible-payments.png",
    label: "Find Eligible Payments:",
    description: "Identify recurring bills that may qualify for Boost",
  },
  {
    file: "04-calculate-the-boost.png",
    label: "Calculate the Boost:",
    description: "Turn verified payment history into potential score impact",
  },
  {
    file: "05-see-the-impact.png",
    label: "See the Impact:",
    description: "how the potential FICO® Score improvement clearly",
  },
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
  const docs = await client.fetch<{ _id: string; sections: { _key: string; _type: string }[] }[]>(
    `*[_type == "caseStudy" && slug.current == $slug]{ _id, "sections": sections[]{ _key, _type } }`,
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
    console.log(`↑ band ${row.file} ${imageWidth}x${imageHeight}`);
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

  for (const doc of docs) {
    const idx = doc.sections.findIndex((s) => s._type === "coreExperience");
    if (idx < 0) {
      console.log(`skip ${doc._id}: no coreExperience`);
      continue;
    }
    await client
      .patch(doc._id)
      .set({
        [`sections[${idx}].previewScreens`]: previewScreens,
        [`sections[${idx}].appearance.textColor`]: sanityColor("#ffffff"),
        [`sections[${idx}].previewAppearance.tileBackgroundColor`]: sanityColor(BAND_BG),
      })
      .commit();
    console.log(
      `✓ ${doc._id}: previewScreens=${previewScreens.length} (uncropped Figma export, popup unchanged)`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
