/**
 * Snapback Lifestyle Design Interventions — desktop motion carousel
 * (Figma band `4152:153369`; 14 slides `4305:21270`–`21283` per Fas node list).
 *
 * Replaces placeholder motionShowcase (KPE stacked) with one desktopMotionShowcase:
 * yellow band #ffec98, 14-slide carousel, copy bottom-right (ignore Figma lorem).
 * Copy: live WP designInterventions.body.
 *
 * PNG @4×: public/work/snapback-lifestyle/key-product/slider/01.png–14.png
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-snapback-lifestyle-design-interventions.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-snapback-lifestyle-design-interventions.ts --with-user-token
 *   npx sanity exec scripts/patch-snapback-lifestyle-design-interventions.ts --with-user-token -- --appearance-only
 *
 * Do not re-run after manual Studio image uploads.
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import { generatedCaseStudies } from "../src/lib/case-studies.generated";
import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const APPEARANCE_ONLY = process.argv.includes("--appearance-only");
const SLUG = "snapback-lifestyle";
const ASSET_DIR = join(
  process.cwd(),
  "public/work/snapback-lifestyle/key-product/slider",
);

/** Figma 4152:153369 band */
const BAND_BG = "#ffec98";
const TEXT = "#000000";
const SECTION_TITLE = "Design Interventions";

const BODY =
  generatedCaseStudies[SLUG].designInterventions?.body?.trim() ?? "";

/** User node order (21275 before 21274). */
const SLIDES = [
  { file: "01.png", figma: "4305:21270" },
  { file: "02.png", figma: "4305:21271" },
  { file: "03.png", figma: "4305:21272" },
  { file: "04.png", figma: "4305:21273" },
  { file: "05.png", figma: "4305:21275" },
  { file: "06.png", figma: "4305:21274" },
  { file: "07.png", figma: "4305:21276" },
  { file: "08.png", figma: "4305:21277" },
  { file: "09.png", figma: "4305:21278" },
  { file: "10.png", figma: "4305:21279" },
  { file: "11.png", figma: "4305:21280" },
  { file: "12.png", figma: "4305:21281" },
  { file: "13.png", figma: "4305:21282" },
  { file: "14.png", figma: "4305:21283" },
] as const;

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

type SanityImage = {
  _type: "image";
  asset: { _type: "reference"; _ref: string };
};

type Section = Record<string, unknown> & { _key: string; _type: string };

function pt(text: string) {
  return [
    {
      _type: "block" as const,
      _key: key(),
      style: "normal" as const,
      markDefs: [],
      children: [{ _type: "span" as const, _key: key(), text, marks: [] }],
    },
  ];
}

function appearance() {
  return {
    _type: "appearance" as const,
    backgroundColor: sanityColor(BAND_BG),
    textColor: sanityColor(TEXT),
    tileBorderRadius: 0,
    maxWidth: "wide" as const,
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
    asset: { _type: "reference" as const, _ref: asset._id },
  } satisfies SanityImage;
}

async function buildSlides() {
  const slides = [];
  for (let i = 0; i < SLIDES.length; i++) {
    const spec = SLIDES[i];
    const abs = join(ASSET_DIR, spec.file);
    if (!existsSync(abs)) throw new Error(`Missing ${abs} — export Figma ${spec.figma} @4×`);
    const image = DRY
      ? ({ _type: "image", asset: { _type: "reference", _ref: "dry-run" } } satisfies SanityImage)
      : await uploadImage(abs);
    slides.push({
      _type: "desktopMotionSlide" as const,
      _key: key(),
      alt: `${SECTION_TITLE} slide ${i + 1}`,
      image,
    });
    console.log(`  [${i + 1}] ${spec.file} (${spec.figma})`);
  }
  return slides;
}

function buildSection(
  slides: unknown[],
  posterImage: SanityImage | null,
  existing?: Section,
): Section {
  return {
    ...(existing ?? {}),
    _type: "desktopMotionShowcase",
    _key: existing?._key ?? key(),
    layoutVariant: "single",
    sectionTitle: SECTION_TITLE,
    body: BODY ? pt(BODY) : undefined,
    slides,
    posterImage: posterImage ?? undefined,
    videoUrl: undefined,
    videoFile: undefined,
    carousels: undefined,
    appearance: appearance(),
  };
}

function spliceDesktopBand(sections: Section[], band: Section) {
  const idx = sections.findIndex(
    (s) => s._type === "motionShowcase" || s._type === "desktopMotionShowcase",
  );
  if (idx < 0) {
    const galleryIdx = sections.findIndex((s) => s._type === "showcaseGallery");
    const insertAt = galleryIdx >= 0 ? galleryIdx + 1 : sections.length;
    return [...sections.slice(0, insertAt), band, ...sections.slice(insertAt)];
  }
  const next = sections.filter(
    (s) => s._type !== "motionShowcase" && s._type !== "desktopMotionShowcase",
  );
  const insertAt = sections
    .slice(0, idx)
    .filter(
      (s) => s._type !== "motionShowcase" && s._type !== "desktopMotionShowcase",
    ).length;
  return [...next.slice(0, insertAt), band, ...next.slice(insertAt)];
}

async function patchDoc(docId: string) {
  const doc = await client.getDocument(docId);
  if (!doc) return false;

  const sections = [...((doc.sections ?? []) as Section[])];
  const motionIdx = sections.findIndex(
    (s) => s._type === "motionShowcase" || s._type === "desktopMotionShowcase",
  );
  const existing =
    motionIdx >= 0 ? sections[motionIdx] : undefined;

  if (APPEARANCE_ONLY) {
    if (motionIdx < 0 || sections[motionIdx]._type !== "desktopMotionShowcase") {
      throw new Error(`${docId}: no desktopMotionShowcase to patch appearance`);
    }
    if (!DRY) {
      await client
        .patch(docId)
        .set({
          [`sections[${motionIdx}].appearance`]: appearance(),
          [`sections[${motionIdx}].layoutVariant`]: "single",
          [`sections[${motionIdx}].sectionTitle`]: SECTION_TITLE,
        })
        .commit();
    }
    console.log(`✓ ${docId}: appearance ${BAND_BG}${DRY ? " (dry)" : ""}`);
    return true;
  }

  const slides = await buildSlides();
  const poster = DRY ? null : (slides[0] as { image: SanityImage }).image;
  const band = buildSection(slides, poster, existing);
  const next = spliceDesktopBand(sections, band);

  console.log(
    `${docId}: motion section → desktopMotionShowcase (${slides.length} slides)`,
  );

  if (!DRY) await client.patch(docId).set({ sections: next }).commit();
  console.log(`✓ ${docId}: ${SECTION_TITLE}${DRY ? " (dry)" : ""}`);
  return true;
}

async function main() {
  console.log(
    `patch-snapback-lifestyle-design-interventions (${DRY ? "dry" : APPEARANCE_ONLY ? "appearance-only" : "live"})`,
  );

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
