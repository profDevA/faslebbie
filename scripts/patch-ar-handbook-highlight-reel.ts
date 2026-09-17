/**
 * The AR Handbook §10 Project Highlights — single rotating card (all breakpoints).
 *
 * Desktop: Figma 4152:124234 — white-framed card cycling five slides @2×.
 * Mobile: Figma 4152:126469 — same (3px white frame, 6px radius).
 *
 * PNG source: public/work/the-ar-handbook/highlights/ (slide exports only)
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-ar-handbook-highlight-reel.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-ar-handbook-highlight-reel.ts --with-user-token
 *   npx sanity exec scripts/patch-ar-handbook-highlight-reel.ts --with-user-token -- --appearance-only
 *   npx sanity exec scripts/patch-ar-handbook-highlight-reel.ts --with-user-token -- --fix-frame-keys
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import { HIGHLIGHT_REEL_SINGLE_DEFAULTS } from "../src/lib/caseStudyDefaults";
import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const APPEARANCE_ONLY = process.argv.includes("--appearance-only");
const UNSET_MOBILE_BOARD = process.argv.includes("--unset-mobile-board");
const FIX_FRAME_KEYS = process.argv.includes("--fix-frame-keys");
const SLUG = "the-ar-handbook";
const ASSET_DIR = join(process.cwd(), "public/work/the-ar-handbook/highlights");

/** Figma 4152:124234 band (matches My Approach accordion). */
const BAND_BG = "#658181";
const TEXT = "#ffffff";

const SLIDES = [
  {
    file: "01-delivery-item-identification.png",
    caption: "Delivery Item Identification",
  },
  {
    file: "02-correct-work-item-placement.png",
    caption: "Correct Work Item Placement",
  },
  {
    file: "03-delivery-item-identification-warehouse.png",
    caption: "Delivery Item Identification",
  },
  {
    file: "04-disrupt-catalogue-industry.png",
    caption: "Disrupt the $2bn service part catalogue Industry",
  },
  {
    file: "05-persona-impact-grid.png",
    caption: "Cross-functional impact by persona",
  },
] as const;

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

function appearance() {
  return {
    _type: "appearance",
    backgroundColor: sanityColor(BAND_BG),
    textColor: sanityColor(TEXT),
  };
}

function buildSection(cells: unknown[], existing?: Section): Section {
  const {
    cells: _oldCells,
    compositeImage: _desk,
    compositeImageMobile: _mobile,
    ...rest
  } = existing ?? {};
  return {
    ...rest,
    _type: "highlightReel",
    _key: existing?._key ?? key(),
    sectionTitle: "Project Highlights",
    layout: "single",
    cells,
    singleCardMatteColor: sanityColor("#ffffff"),
    singleCardPadding: HIGHLIGHT_REEL_SINGLE_DEFAULTS.cardPadding,
    appearance: appearance(),
  };
}

type HighlightCell = {
  _key?: string;
  _type?: string;
  caption?: string;
  frames?: { _key?: string; _type?: string; asset?: unknown }[];
};

function cellsWithFrameKeys(cells: HighlightCell[] | undefined): HighlightCell[] {
  return (cells ?? []).map((cell) => ({
    ...cell,
    frames: (cell.frames ?? []).map((frame) =>
      frame._key ? frame : { ...frame, _key: key() },
    ),
  }));
}

async function buildCells() {
  const cells = [];
  for (const slide of SLIDES) {
    const abs = join(ASSET_DIR, slide.file);
    if (!existsSync(abs)) throw new Error(`Missing ${abs}`);
    const frame = await uploadImage(abs);
    cells.push({
      _type: "highlightCell",
      _key: key(),
      caption: slide.caption,
      frames: [{ ...frame, _key: key() }],
    });
  }
  return cells;
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

  console.log(`${SLUG} — Project Highlights (Figma 4152:124234 / 4152:126469)`);

  if (FIX_FRAME_KEYS) {
    if (highlightIdx < 0) throw new Error("no highlightReel");
    const section = before[highlightIdx] as Section & { cells?: HighlightCell[] };
    const fixed = cellsWithFrameKeys(section.cells);
    if (DRY) {
      console.log("(dry run — would add _key to frames[] items)");
      return;
    }
    await client
      .patch(doc._id)
      .set({ [`sections[${highlightIdx}].cells`]: fixed })
      .commit();
    console.log(`✓ ${SLUG}: added _key to highlight frames (Studio editable)`);
    return;
  }

  if (APPEARANCE_ONLY) {
    if (highlightIdx < 0) throw new Error("no highlightReel to patch appearance");
    if (DRY) {
      console.log("(dry run — appearance only)");
      return;
    }
    await client
      .patch(doc._id)
      .set({ [`sections[${highlightIdx}].appearance`]: appearance() })
      .commit();
    console.log(`✓ ${SLUG}: highlightReel appearance → ${BAND_BG}`);
    return;
  }

  if (UNSET_MOBILE_BOARD) {
    if (highlightIdx < 0) throw new Error("no highlightReel");
    if (DRY) {
      console.log("(dry run — unset mobile board)");
      return;
    }
    await client
      .patch(doc._id)
      .set({ [`sections[${highlightIdx}].layout`]: "single" })
      .unset([`sections[${highlightIdx}].compositeImageMobile`])
      .commit();
    console.log(`✓ ${SLUG}: layout → single, removed compositeImageMobile`);
    return;
  }

  if (DRY) {
    console.log("(dry run — nothing written)");
    return;
  }

  const cells = await buildCells();
  let sections: Section[];

  if (highlightIdx >= 0) {
    sections = before.map((s, i) =>
      i === highlightIdx ? buildSection(cells, s) : s,
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
      buildSection(cells),
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
