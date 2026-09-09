/**
 * Acme Lending §10 Project Highlights — composite 2×2 board (Figma 3795:152883).
 *
 * Inserts or updates highlightReel after Impact (statsSection), before Reflection.
 * Blue band #3377a2, centred title, one pre-composited board (like Experian Boost).
 *
 * Board source: public/work/acme-lending/highlights-board.jpg
 * (export Figma frame 3795:152884 @2× or use the 2×2 grid composite).
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-acme-highlight-reel.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-acme-highlight-reel.ts --with-user-token
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const SLUG = "acme-lending";
const BOARD_FILE = join(
  process.cwd(),
  "public/work/acme-lending/highlights-board.jpg",
);

/** Figma 3795:152883 band + 3795:152884 grid width. */
const BAND_BG = "#3377a2";
const TEXT = "#ffffff";
const COMPOSITE_MAX_WIDTH = 987;

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

type Section = Record<string, unknown> & { _key: string; _type: string };

async function uploadBoard() {
  if (!existsSync(BOARD_FILE)) {
    throw new Error(`Missing ${BOARD_FILE} — export Figma 3795:152884 first`);
  }
  const asset = await client.assets.upload("image", createReadStream(BOARD_FILE), {
    filename: basename(BOARD_FILE),
    contentType: "image/jpeg",
  });
  console.log(`  ↑ highlights board → ${asset._id}`);
  return {
    _type: "image" as const,
    asset: { _type: "reference" as const, _ref: asset._id },
  };
}

function buildSection(compositeImage: unknown, existing?: Section): Section {
  return {
    ...(existing ?? {}),
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

  console.log(`${SLUG} — Project Highlights (Figma 3795:152883, composite 2×2)`);
  if (highlightIdx >= 0) {
    console.log(`  update highlightReel[${highlightIdx}]`);
  } else {
    const insertAfter =
      statsIdx >= 0
        ? statsIdx
        : reflectionIdx >= 0
          ? reflectionIdx - 1
          : before.length - 1;
    console.log(`  insert highlightReel after sections[${insertAfter}] (${before[insertAfter]?._type ?? "end"})`);
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
    `✓ ${SLUG}: Project Highlights — ${before.length} → ${sections.length} section(s)`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
