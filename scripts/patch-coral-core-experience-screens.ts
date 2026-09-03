/**
 * Coral §04 — per-screen tiles for Core Experience Flow (Figma 2110:39499).
 *
 * Uploads PNGs from public/work/coral-health/core-flow/*.png and sets Figma copy.
 * Keeps legacy `image` as fallback until previewScreens is populated.
 *
 * Expected files (Figma phone frames @4×, same 645×1482 box, no band bleed):
 *   01-personalized-care.png
 *   02-health-results.png
 *   03-at-home-testing.png
 *   04-in-home-care.png
 *   05-virtual-consultation.png
 *
 * Band tiles only — does not replace View More popup tabs.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-coral-core-experience-screens.ts --with-user-token
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const SLUG = "coral-health";
const PUBLIC = join(process.cwd(), "public");
const FLOW_DIR = join(PUBLIC, "work/coral-health/core-flow");
const BAND_BG = "#52747e";
const TILE_W = 645;
const TILE_H = 1482;

const PREVIEW = [
  {
    file: "01-personalized-care.png",
    label: "Personalized Care:",
    description: "Recommended actions, all in one place",
  },
  {
    file: "02-health-results.png",
    label: "Health Results:",
    description: "Clear guidance from screening to next step",
  },
  {
    file: "03-at-home-testing.png",
    label: "At-Home Testing:",
    description: "Screening designed around your schedule",
  },
  {
    file: "04-in-home-care.png",
    label: "In-Home Care:",
    description: "Book professional support when you need it",
  },
  {
    file: "05-virtual-consultation.png",
    label: "Virtual Consultation:",
    description: "Connect directly with your care team",
  },
] as const;

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

function sanityColor(hex: string, alpha = 1) {
  return { _type: "color" as const, hex, alpha };
}

async function uploadImage(relPath: string) {
  const abs = join(PUBLIC, relPath.replace(/^\//, ""));
  if (!existsSync(abs)) return null;
  const asset = await client.assets.upload("image", createReadStream(abs), {
    filename: basename(abs),
  });
  return { _type: "image" as const, asset: { _type: "reference" as const, _ref: asset._id } };
}

async function main() {
  const docs = await client.fetch<{ _id: string; sections: { _key: string; _type: string }[] }[]>(
    `*[_type == "caseStudy" && slug.current == $slug]{ _id, "sections": sections[]{ _key, _type } }`,
    { slug: SLUG },
  );
  if (!docs.length) throw new Error(`no case study: ${SLUG}`);

  const previewScreens: {
    _key: string;
    _type: "coreExperienceScreen";
    image: NonNullable<Awaited<ReturnType<typeof uploadImage>>>;
    label: string;
    description: string;
    imageWidth: number;
    imageHeight: number;
  }[] = [];

  for (const row of PREVIEW) {
    const rel = `work/coral-health/core-flow/${row.file}`;
    const image = await uploadImage(rel);
    if (!image) {
      console.warn(`! missing ${join(FLOW_DIR, row.file)}`);
      continue;
    }
    previewScreens.push({
      _key: key(),
      _type: "coreExperienceScreen",
      image,
      label: row.label,
      description: row.description,
      imageWidth: TILE_W,
      imageHeight: TILE_H,
    });
  }

  if (!previewScreens.length) {
    console.error(
      "No preview PNGs found. Add files under public/work/coral-health/core-flow/ then re-run.",
    );
    process.exit(1);
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
      `✓ ${doc._id}: previewScreens=${previewScreens.length} ${TILE_W}x${TILE_H} (popup tabs unchanged)`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
