/**
 * Circle Research Artifacts — 4 slides (Figma band `4171:33016`).
 *
 * Black expandable 3-up. Intro is the frame lorem under the slider.
 * Slides @4×:
 *   4411:32058 Mosaic’s Business Goal
 *   4411:32097 UX KPI’s
 *   4411:32130 Three Directions Considered
 *   4411:32163 One loop. Three actors.
 *
 * Inserts `showcaseGallery` after My Approach when the section was removed.
 * Band `#171717`, text white, slider gap 40.
 *
 * PNG: public/work/circle/research-artifacts/01–04-*.png
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-circle-research-artifacts.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-circle-research-artifacts.ts --with-user-token
 *
 * Do not re-run after manual Studio image uploads.
 *   npx sanity exec scripts/patch-circle-research-artifacts.ts --with-user-token -- --copy-only
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

import collab from "./data/caseStudyCollabCopy.json";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const COPY_ONLY = process.argv.includes("--copy-only");
const SLUG = "circle";
const ART_DIR = join(process.cwd(), "public/work/circle/research-artifacts");
const SECTION_TITLE = "Research Artifacts";

/** Figma 4171:33016 */
const BAND_BG = "#171717";
const TEXT = "#ffffff";
const SLIDER_GAP = 40;

const INTRO_DEFAULT =
  "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut.";

const introFromCollab = (
  collab[SLUG as keyof typeof collab] as { artifacts?: { intro?: string } }
)?.artifacts?.intro?.trim();

const INTRO = introFromCollab || INTRO_DEFAULT;

const ARTIFACTS = [
  { file: "01-business-goal.png", caption: "Mosaic’s Business Goal", figma: "4411:32058" },
  { file: "02-ux-kpis.png", caption: "UX KPI’s: Defining Design Success", figma: "4411:32097" },
  { file: "03-three-directions.png", caption: "Three Directions Considered", figma: "4411:32130" },
  { file: "04-value-loop.png", caption: "One loop. Three actors.", figma: "4411:32163" },
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

type Section = {
  _key: string;
  _type: string;
  sectionTitle?: string;
};

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

async function ensureSection(docId: string) {
  const doc = await client.getDocument(docId);
  if (!doc) return -1;
  const sections = (doc.sections ?? []) as Section[];
  const existing = sections.findIndex(
    (s) => s._type === "showcaseGallery" && s.sectionTitle === SECTION_TITLE,
  );
  if (existing >= 0) return existing;
  const anyGallery = sections.findIndex((s) => s._type === "showcaseGallery");
  if (anyGallery >= 0) return anyGallery;

  const after = sections.find((s) => s._type === "accordionSection");
  if (!after) throw new Error(`${docId}: no accordionSection to insert after`);

  console.log(`→ insert showcaseGallery after accordion on ${docId}`);
  if (DRY) return sections.findIndex((s) => s._key === after._key) + 1;

  await client
    .patch(docId)
    .insert("after", `sections[_key=="${after._key}"]`, [
      {
        _key: key(),
        _type: "showcaseGallery",
        sectionTitle: SECTION_TITLE,
        expandable: true,
      },
    ])
    .commit();

  const next = await client.getDocument(docId);
  const idx = ((next?.sections ?? []) as Section[]).findIndex(
    (s) => s._type === "showcaseGallery",
  );
  if (idx < 0) throw new Error(`${docId}: insert did not land`);
  return idx;
}

async function patchDoc(docId: string, items: Awaited<ReturnType<typeof buildItems>>) {
  const idx = await ensureSection(docId);
  if (idx < 0) return;
  console.log(`→ patch ${docId} showcaseGallery[${idx}]${COPY_ONLY ? " intro only" : ` (${items.length} slides)`}`);
  if (DRY) return;

  if (COPY_ONLY) {
    await client
      .patch(docId)
      .set({ [`sections[${idx}].introBody`]: pt(INTRO) })
      .commit();
    return;
  }

  await client
    .patch(docId)
    .set({
      [`sections[${idx}].sectionTitle`]: SECTION_TITLE,
      [`sections[${idx}].expandable`]: true,
      [`sections[${idx}].sliderGap`]: SLIDER_GAP,
      [`sections[${idx}].introBody`]: pt(INTRO),
      [`sections[${idx}].items`]: items,
      [`sections[${idx}].appearance.backgroundColor`]: sanityColor(BAND_BG),
      [`sections[${idx}].appearance.textColor`]: sanityColor(TEXT),
    })
    .commit();
}

async function main() {
  console.log(
    `patch-circle-research-artifacts (${DRY ? "dry" : "live"}${COPY_ONLY ? ", copy-only" : ""})`,
  );
  const items = COPY_ONLY ? [] : await buildItems();

  const pub = await client.fetch<{ _id: string } | null>(
    `*[_type == "caseStudy" && slug.current == $slug && !(_id in path("drafts.**"))][0]{ _id }`,
    { slug: SLUG },
  );
  if (!pub?._id) throw new Error(`Missing published ${SLUG}`);

  await patchDoc(pub._id, items);

  const draftId = `drafts.${pub._id}`;
  if (await client.getDocument(draftId)) {
    await patchDoc(draftId, items);
  }

  if (DRY) {
    console.log("(dry run — no writes)");
    return;
  }
  console.log(
    `✓ Circle Research Artifacts${COPY_ONLY ? " intro" : ` (${items.length} slides)`}, ${BAND_BG})`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
