/**
 * Acme Lending — Core Experience **band** preview tiles (not View More popup).
 *
 * Figma band frames (2×2 grid, left→right top→bottom):
 *   3977:11414 — Find Financial Institution
 *   3977:11411 — Account Summary
 *   3977:11413 — Verifying Deposits
 *   3977:11412 — Verification Complete
 *
 * PNG source: public/work/acme-lending/band/01–04-*.png
 * View More popup: patch-acme-core-experience-popup.ts (Figma 3928:11154).
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-acme-core-experience.ts --with-user-token
 */
import { createReadStream } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import sharp from "sharp";
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const SLUG = "acme-lending";
const BAND_DIR = join(process.cwd(), "public/work/acme-lending/band");

const BAND_BG = "#254a65";

const PREVIEW = [
  {
    file: "01-find-financial-institution.png",
    figma: "3977:11414",
    label: "Find Financial Institution:",
    description: "Secure Connections: Connect trusted financial institutions.",
  },
  {
    file: "02-account-summary.png",
    figma: "3977:11411",
    label: "Account Summary:",
    description: "Review selected accounts before sharing.",
  },
  {
    file: "03-verifying-deposits.png",
    figma: "3977:11413",
    label: "Verifying Deposits:",
    description: "Automated Verification: Income verification happens instantly.",
  },
  {
    file: "04-verification-complete.png",
    figma: "3977:11412",
    label: "Verification Complete:",
    description: "Instant Approval: Verification completed with confidence.",
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

async function patchDoc(docId: string, idx: number) {
  const previewScreens = [];
  for (const row of PREVIEW) {
    const abs = join(BAND_DIR, row.file);
    const meta = await sharp(abs).metadata();
    const imageWidth = meta.width ?? 0;
    const imageHeight = meta.height ?? 0;
    console.log(
      `${DRY ? "○" : "↑"} band ${row.file} (${row.figma}) ${imageWidth}x${imageHeight}`,
    );
    previewScreens.push({
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

  const patch = {
    [`sections[${idx}].sectionTitle`]: "Core Experience Flow",
    [`sections[${idx}].body`]: [],
    [`sections[${idx}].layoutVariant`]: "desktopGrid",
    [`sections[${idx}].previewColumns`]: 2,
    [`sections[${idx}].previewRowStagger`]: 145,
    [`sections[${idx}].previewScreens`]: previewScreens,
    [`sections[${idx}].viewMoreLabel`]: "View More",
    [`sections[${idx}].appearance.backgroundColor`]: sanityColor(BAND_BG),
    [`sections[${idx}].appearance.textColor`]: sanityColor("#fafafa"),
    [`sections[${idx}].appearance.contentAlignment`]: "center",
    [`sections[${idx}].previewAppearance.tileBackgroundColor`]: sanityColor("#ffffff"),
    [`sections[${idx}].previewAppearance.contentGap`]: 43,
    [`sections[${idx}].previewAppearance.contentGapInner`]: 87,
  };

  if (DRY) {
    console.log(`dry-run ${docId}: band previewScreens=${previewScreens.length}`);
    return;
  }

  await client.patch(docId).set(patch).commit();
  console.log(`✓ ${docId}: Acme CE band (${previewScreens.length} tiles, ${BAND_BG})`);
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
