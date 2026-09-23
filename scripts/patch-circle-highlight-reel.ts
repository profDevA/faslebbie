/**
 * Circle §10 Project Highlights — composite card (desktop 4171:50138 / mobile 4171:38511).
 *
 * One framed plate (white rounded stroke + caption baked in). Layout `composite`
 * so the site does not add a second matte or crop to the 887×503 single-card ratio.
 *
 * Plate: public/work/circle/highlights/01-bar.png (Figma 4171:50143 @2×).
 * Band #232323 (sampled). Title “Project Highlights” (mobile 4171:38558).
 * Desktop text node 4171:50140 reads “The Idea in One Line” (layer name
 * “Emotional Browsing”) — leftover concept heading, not the section title.
 *
 * Inserts or updates highlightReel after Impact, before Reflection.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-circle-highlight-reel.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-circle-highlight-reel.ts --with-user-token
 *   npx sanity exec scripts/patch-circle-highlight-reel.ts --with-user-token -- --appearance-only
 *
 * Do not re-run full patch after manual Studio uploads.
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const APPEARANCE_ONLY = process.argv.includes("--appearance-only");
const SLUG = "circle";
const BOARD_FILE = join(process.cwd(), "public/work/circle/highlights/01-bar.png");

/** Sampled from Figma 4171:50138 and 4171:38511. */
const BAND_BG = "#232323";
const TEXT = "#ffffff";
/** Figma card ~1180px on the 1449 artboard. */
const COMPOSITE_MAX_WIDTH = 1180;

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

type Section = Record<string, unknown> & { _key: string; _type: string };

async function uploadBoard() {
  if (!existsSync(BOARD_FILE)) {
    throw new Error(`Missing ${BOARD_FILE} — export Figma 4171:50143 first`);
  }
  const asset = await client.assets.upload("image", createReadStream(BOARD_FILE), {
    filename: basename(BOARD_FILE),
    contentType: "image/png",
  });
  console.log(`  ↑ highlights board → ${asset._id}`);
  return {
    _type: "image" as const,
    asset: { _type: "reference" as const, _ref: asset._id },
  };
}

function buildSection(compositeImage: unknown, existing?: Section): Section {
  const { cells: _cells, compositeImageMobile: _mobile, ...rest } = existing ?? {};
  return {
    ...rest,
    _type: "highlightReel",
    _key: existing?._key ?? key(),
    sectionTitle: "Project Highlights",
    layout: "composite",
    compositeImage,
    compositeMaxWidth: COMPOSITE_MAX_WIDTH,
    appearance: {
      _type: "appearance",
      backgroundColor: sanityColor(BAND_BG),
      textColor: sanityColor(TEXT),
    },
  };
}

async function main() {
  const doc: { _id: string; sections: Section[] } = await client.fetch(
    `*[_type == "caseStudy" && slug.current == $slug][0]{ _id, sections }`,
    { slug: SLUG },
  );
  if (!doc?._id) throw new Error(`case study not found: ${SLUG}`);

  const before = doc.sections ?? [];
  const statsIdx = before.findIndex((s) => s._type === "statsSection");
  const highlightIdx = before.findIndex((s) => s._type === "highlightReel");
  const reflectionIdx = before.findIndex((s) => s._type === "reflectionSection");

  console.log(`${SLUG} — Project Highlights (Figma 4171:50138 / 4171:38511)`);
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

  if (APPEARANCE_ONLY) {
    if (highlightIdx < 0) throw new Error("no highlightReel to patch appearance");
    if (DRY) {
      console.log("(dry run — appearance only)");
      return;
    }
    await client
      .patch(doc._id)
      .set({
        [`sections[${highlightIdx}].appearance`]: buildSection({}, before[highlightIdx])
          .appearance,
        [`sections[${highlightIdx}].compositeMaxWidth`]: COMPOSITE_MAX_WIDTH,
        [`sections[${highlightIdx}].sectionTitle`]: "Project Highlights",
        [`sections[${highlightIdx}].layout`]: "composite",
      })
      .commit();
    console.log(`✓ ${SLUG}: highlightReel appearance → ${BAND_BG}`);
    return;
  }

  if (DRY) {
    console.log("(dry run — nothing written)");
    return;
  }

  const compositeImage = await uploadBoard();
  let sections: Section[];

  if (highlightIdx >= 0) {
    sections = before.map((s, i) =>
      i === highlightIdx ? buildSection(compositeImage, s) : s,
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
      buildSection(compositeImage),
      ...before.slice(insertAt),
    ];
  }

  await client.patch(doc._id).set({ sections }).commit();
  console.log(
    `✓ ${SLUG}: Project Highlights composite · ${BAND_BG} · ${before.length} → ${sections.length} section(s)`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
