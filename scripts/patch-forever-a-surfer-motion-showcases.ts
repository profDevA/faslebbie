/**
 * Forever a Surfer — two desktop motion carousel bands (no Research Artifacts).
 *
 * Band 1 — Figma `4170:20458`, sage `#bbcdbe`; 9 carousel plates @4×:
 *   `4162:22783`, `22799`, `22733`, `22753`, `22758`, `22763`, `22768`, `22773`, `22778`
 * Copy: WP extraGalleries[0] — **Phase 1 Strategy**
 *
 * Band 2 — Figma `4170:20484`, grey `#9b9f9c`; 4 slides @4×:
 *   `4162:22811`, `22738`, `22794`, `22748`
 * Copy: WP **Design Interventions** (ignore Figma lorem captions)
 *
 * Replaces legacy `showcaseGallery` + single `desktopMotionShowcase` with two bands.
 *
 *   public/work/forever-a-surfer/motion-1/01.png … 09.png
 *   public/work/forever-a-surfer/motion-2/01.png … 04.png
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-forever-a-surfer-motion-showcases.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-forever-a-surfer-motion-showcases.ts --with-user-token
 *   npx sanity exec scripts/patch-forever-a-surfer-motion-showcases.ts --with-user-token -- --appearance-only
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
const SLUG = "forever-a-surfer";

const DIR_1 = join(process.cwd(), "public/work/forever-a-surfer/motion-1");
const DIR_2 = join(process.cwd(), "public/work/forever-a-surfer/motion-2");

/** Figma 4170:20458 */
const BAND_1_BG = "#bbcdbe";
/** Figma 4170:20484 */
const BAND_2_BG = "#9b9f9c";
const TEXT = "#000000";

const SLIDES_1 = [
  { file: "01.png", figma: "4162:22783" },
  { file: "02.png", figma: "4162:22799" },
  { file: "03.png", figma: "4162:22733" },
  { file: "04.png", figma: "4162:22753" },
  { file: "05.png", figma: "4162:22758" },
  { file: "06.png", figma: "4162:22763" },
  { file: "07.png", figma: "4162:22768" },
  { file: "08.png", figma: "4162:22773" },
  { file: "09.png", figma: "4162:22778" },
] as const;

const SLIDES_2 = [
  { file: "01.png", figma: "4162:22811" },
  { file: "02.png", figma: "4162:22738" },
  { file: "03.png", figma: "4162:22794" },
  { file: "04.png", figma: "4162:22748" },
] as const;

const wp = generatedCaseStudies[SLUG] as {
  extraGalleries: { heading: string; body: string }[];
};

const PHASE_1 = wp.extraGalleries[0];

const DESIGN_INTERVENTIONS_BODY = [
  "Lifestyle Branding & Photoshoots",
  "Collaborated with socially conscious surfers on lifestyle photoshoots, weaving the Forever a Surfer slogan into authentic visual storytelling and competitions, enhancing brand identity and campaign relevance. These photoshoots elevated campaign visibility across Orange County and Hawaii, driving engagement and aligning surf culture with social justice narratives.",
];

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

type SanityImage = {
  _type: "image";
  asset: { _type: "reference"; _ref: string };
};

type Section = Record<string, unknown> & { _key: string; _type: string };

function ptBlocks(lines: string[]) {
  return lines.map((text) => ({
    _type: "block" as const,
    _key: key(),
    style: "normal" as const,
    markDefs: [],
    children: [{ _type: "span" as const, _key: key(), text, marks: [] }],
  }));
}

