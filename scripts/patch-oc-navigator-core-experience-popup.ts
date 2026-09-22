/**
 * OC Resource Navigator §04 View More popup — 12-tile flow grid
 * (Figma 4152:79507).
 *
 * Single tab (tab bar hidden). All 12 visible (no Load More).
 * Leftover Foam “DESIGN INTERVENTIONS” / exhibition lorem ignored.
 * Intro from collab overview, not Figma lorem.
 *
 * PNG source: public/work/oc-digital-resource-navigator/core-flow/modal/
 *   01 — 4152:79517 home
 *   02 — 4162:22664 assessment intro
 *   03 — 4152:79593 assessment form
 *   04 — 4152:79615 confirm information
 *   05 — 4152:79648 assessment results
 *   06 — 4152:79729 housing results
 *   07 — 4152:80095 housing list
 *   08 — 4152:80468 resource detail
 *   09 — 4152:80564 search results
 *   10 — 4152:80659 mobile assessment pair
 *   11 — 4152:80724 mobile results pair
 *   12 — 4152:80840 mobile detail pair
 *
 * Band previewScreens unchanged — patch-oc-navigator-core-experience.ts.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-oc-navigator-core-experience-popup.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-oc-navigator-core-experience-popup.ts --with-user-token
 *   npx sanity exec scripts/patch-oc-navigator-core-experience-popup.ts --with-user-token -- --appearance-only
 *
 * Do not re-run full patch after manual Studio image uploads.
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const APPEARANCE_ONLY = process.argv.includes("--appearance-only");
const SLUG = "oc-digital-resource-navigator";
const MODAL_DIR = join(
  process.cwd(),
  "public/work/oc-digital-resource-navigator/core-flow/modal",
);

/** Figma 4152:79507 page fill / plate (sampled). */
const POPUP_BG = "#fce9ca";
const POPUP_TILE_BG = "#e1ad89";
const TEXT = "#231e1e";

const INTRO =
  "OC Navigator is a digital platform integrating physical, mental, and social health factors so residents aren't forced to retell their story across disconnected agencies. The core flow takes someone from discovering local services through a needs assessment to tailored recommendations and a trusted provider they can actually connect with.";

const GRID = [
  { file: "01-home.png", figma: "4152:79517" },
  { file: "02-assessment-intro.png", figma: "4162:22664" },
  { file: "03-assessment-form.png", figma: "4152:79593" },
  { file: "04-confirm-information.png", figma: "4152:79615" },
  { file: "05-assessment-results.png", figma: "4152:79648" },
  { file: "06-housing-results.png", figma: "4152:79729" },
  { file: "07-housing-list.png", figma: "4152:80095" },
  { file: "08-resource-detail.png", figma: "4152:80468" },
  { file: "09-search-results.png", figma: "4152:80564" },
  { file: "10-mobile-assessment.png", figma: "4152:80659" },
  { file: "11-mobile-results.png", figma: "4152:80724" },
  { file: "12-mobile-detail.png", figma: "4152:80840" },
] as const;

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

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

function ceIdx(sections: { _type: string }[]) {
  return sections.findIndex((s) => s._type === "coreExperience");
}

function popupAppearance(existing?: Record<string, unknown>) {
  return {
    ...(existing ?? {}),
    _type: "appearance",
    backgroundColor: sanityColor(POPUP_BG),
    textColor: sanityColor(TEXT),
    contentAlignment: "left",
    tileBackgroundColor: sanityColor(POPUP_TILE_BG),
    contentGap: 43,
    contentGapInner: 87,
  };
}

async function buildItems() {
  const items = [];
  for (const row of GRID) {
    const abs = join(MODAL_DIR, row.file);
    if (!existsSync(abs)) throw new Error(`Missing PNG: ${abs}`);
    console.log(`${DRY ? "○" : "↑"} ${row.file} (${row.figma})`);
    items.push({
      _key: key(),
      _type: "galleryItem" as const,
      image: DRY
        ? { _type: "image", asset: { _type: "reference", _ref: "dry-run" } }
        : await uploadImage(abs),
    });
  }
  return items;
}

async function patchDoc(
  docId: string,
  idx: number,
  items?: Awaited<ReturnType<typeof buildItems>>,
) {
  const doc = await client.getDocument(docId);
  if (!doc) return;
  const section = (doc.sections ?? [])[idx] as
    | { popupAppearance?: Record<string, unknown> }
    | undefined;
  const appearance = popupAppearance(section?.popupAppearance);

  if (APPEARANCE_ONLY) {
    if (DRY) {
      console.log(`dry-run ${docId}: appearance-only bg=${POPUP_BG} tile=${POPUP_TILE_BG}`);
      return;
    }
    await client
      .patch(docId)
      .set({ [`sections[${idx}].popupAppearance`]: appearance })
      .commit();
    console.log(`✓ ${docId}: OC Navigator CE popup appearance`);
    return;
  }

  if (!items) throw new Error("items required");

  const popupBody = [
    {
      _type: "block",
      _key: key(),
      style: "normal",
      markDefs: [],
      children: [{ _type: "span", _key: key(), text: INTRO, marks: [] }],
    },
  ];

  const popupTabs = [
    {
      _key: key(),
      _type: "deviceTab" as const,
      label: "Flow screens",
      items,
    },
  ];

  const patch = {
    [`sections[${idx}].popupTitle`]: "Core Experience Flow",
    [`sections[${idx}].popupBody`]: popupBody,
    [`sections[${idx}].popupTabs`]: popupTabs,
    [`sections[${idx}].popupItemsBeforeViewMore`]: 12,
    [`sections[${idx}].popupLoadMoreLabel`]: "Load More",
    [`sections[${idx}].viewMoreLabel`]: "View More",
    [`sections[${idx}].popupAppearance`]: appearance,
  };

  if (DRY) {
    console.log(`dry-run ${docId}: popupTabs=1 items=${items.length}`);
    return;
  }

  await client
    .patch(docId)
    .set(patch)
    .unset([`sections[${idx}].popupScreens`])
    .commit();
  console.log(`✓ ${docId}: OC Navigator CE popup (${items.length} tiles)`);
}

async function main() {
  console.log(
    `patch-oc-navigator-core-experience-popup (${DRY ? "dry" : APPEARANCE_ONLY ? "appearance-only" : "live"})`,
  );

  const pub = await client.fetch<{ _id: string; sections: { _type: string }[] }>(
    `*[_type == "caseStudy" && slug.current == $slug && !(_id in path("drafts.**"))][0]{
      _id, sections[]{ _type }
    }`,
    { slug: SLUG },
  );
  if (!pub?.sections?.length) throw new Error(`Missing published ${SLUG}`);

  const idx = ceIdx(pub.sections);
  if (idx < 0) throw new Error("No coreExperience section");
  console.log(`doc ${pub._id} coreExperience[${idx}]`);

  const items = APPEARANCE_ONLY ? undefined : await buildItems();

  console.log(`→ patch ${pub._id}`);
  await patchDoc(pub._id, idx, items);

  const draftId = `drafts.${pub._id}`;
  if (await client.getDocument(draftId)) {
    console.log(`→ sync ${draftId}`);
    await patchDoc(draftId, idx, items);
  }

  if (DRY) {
    console.log("(dry run — no writes)");
    return;
  }

  console.log("✓ OC Resource Navigator Core Experience popup patched");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
