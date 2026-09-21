/**
 * OC Links §07 Key Product Experiences — staggered pair (Figma 4004:116820).
 * Two independent poster carousels (5 + 5). Captions empty (Figma leftover ignored).
 *
 * PNG @4×:
 *   Slider 1: 4004:117774, 117773, 117772, 117771, 117770
 *   Slider 2: 4004:117777, 117778, 117779, 117776, 117775
 *   public/work/oc-links/key-product/slider/1-01–05.png + 2-01–05.png
 *
 * Inserts after Research Artifacts. Does not touch a later login desktopMotionShowcase.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-oc-links-kpe-staggered.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-oc-links-kpe-staggered.ts --with-user-token
 *   npx sanity exec scripts/patch-oc-links-kpe-staggered.ts --with-user-token -- --appearance-only
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
const ASSET_DIR = join(process.cwd(), "public/work/oc-links/key-product/slider");

const BAND_BG = "#b6c5e4";
const TEXT = "#000000";
const SECTION_TITLE = "Key Product Experiences";

const SLIDER_1 = [
  { file: "1-01.png", figma: "4004:117774" },
  { file: "1-02.png", figma: "4004:117773" },
  { file: "1-03.png", figma: "4004:117772" },
  { file: "1-04.png", figma: "4004:117771" },
  { file: "1-05.png", figma: "4004:117770" },
] as const;

const SLIDER_2 = [
  { file: "2-01.png", figma: "4004:117777" },
  { file: "2-02.png", figma: "4004:117778" },
  { file: "2-03.png", figma: "4004:117779" },
  { file: "2-04.png", figma: "4004:117776" },
  { file: "2-05.png", figma: "4004:117775" },
] as const;

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

type SanityImage = {
  _type: "image";
  asset: { _type: "reference"; _ref: string };
};

type Section = Record<string, unknown> & {
  _key: string;
  _type: string;
  layoutVariant?: string;
};

async function uploadImage(absPath: string) {
  const asset = await client.assets.upload("image", createReadStream(absPath), {
    filename: basename(absPath),
    contentType: "image/png",
  });
  console.log(`  ↑ ${basename(absPath)} → ${asset._id}`);
  return {
    _type: "image" as const,
    asset: { _type: "reference" as const, _ref: asset._id },
  } satisfies SanityImage;
}

async function buildSlides(
  specs: readonly { file: string; figma: string }[],
  label: string,
) {
  const slides = [];
  for (let i = 0; i < specs.length; i++) {
    const spec = specs[i];
    const abs = join(ASSET_DIR, spec.file);
    if (!existsSync(abs)) throw new Error(`Missing PNG: ${abs}`);
    const image = DRY
      ? { _type: "image" as const, asset: { _type: "reference" as const, _ref: "dry-run" } }
      : await uploadImage(abs);
    slides.push({
      _type: "desktopMotionSlide" as const,
      _key: key(),
      alt: `${label} slide ${i + 1}`,
      image,
    });
    console.log(`  [${label} ${i + 1}] ${spec.file} (${spec.figma})`);
  }
  return slides;
}

function appearance() {
  return {
    _type: "appearance" as const,
    backgroundColor: sanityColor(BAND_BG),
    textColor: sanityColor(TEXT),
    tileBorderRadius: 0,
  };
}

async function buildSection(_key: string) {
  const slider1 = await buildSlides(SLIDER_1, "Slider 1");
  const slider2 = await buildSlides(SLIDER_2, "Slider 2");
  return {
    _type: "desktopMotionShowcase" as const,
    _key,
    layoutVariant: "staggeredPair" as const,
    sectionTitle: SECTION_TITLE,
    appearance: appearance(),
    carousels: [
      { _type: "desktopMotionCarousel" as const, _key: key(), slides: slider1 },
      { _type: "desktopMotionCarousel" as const, _key: key(), slides: slider2 },
    ],
  };
}

function findStaggerIdx(sections: Section[]) {
  const named = sections.findIndex(
    (s) =>
      s._type === "desktopMotionShowcase" && s.layoutVariant === "staggeredPair",
  );
  if (named >= 0) return named;
  return -1;
}

async function patchDoc(docId: string) {
  const doc = await client.getDocument(docId);
  if (!doc) return false;

  const sections = [...((doc.sections ?? []) as Section[])];
  let idx = findStaggerIdx(sections);
  const galleryIdx = sections.findIndex((s) => s._type === "showcaseGallery");

  if (APPEARANCE_ONLY) {
    if (idx < 0) throw new Error(`${docId}: no staggeredPair section`);
    if (!DRY) {
      await client
        .patch(docId)
        .set({ [`sections[${idx}].appearance`]: appearance() })
        .commit();
    }
    console.log(`✓ ${docId}: appearance ${BAND_BG}${DRY ? " (dry)" : ""}`);
    return true;
  }

  const sectionKey = idx >= 0 ? sections[idx]._key : key();
  const section = await buildSection(sectionKey);

  if (idx < 0) {
    const insertAt = galleryIdx >= 0 ? galleryIdx + 1 : sections.length;
    sections.splice(insertAt, 0, section);
    idx = insertAt;
    console.log(`${docId}: insert staggeredPair at sections[${idx}]`);
  } else {
    sections[idx] = { ...sections[idx], ...section, _key: sectionKey };
    console.log(`${docId}: replace staggeredPair at sections[${idx}]`);
  }

  if (!DRY) await client.patch(docId).set({ sections }).commit();
  console.log(
    `✓ ${docId}: ${SECTION_TITLE} staggeredPair · 5+5 slides${DRY ? " (dry)" : ""}`,
  );
  return true;
}

async function main() {
  console.log(
    `patch-oc-links-kpe-staggered (${DRY ? "dry" : APPEARANCE_ONLY ? "appearance-only" : "live"})`,
  );
  for (const spec of [...SLIDER_1, ...SLIDER_2]) {
    const abs = join(ASSET_DIR, spec.file);
    if (!existsSync(abs)) throw new Error(`Missing PNG: ${abs}`);
  }

  await patchDoc(PUB_ID);
  const draftId = `drafts.${PUB_ID}`;
  if (await client.getDocument(draftId)) await patchDoc(draftId);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
