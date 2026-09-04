/**
 * Experian Boost — Project Highlights as one composite board image.
 *
 * Israel Figma 3778:130432 (EB_BI.Jpg). Sets layout=composite, uploads the
 * board PNG, and removes legacy per-cell frames from the old single/grid setup.
 *
 * PNG source: public/work/experian-boost/highlights-board.png
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-experian-highlight-composite.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-experian-highlight-composite.ts --with-user-token
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";

import { getCliClient } from "sanity/cli";

import { HIGHLIGHT_REEL_COMPOSITE_DEFAULTS } from "../src/lib/caseStudyDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const SLUG = "experian-boost";
const BOARD_FILE = join(process.cwd(), "public/work/experian-boost/highlights-board.png");

async function uploadImage(absPath: string) {
  const asset = await client.assets.upload("image", createReadStream(absPath), {
    filename: basename(absPath),
  });
  return { _type: "image" as const, asset: { _type: "reference" as const, _ref: asset._id } };
}

async function patchDoc(docId: string) {
  const doc = await client.getDocument(docId);
  if (!doc?.sections?.length) {
    console.log(`skip ${docId}: no sections`);
    return false;
  }

  const idx = (doc.sections as { _type: string }[]).findIndex((s) => s._type === "highlightReel");
  if (idx < 0) {
    console.log(`skip ${docId}: no highlightReel`);
    return false;
  }

  if (!existsSync(BOARD_FILE)) {
    throw new Error(`Missing board PNG: ${BOARD_FILE}`);
  }

  const compositeImage = DRY ? { _type: "image", asset: { _type: "reference", _ref: "dry-run" } } : await uploadImage(BOARD_FILE);

  const patch = client.patch(docId);
  patch.set({
    [`sections[${idx}].layout`]: "composite",
    [`sections[${idx}].compositeImage`]: compositeImage,
    [`sections[${idx}].compositeMaxWidth`]: HIGHLIGHT_REEL_COMPOSITE_DEFAULTS.maxWidth,
  });
  patch.unset([`sections[${idx}].cells`]);

  if (DRY) {
    console.log(`→ ${docId}: layout=composite, upload board, unset cells (dry run)`);
    return true;
  }

  await patch.commit();
  console.log(`✓ ${docId}: highlightReel → composite board`);
  return true;
}

async function main() {
  const ids: string[] = await client.fetch(
    `*[_type == "caseStudy" && slug.current == $slug]._id`,
    { slug: SLUG },
  );
  if (!ids.length) throw new Error(`no case study: ${SLUG}`);

  let n = 0;
  for (const id of ids) {
    if (await patchDoc(id)) n++;
  }
  console.log(`\n${DRY ? "(dry run) " : ""}${n} doc(s) patched`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
