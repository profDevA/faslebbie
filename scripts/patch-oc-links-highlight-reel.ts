/**
 * OC Links §10 Project Highlights — existing highlightReel `grid`
 * (desktop 3×2 Figma 4003:105776; mobile 2×3 Figma 4003:109199).
 *
 * Figma 4003:105776. Six Container cards @4× (L→R, T→B):
 *   4004:118131 / 118232 / 117922 / 118325 / 118026 / 118419
 * PNG: public/work/oc-links/highlights/01–06-*.png
 *
 * Band #436997 (sampled), plate matte #c3d1ed baked into each PNG so
 * insets are 0 (do not wrap Coral’s 14/10.5% mint inset around these).
 * Gap 18px (Figma ~17.6). Title “Project Highlights”. Quotes live in the
 * plates — no cell captions. Ignore leftover Coral/Experian layers in Figma.
 *
 * Inserts after Impact (statsSection), before Reflection.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-oc-links-highlight-reel.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-oc-links-highlight-reel.ts --with-user-token
 *   npx sanity exec scripts/patch-oc-links-highlight-reel.ts --with-user-token -- --appearance-only
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
const PUB_ID = "cs-oc-links";
const ASSET_DIR = join(process.cwd(), "public/work/oc-links/highlights");

/** Figma 4003:105776 band fill (sampled). */
const BAND_BG = "#436997";
const TEXT = "#ffffff";
/** Light plate around each photo/quote (sampled from 4004:118131). */
const CELL_MATTE = "#c3d1ed";
const GRID_GAP = 18;

const CELLS = [
  { file: "01-steve-quote.png", figma: "4004:118131" },
  { file: "02-kneeling.png", figma: "4004:118232" },
  { file: "03-viki-quote.png", figma: "4004:117922" },
  { file: "04-computer.png", figma: "4004:118325" },
  { file: "05-juliana-udel.png", figma: "4004:118026" },
  { file: "06-hallway.png", figma: "4004:118419" },
] as const;

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

type Section = Record<string, unknown> & { _key: string; _type: string };

function appearance() {
  return {
    _type: "appearance" as const,
    backgroundColor: sanityColor(BAND_BG),
    textColor: sanityColor(TEXT),
  };
}

function gridFields() {
  return {
    layout: "grid" as const,
    sectionTitle: "Project Highlights",
    gridCellMatteColor: sanityColor(CELL_MATTE),
    gridCellInsetVerticalPercent: 0,
    gridCellInsetHorizontalPercent: 0,
    gridGap: GRID_GAP,
    appearance: appearance(),
  };
}

async function uploadImage(absPath: string) {
  const asset = await client.assets.upload("image", createReadStream(absPath), {
    filename: basename(absPath),
    contentType: "image/png",
  });
  console.log(`  ↑ ${basename(absPath)} → ${asset._id}`);
  return {
    _type: "image" as const,
    _key: key(),
    asset: { _type: "reference" as const, _ref: asset._id },
  };
}

async function buildCells() {
  const cells = [];
  for (const cell of CELLS) {
    const abs = join(ASSET_DIR, cell.file);
    if (!existsSync(abs)) throw new Error(`Missing ${abs} — export Figma ${cell.figma} @4× first`);
    const frame = await uploadImage(abs);
    cells.push({
      _type: "highlightCell",
      _key: key(),
      frames: [frame],
    });
  }
  return cells;
}

function buildSection(cells: unknown[], existing?: Section): Section {
  const {
    cells: _old,
    compositeImage: _desk,
    compositeImageMobile: _mobile,
    ...rest
  } = existing ?? {};
  return {
    ...rest,
    _type: "highlightReel",
    _key: existing?._key ?? key(),
    ...gridFields(),
    cells,
  };
}

async function patchDoc(docId: string) {
  const doc = await client.getDocument(docId);
  if (!doc) return false;

  const before = [...((doc.sections ?? []) as Section[])];
  const highlightIdx = before.findIndex((s) => s._type === "highlightReel");
  const statsIdx = before.findIndex((s) => s._type === "statsSection");
  const reflectionIdx = before.findIndex((s) => s._type === "reflectionSection");

  if (APPEARANCE_ONLY) {
    if (highlightIdx < 0) throw new Error(`${docId}: no highlightReel`);
    if (!DRY) {
      await client
        .patch(docId)
        .set(
          Object.fromEntries(
            Object.entries(gridFields()).map(([k, v]) => [
              `sections[${highlightIdx}].${k}`,
              v,
            ]),
          ),
        )
        .commit();
    }
    console.log(
      `✓ ${docId}: highlightReel appearance ${BAND_BG} grid gap=${GRID_GAP} inset=0${DRY ? " (dry)" : ""}`,
    );
    return true;
  }

  if (highlightIdx >= 0) {
    console.log(`${docId}: replace highlightReel at sections[${highlightIdx}]`);
  } else {
    const insertAt =
      statsIdx >= 0
        ? statsIdx + 1
        : reflectionIdx >= 0
          ? reflectionIdx
          : before.length;
    console.log(
      `${docId}: insert highlightReel at sections[${insertAt}] (after ${before[insertAt - 1]?._type ?? "start"})`,
    );
  }

  if (DRY) {
    console.log(`  ${CELLS.length} cells (dry — no upload)`);
    return true;
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

  await client.patch(docId).set({ sections }).commit();
  console.log(
    `✓ ${docId}: Project Highlights grid — ${before.length} → ${sections.length} section(s)`,
  );
  return true;
}

async function main() {
  console.log(
    `patch-oc-links-highlight-reel (${DRY ? "dry" : APPEARANCE_ONLY ? "appearance-only" : "live"})`,
  );
  if (!DRY && !APPEARANCE_ONLY) {
    for (const cell of CELLS) {
      const abs = join(ASSET_DIR, cell.file);
      if (!existsSync(abs)) throw new Error(`Missing PNG: ${abs}`);
    }
  }

  await patchDoc(PUB_ID);
  const draftId = `drafts.${PUB_ID}`;
  if (await client.getDocument(draftId)) await patchDoc(draftId);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
