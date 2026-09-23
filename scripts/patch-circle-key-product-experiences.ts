/**
 * Circle two motion bands after Research Artifacts.
 *
 * 1. Key Product Experiences — `desktopMotionShowcase` staggeredPair, 3 rows
 *    (Figma `4171:48769` / mobile `4171:38193`). Cream `#e3e3db`.
 *    Each row is one two-phone plate (one slide, so the site arrows stay hidden).
 *    Odd rows left, even row right; mobile stacks. Same short lorem under each.
 *    Phone rows @4×: `4171:49077`, `4171:48773`, `4171:48989`.
 *
 * 2. Early prototyping — `desktopMotionShowcase` single, 6-slide carousel
 *    (band `4171:49948` / mobile `4174:72569`). Band `#171717`.
 *    Each slide is the `#222` card. Site arrows show because there is more than one slide.
 *    Caption sits bottom-right: Early prototyping + desktop lorem.
 *    Slides @4×: `4412:33475`, `33681`, `34123`, `34281`, `34552`, `34729`.
 *
 * PNG: public/work/circle/key-product/01–03-*.png
 *      public/work/circle/key-product/slider/01–06.png
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-circle-key-product-experiences.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-circle-key-product-experiences.ts --with-user-token
 *
 * Do not re-run after manual Studio image uploads.
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const FLUID = process.argv.includes("--fluid");
const PUB_ID = "cs-circle";
const ASSET_DIR = join(process.cwd(), "public/work/circle/key-product");

const KPE_TITLE = "Key Product Experiences";
const KPE_BG = "#e3e3db";
const KPE_TEXT = "#000000";
const PAIR_LOREM =
  "Lorem Ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis.";

const EARLY_TITLE = "Early prototyping";
const EARLY_BG = "#171717";
const EARLY_TEXT = "#ffffff";
const EARLY_BODY =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

const PAIRS = [
  { file: "01-home-feed.png", figma: "4171:49077", alt: "Home feed and nearby discovery" },
  { file: "02-nearby-saved.png", figma: "4171:48773", alt: "Nearby and saved" },
  { file: "03-booking.png", figma: "4171:48989", alt: "Booking and post-visit" },
] as const;

const SLIDER_DIR = join(ASSET_DIR, "slider");

const SLIDES = [
  { file: "01.png", figma: "4412:33475" },
  { file: "02.png", figma: "4412:33681" },
  { file: "03.png", figma: "4412:34123" },
  { file: "04.png", figma: "4412:34281" },
  { file: "05.png", figma: "4412:34552" },
  { file: "06.png", figma: "4412:34729" },
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
  sectionTitle?: string;
};

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

async function imageFor(dir: string, file: string) {
  const abs = join(dir, file);
  if (!existsSync(abs)) throw new Error(`Missing PNG: ${abs}`);
  if (DRY) {
    return {
      _type: "image" as const,
      asset: { _type: "reference" as const, _ref: "dry-run" },
    };
  }
  return uploadImage(abs);
}

async function buildKpe(_key: string) {
  const carousels = [];
  for (const spec of PAIRS) {
    const image = await imageFor(ASSET_DIR, spec.file);
    console.log(`  [KPE] ${spec.file} (${spec.figma})`);
    carousels.push({
      _type: "desktopMotionCarousel" as const,
      _key: key(),
      body: pt(PAIR_LOREM),
      slides: [
        {
          _type: "desktopMotionSlide" as const,
          _key: key(),
          alt: spec.alt,
          image,
        },
      ],
    });
  }
  return {
    _type: "desktopMotionShowcase" as const,
    _key,
    layoutVariant: "staggeredPair" as const,
    sectionTitle: KPE_TITLE,
    appearance: {
      _type: "appearance" as const,
      backgroundColor: sanityColor(KPE_BG),
      textColor: sanityColor(KPE_TEXT),
    },
    carousels,
  };
}

async function buildEarly(_key: string) {
  const slides = [];
  for (let i = 0; i < SLIDES.length; i++) {
    const spec = SLIDES[i];
    const image = await imageFor(SLIDER_DIR, spec.file);
    console.log(`  [Early ${i + 1}] ${spec.file} (${spec.figma})`);
    slides.push({
      _type: "desktopMotionSlide" as const,
      _key: key(),
      alt: `Early prototyping slide ${i + 1}`,
      image,
    });
  }
  return {
    _type: "desktopMotionShowcase" as const,
    _key,
    layoutVariant: "single" as const,
    sectionTitle: EARLY_TITLE,
    body: pt(EARLY_BODY),
    appearance: {
      _type: "appearance" as const,
      backgroundColor: sanityColor(EARLY_BG),
      textColor: sanityColor(EARLY_TEXT),
      maxWidth: "full" as const,
      tileBorderRadius: 0,
    },
    slides,
  };
}

function isKpe(s: Section) {
  return (
    s._type === "desktopMotionShowcase" &&
    s.layoutVariant === "staggeredPair" &&
    s.sectionTitle === KPE_TITLE
  );
}

function isEarly(s: Section) {
  return (
    s._type === "desktopMotionShowcase" &&
    s.layoutVariant === "single" &&
    s.sectionTitle === EARLY_TITLE
  );
}

async function patchDoc(docId: string) {
  const doc = await client.getDocument(docId);
  if (!doc) return false;

  const sections = [...((doc.sections ?? []) as Section[])];

  if (FLUID) {
    const idx = sections.findIndex((s) => isEarly(s));
    if (idx < 0) throw new Error(`${docId}: no Early prototyping section`);
    const appearance = {
      ...((sections[idx].appearance as object) ?? {}),
      maxWidth: "full",
    };
    if (!DRY) {
      await client
        .patch(docId)
        .set({ [`sections[${idx}].appearance`]: appearance })
        .commit();
    }
    console.log(`✓ ${docId}: Early prototyping maxWidth full${DRY ? " (dry)" : ""}`);
    return true;
  }

  const galleryIdx = sections.findIndex((s) => s._type === "showcaseGallery");
  const existingKpe = sections.find((s) => isKpe(s));
  const kpeKey = existingKpe?._key ?? key();
  const earlyKey = sections.find((s) => isEarly(s))?._key ?? key();

  const kpe = existingKpe ?? (await buildKpe(kpeKey));
  const early = await buildEarly(earlyKey);

  const without = sections.filter((s) => !isKpe(s) && !isEarly(s));
  const galleryAfter = without.findIndex((s) => s._type === "showcaseGallery");
  const insertAt = galleryAfter >= 0 ? galleryAfter + 1 : without.length;
  without.splice(insertAt, 0, kpe, early);

  console.log(
    `${docId}: Early prototyping single · ${SLIDES.length} slides${existingKpe ? " (KPE kept)" : ""}`,
  );
  if (!DRY) await client.patch(docId).set({ sections: without }).commit();
  console.log(`✓ ${docId}${DRY ? " (dry)" : ""}`);
  return true;
}

async function main() {
  console.log(
    `patch-circle-key-product-experiences (${DRY ? "dry" : FLUID ? "fluid" : "live"})`,
  );
  if (FLUID) {
    const patched = await patchDoc(PUB_ID);
    if (!patched) throw new Error(`Missing document ${PUB_ID}`);
    const draftId = `drafts.${PUB_ID}`;
    if (await client.getDocument(draftId)) await patchDoc(draftId);
    return;
  }
  for (const spec of SLIDES) {
    const abs = join(SLIDER_DIR, spec.file);
    if (!existsSync(abs)) throw new Error(`Missing PNG: ${abs}`);
  }
  const patched = await patchDoc(PUB_ID);
  if (!patched) throw new Error(`Missing document ${PUB_ID}`);
  const draftId = `drafts.${PUB_ID}`;
  if (await client.getDocument(draftId)) await patchDoc(draftId);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
