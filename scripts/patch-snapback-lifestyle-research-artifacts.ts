/**
 * Snapback Lifestyle Research Artifacts — 4 Figma slides @4×
 * (band `4152:143874`; slides `4152:137236`, `137709`, `137721`, `137728`).
 *
 * Black expandable 3-up slider. Intro from live WP concept-design copy (ignore Figma lorem).
 *
 * PNG: public/work/snapback-lifestyle/research-artifacts/01–04-*.png
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-snapback-lifestyle-research-artifacts.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-snapback-lifestyle-research-artifacts.ts --with-user-token
 *
 * Do not re-run after manual Studio image uploads.
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import { sanityColor } from "../src/lib/sanityAppearanceDefaults";
import { generatedCaseStudies } from "../src/lib/case-studies.generated";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const SLUG = "snapback-lifestyle";
const ART_DIR = join(process.cwd(), "public/work/snapback-lifestyle/research-artifacts");
const SECTION_TITLE = "Research Artifacts";

/** Figma 4152:143874 band */
const BAND_BG = "#171717";
const TEXT = "#ffffff";

const conceptGallery = generatedCaseStudies[SLUG].extraGalleries?.find(
  (g) => g.heading === "Concept Design",
);
const INTRO = conceptGallery?.body?.trim();

/** Order matches Figma nodes Fas sent. */
const ARTIFACTS = [
  {
    file: "01-watch-design-interchangeability.png",
    caption: "Watch design & interchangeability",
    figma: "4152:137236",
  },
  {
    file: "02-watch-band-configurations.png",
    caption: "Watch band configurations",
    figma: "4152:137709",
  },
  {
    file: "03-lifestyle-spring-pins.png",
    caption: "Spring pins for interchangeability",
    figma: "4152:137721",
  },
  {
    file: "04-lifestyle-adjustable-snap.png",
    caption: "Adjustable snap & round edges",
    figma: "4152:137728",
  },
] as const;

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

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
  };
}

type ShowcaseItem = {
  _key: string;
  _type: string;
  caption?: string;
  image?: unknown;
  expandImage?: unknown;
};

type Section = Record<string, unknown> & {
  _key: string;
  _type: string;
  sectionTitle?: string;
  items?: ShowcaseItem[];
};

function researchIdx(sections: Section[]) {
  const titled = sections.findIndex(
    (s) => s._type === "showcaseGallery" && s.sectionTitle === SECTION_TITLE,
  );
  if (titled >= 0) return titled;
  return sections.findIndex((s) => s._type === "showcaseGallery");
}

async function buildItems() {
  const items = [];
  for (let i = 0; i < ARTIFACTS.length; i++) {
    const spec = ARTIFACTS[i];
    const abs = join(ART_DIR, spec.file);
    if (!existsSync(abs)) throw new Error(`Missing PNG: ${abs}`);
    const image = DRY
      ? { _type: "image", asset: { _type: "reference", _ref: "dry-run" } }
      : await uploadImage(abs);
    items.push({
      _type: "showcaseItem" as const,
      _key: key(),
      caption: spec.caption,
      image,
      expandImage: image,
      order: i + 1,
    });
    console.log(`  [${i + 1}] ${spec.caption} ← ${spec.file} (${spec.figma})`);
  }
  return items;
}

async function patchDoc(docId: string) {
  const doc = await client.fetch<{ sections: Section[] }>(
    `*[_id == $id][0]{ sections }`,
    { id: docId },
  );
  if (!doc?.sections?.length) throw new Error(`${docId}: no sections`);

  const idx = researchIdx(doc.sections);
  if (idx < 0) throw new Error(`${docId}: no showcaseGallery`);

  const before = doc.sections[idx].items?.length ?? 0;
  console.log(
    `${docId} showcaseGallery[${idx}] "${doc.sections[idx].sectionTitle ?? ""}" — ${before} item(s)`,
  );

  const items = await buildItems();
  const patch: Record<string, unknown> = {
    [`sections[${idx}].sectionTitle`]: SECTION_TITLE,
    [`sections[${idx}].expandable`]: true,
    [`sections[${idx}].items`]: items,
    [`sections[${idx}].appearance.backgroundColor`]: sanityColor(BAND_BG),
    [`sections[${idx}].appearance.textColor`]: sanityColor(TEXT),
  };
  if (INTRO) patch[`sections[${idx}].introBody`] = pt(INTRO);

  if (DRY) {
    console.log(`(dry run) → ${SECTION_TITLE}, ${before} → ${items.length} slide(s)`);
    return;
  }

  await client.patch(docId).set(patch).commit();
  console.log(`✓ ${docId}: Research Artifacts — ${before} → ${items.length} slide(s)`);
}

async function main() {
  console.log(`patch-snapback-lifestyle-research-artifacts (${DRY ? "dry" : "live"})`);

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