function appearance(bg: string) {
  return {
    _type: "appearance" as const,
    backgroundColor: sanityColor(bg),
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

async function buildSlides(
  dir: string,
  specs: readonly { file: string; figma: string }[],
  label: string,
) {
  const slides = [];
  for (let i = 0; i < specs.length; i++) {
    const spec = specs[i];
    const abs = join(dir, spec.file);
    if (!APPEARANCE_ONLY && !existsSync(abs)) {
      throw new Error(`Missing ${abs} — export Figma ${spec.figma} @4×`);
    }
    const image = DRY || APPEARANCE_ONLY
      ? ({ _type: "image", asset: { _type: "reference", _ref: "dry-run" } } satisfies SanityImage)
      : await uploadImage(abs);
    slides.push({
      _type: "desktopMotionSlide" as const,
      _key: key(),
      alt: `${label} slide ${i + 1}`,
      image,
    });
    console.log(`  [${i + 1}] ${spec.file} (${spec.figma})`);
  }
  return slides;
}

function buildBand(opts: {
  sectionTitle: string;
  body: ReturnType<typeof ptBlocks>;
  slides: unknown[];
  poster: SanityImage | null;
  bg: string;
  existingKey?: string;
}): Section {
  return {
    _type: "desktopMotionShowcase",
    _key: opts.existingKey ?? key(),
    layoutVariant: "single",
    sectionTitle: opts.sectionTitle,
    body: opts.body,
    slides: opts.slides,
    posterImage: opts.poster ?? undefined,
    videoUrl: undefined,
    videoFile: undefined,
    carousels: undefined,
    appearance: appearance(opts.bg),
  };
}

function restructureSections(sections: Section[], band1: Section, band2: Section) {
  const accIdx = sections.findIndex((s) => s._type === "accordionSection");
  if (accIdx < 0) throw new Error("No accordionSection");

  const head = sections.slice(0, accIdx + 1);
  const tail = sections.filter(
    (s) => s._type === "statsSection" || s._type === "reflectionSection",
  );

  const oldMotion = sections.filter((s) => s._type === "desktopMotionShowcase");
  band1._key = oldMotion[0]?._key ?? band1._key;
  band2._key = oldMotion[1]?._key ?? (oldMotion[0] ? key() : band2._key);

  return [...head, band1, band2, ...tail];
}

async function patchDoc(docId: string) {
  const doc = await client.getDocument(docId);
  if (!doc) return false;

  const sections = [...((doc.sections ?? []) as Section[])];
  const motionSections = sections.filter((s) => s._type === "desktopMotionShowcase");

  if (APPEARANCE_ONLY) {
    const i1 = sections.findIndex((s) => s._type === "desktopMotionShowcase");
    const i2 = sections.findIndex(
      (s, i) => i > i1 && s._type === "desktopMotionShowcase",
    );
    if (i1 < 0 || i2 < 0) {
      throw new Error(`${docId}: need two desktopMotionShowcase sections`);
    }
    if (!DRY) {
      await client
        .patch(docId)
        .set({
          [`sections[${i1}].appearance`]: appearance(BAND_1_BG),
          [`sections[${i2}].appearance`]: appearance(BAND_2_BG),
        })
        .commit();
    }
    console.log(`✓ ${docId}: appearance only`);
    return true;
  }

  console.log(`${docId}: band 1 slides (${SLIDES_1.length})`);
  const slides1 = await buildSlides(DIR_1, SLIDES_1, "Phase 1 Strategy");
  console.log(`${docId}: band 2 slides (${SLIDES_2.length})`);
  const slides2 = await buildSlides(DIR_2, SLIDES_2, "Design Interventions");

  const poster1 =
    DRY ? null : (slides1[0] as { image: SanityImage }).image;
  const poster2 =
    DRY ? null : (slides2[0] as { image: SanityImage }).image;

  const band1 = buildBand({
    sectionTitle: PHASE_1.heading,
    body: ptBlocks([PHASE_1.body]),
    slides: slides1,
    poster: poster1,
    bg: BAND_1_BG,
    existingKey: motionSections[0]?._key,
  });

  const band2 = buildBand({
    sectionTitle: "Design Interventions",
    body: ptBlocks(DESIGN_INTERVENTIONS_BODY),
    slides: slides2,
    poster: poster2,
    bg: BAND_2_BG,
    existingKey: motionSections[1]?._key,
  });

  const next = restructureSections(sections, band1, band2);
  console.log(
    `${docId}: sections ${sections.length} → ${next.length} (dropped showcaseGallery)`,
  );

  if (!DRY) await client.patch(docId).set({ sections: next }).commit();
  console.log(`✓ ${docId}: motion bands patched`);
  return true;
}

async function main() {
  console.log(
    `patch-forever-a-surfer-motion-showcases (${DRY ? "dry" : APPEARANCE_ONLY ? "appearance-only" : "live"})`,
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
