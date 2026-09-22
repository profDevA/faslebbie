/**
 * Forever a Surfer §10 Project Highlights — 3×2 grid (Figma `4162:23691` / `4170:20530`).
 *
 * Six cell frames @4× (L→R, T→B). Band `#8facaa`, white cell plates, gap ~17px, inset 0.
 * Inserts highlightReel after Impact (statsSection), before Reflection.
 *
 * PNG: public/work/forever-a-surfer/highlights/01–06-*.png
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-forever-a-surfer-highlight-reel.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-forever-a-surfer-highlight-reel.ts --with-user-token
 *   npx sanity exec scripts/patch-forever-a-surfer-highlight-reel.ts --with-user-token -- --appearance-only
 *
 * Do not re-run after manual Studio uploads.
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const APPEARANCE_ONLY = process.argv.includes("--appearance-only");
const SLUG = "forever-a-surfer";
const ASSET_DIR = join(process.cwd(), "public/work/forever-a-surfer/highlights");

/** Figma 4162:23691 band */
const BAND_BG = "#8facaa";
const TEXT = "#000000";
/** Figma 4170:20530 gap ~17.5px */
const GRID_GAP = 17;
const CELL_MATTE = "#ffffff";

/** Row-major 3×2 — Figma grid cells */
const CELLS = [
  { file: "01-fas-back.png", figma: "4170:20539" },
  { file: "02-surfboard-water.png", figma: "4170:20544" },
  { file: "03-beach-stretch.png", figma: "4170:20531" },
  { file: "04-girl-wings.png", figma: "4170:20545" },
  { file: "05-beach-lesson.png", figma: "4170:20534" },
  { file: "06-surf-duo.png", figma: "4170:20548" },
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
    if (!existsSync(abs)) throw new Error(`Missing ${abs} — export Figma ${cell.figma} @4×`);
    const frame = DRY
      ? { _type: "image", _key: key(), asset: { _type: "reference", _ref: "dry" } }
      : await uploadImage(abs);
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
    console.log(`✓ ${docId}: highlightReel appearance ${BAND_BG}${DRY ? " (dry)" : ""}`);
    return true;
  }

  const insertAt =
    highlightIdx >= 0
      ? highlightIdx
      : statsIdx >= 0
        ? statsIdx + 1
        : reflectionIdx >= 0
          ? reflectionIdx
          : before.length;

  if (highlightIdx >= 0) {
    console.log(`${docId}: replace highlightReel at sections[${highlightIdx}]`);
  } else {
    console.log(
      `${docId}: insert highlightReel at sections[${insertAt}] (after ${before[insertAt - 1]?._type ?? "start"})`,
    );
  }

  const cells = await buildCells();
  let sections: Section[];
  if (highlightIdx >= 0) {
    sections = before.map((s, i) =>
      i === highlightIdx ? buildSection(cells, s) : s,
    );
  } else {
    sections = [
      ...before.slice(0, insertAt),
      buildSection(cells),
      ...before.slice(insertAt),
    ];
  }

  if (!DRY) await client.patch(docId).set({ sections }).commit();
  console.log(
    `✓ ${docId}: Project Highlights 3×2 — ${before.length} → ${sections.length} section(s), ${cells.length} cells${DRY ? " (dry)" : ""}`,
  );
  return true;
}

async function main() {
  console.log(
    `patch-forever-a-surfer-highlight-reel (${DRY ? "dry" : APPEARANCE_ONLY ? "appearance-only" : "live"})`,
  );
  if (!DRY && !APPEARANCE_ONLY) {
    for (const cell of CELLS) {
      const abs = join(ASSET_DIR, cell.file);
      if (!existsSync(abs)) throw new Error(`Missing PNG: ${abs}`);
    }
  }

  const pub = await client.fetch<{ _id: string }>(
    `*[_type == "caseStudy" && slug.current == $slug && !(_id in path("drafts.**"))][0]{ _id }`,
    { slug: SLUG },
  );
  if (!pub?._id) throw new Error(`Missing published ${SLUG}`);

  await patchDoc(pub._id);
  const draftId = `drafts.${pub._id}`;
  if (await client.getDocument(draftId)) await patchDoc(draftId);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
