/**
 * One-off: revert Memory Tubes highlightReel from experimental `videoImage` back to
 * `single` rotating card (Aug 2025 migrate — 9 documentation frames).
 *
 * Reuses image assets already on the doc from videoStackSlides when present.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-memory-tubes-highlight-restore-single.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-memory-tubes-highlight-restore-single.ts --with-user-token
 */
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import { HIGHLIGHT_REEL_SINGLE_DEFAULTS } from "../src/lib/caseStudyDefaults";
import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const DOC_ID = "cs-memory-tubes";

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

type ImageRef = { _type: "image"; asset: { _type: "reference"; _ref: string } };

type HighlightSection = {
  _key: string;
  _type: "highlightReel";
  videoStackSlides?: ImageRef[];
  cells?: { _key?: string; _type?: string; frames?: ImageRef[] }[];
  layout?: string;
};

async function patchDoc(docId: string) {
  const doc = await client.fetch<{ sections: HighlightSection[] }>(
    `*[_id == $id][0]{ sections }`,
    { id: docId },
  );
  if (!doc?.sections?.length) throw new Error(`${docId}: no sections`);

  const idx = doc.sections.findIndex((s) => s._type === "highlightReel");
  if (idx < 0) throw new Error(`${docId}: no highlightReel`);

  const section = doc.sections[idx];
  const slideRefs = section.videoStackSlides ?? [];
  const existingFrames = section.cells?.flatMap((c) => c.frames ?? []) ?? [];

  const framesSource = slideRefs.length ? slideRefs : existingFrames;
  if (!framesSource.length) {
    throw new Error(`${docId}: no frames to restore (videoStackSlides and cells empty)`);
  }

  const frames = framesSource.map((img) => ({
    ...img,
    _key: key(),
  }));

  const cells = [
    {
      _type: "highlightCell" as const,
      _key: key(),
      frames,
    },
  ];

  console.log(
    `${docId} highlightReel[${idx}]: videoImage → single (${frames.length} frame(s) in one card)`,
  );

  if (DRY) return;

  await client
    .patch(docId)
    .set({
      [`sections[${idx}].layout`]: "single",
      [`sections[${idx}].cells`]: cells,
      [`sections[${idx}].singleCardMatteColor`]: sanityColor(
        HIGHLIGHT_REEL_SINGLE_DEFAULTS.cardMatteColor,
      ),
      [`sections[${idx}].singleCardPadding`]: HIGHLIGHT_REEL_SINGLE_DEFAULTS.cardPadding,
    })
    .unset([
      `sections[${idx}].videoStackVideo`,
      `sections[${idx}].videoStackSlides`,
      `sections[${idx}].videoStackBottomImage`,
      `sections[${idx}].videoStackCardMaxWidth`,
      `sections[${idx}].videoStackGap`,
    ])
    .commit();

  console.log(`✓ ${docId}: highlightReel restored to single layout`);
}

async function main() {
  console.log(`patch-memory-tubes-highlight-restore-single (${DRY ? "dry" : "live"})`);
  await patchDoc(DOC_ID);
  const draftId = `drafts.${DOC_ID}`;
  if (await client.getDocument(draftId)) await patchDoc(draftId);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
