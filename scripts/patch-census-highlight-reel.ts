/**
 * US Census §10 Project Highlights — scatter collage boards (Figma 3999:53562 / 3999:55917).
 *
 * Inserts or updates highlightReel after Impact, before Reflection.
 * Navy band #436997, desktop + mobile composite boards.
 *
 * PNG source: public/work/2020-us-census-benefit-calculator/highlights/
 *   01-desktop-board.png — collage 3999:61875 @2×
 *   02-mobile-board.png  — collage 4001:72386 @2×
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-census-highlight-reel.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-census-highlight-reel.ts --with-user-token
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const APPEARANCE_ONLY = process.argv.includes("--appearance-only");
const MOBILE_ONLY = process.argv.includes("--mobile-only");
const SLUG = "2020-us-census-benefit-calculator";
const ASSET_DIR = join(
  process.cwd(),
  "public/work/2020-us-census-benefit-calculator/highlights",
);

/** Figma band fill on 3999:53562 */
const BAND_BG = "#436997";
const TEXT = "#ffffff";
/** Figma 3999:61875 width */
const COMPOSITE_MAX_WIDTH = 1237;

const BOARDS = {
  desktop: join(ASSET_DIR, "01-desktop-board.png"),
  mobile: join(ASSET_DIR, "02-mobile-board.png"),
} as const;

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

type Section = Record<string, unknown> & { _key: string; _type: string };

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

function buildSection(
  compositeImage: unknown,
  compositeImageMobile: unknown,
  existing?: Section,
): Section {
  return {
    ...(existing ?? {}),
    _type: "highlightReel",
    _key: existing?._key ?? key(),
    sectionTitle: "Project Highlights",
    layout: "composite",
    compositeImage,
    compositeImageMobile,
    compositeMaxWidth: COMPOSITE_MAX_WIDTH,
    appearance: {
      _type: "appearance",
      backgroundColor: sanityColor(BAND_BG),
      textColor: sanityColor(TEXT),
    },
  };
}

async function main() {
  for (const file of Object.values(BOARDS)) {
    if (!existsSync(file)) {
      throw new Error(`Missing ${file} — export Figma highlight boards first`);
    }
  }

  const doc: { _id: string; sections: Section[] } = await client.fetch(
    `*[_type == "caseStudy" && slug.current == $slug][0]{ _id, sections }`,
    { slug: SLUG },
  );
  if (!doc?._id) throw new Error(`case study not found: ${SLUG}`);

  const before = doc.sections ?? [];
  const statsIdx = before.findIndex((s) => s._type === "statsSection");
  const highlightIdx = before.findIndex((s) => s._type === "highlightReel");
  const reflectionIdx = before.findIndex((s) => s._type === "reflectionSection");

  console.log(`${SLUG} — Project Highlights (Figma 3999:53562 / 3999:55917)`);
  if (highlightIdx >= 0) {
    console.log(`  update highlightReel[${highlightIdx}]`);
  } else {
    const insertAfter =
      statsIdx >= 0
        ? statsIdx
        : reflectionIdx >= 0
          ? reflectionIdx - 1
          : before.length - 1;
    console.log(
      `  insert highlightReel after sections[${insertAfter}] (${before[insertAfter]?._type ?? "end"})`,
    );
  }

  if (DRY) {
    console.log("(dry run — nothing written)");
    return;
  }

  let sections: Section[];

  if (highlightIdx >= 0 && APPEARANCE_ONLY) {
    sections = before.map((s, i) =>
      i === highlightIdx
        ? {
            ...s,
            appearance: {
              _type: "appearance",
              backgroundColor: sanityColor(BAND_BG),
              textColor: sanityColor(TEXT),
            },
          }
        : s,
    );
  } else if (highlightIdx >= 0 && MOBILE_ONLY) {
    const compositeImageMobile = await uploadImage(BOARDS.mobile);
    sections = before.map((s, i) =>
      i === highlightIdx ? { ...s, compositeImageMobile } : s,
    );
  } else {
    const compositeImage = await uploadImage(BOARDS.desktop);
    const compositeImageMobile = await uploadImage(BOARDS.mobile);

    if (highlightIdx >= 0) {
      sections = before.map((s, i) =>
        i === highlightIdx
          ? buildSection(compositeImage, compositeImageMobile, s)
          : s,
      );
    } else {
      const insertAt =
        statsIdx >= 0
          ? statsIdx + 1
          : reflectionIdx >= 0
            ? reflectionIdx
            : before.length;
      sections = [
        ...before.slice(0, insertAt),
        buildSection(compositeImage, compositeImageMobile),
        ...before.slice(insertAt),
      ];
    }
  }

  await client.patch(doc._id).set({ sections }).commit();
  console.log(
    `✓ ${SLUG}: Project Highlights — ${before.length} → ${sections.length} section(s)`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
