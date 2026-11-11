/**
 * Galderma — Final Cleanup structure (Figma 62:58416 desktop / 65:10844 mobile;
 * docs/case-studies/galderma.md). Fas, Nov 10: "get this structure ready, so we
 * can upload even if it's blank"; Xian, Nov 11: build all four.
 *
 * Adds the two bands the frame has and the live doc lacks (everything else is
 * already there):
 *   1. after Problem Context (3bc775435e82) — "Design Interventions" coverflow:
 *      showcaseGallery, Tap-to-expand off, Slider style "coverflow" (the old
 *      site's slick centre-mode slider, Figma 64:65893). Content = the old
 *      site's 7 app screens + its paragraph (fasandsabrina.com/case-studies/galderma),
 *      images from ../exports/oldsite-2026-11-11/galderma/.
 *   2. after Impact (a36309a0c8e3) — "Project Highlights" 2 × 3: highlightReel grid
 *      of six of Israel's blank placeholder mats (same asset as DVA / Acme slots
 *      5–6), teal band #8facaa (Figma 71:20672). Replace the mats in Studio.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-galderma-structure-nov11.ts --with-user-token
 *   npx sanity exec scripts/patch-galderma-structure-nov11.ts --with-user-token -- --apply
 */
import { join } from "node:path";

import { sanityColor } from "../src/lib/sanityAppearanceDefaults";
import {
  APPLY,
  BLANK_MAT_ASSET,
  OLDSITE,
  type Section,
  appearance,
  commit,
  describe,
  fetchDocs,
  image,
  insertAfter,
  key,
  pt,
  refuseIfPresent,
  showcaseItem,
} from "./lib/structure-nov11";

const DOC = "cs-galderma";
const AFTER_PROBLEM_CONTEXT = "3bc775435e82";
const AFTER_IMPACT = "a36309a0c8e3";
const DIR = join(OLDSITE, "galderma");

const DI_TITLE = "Design Interventions";
/** fasandsabrina.com/case-studies/galderma § Design Interventions */
const DI_BODY =
  "Collaborating with global educators to translate AART’s methodology into meaningful digital learning experiences. We realized that a static library of content doesn’t create clinical habits. So, we re-architected GAIN Connect using a User Engagement State framework, shifting our design goal from “organizing information” to “engineering milestones.” This strategy dictated a new Experience Design architecture: we moved from an open-access model to a Gated Progression System that forces users through specific behavioral thresholds.";
/** Old-site slider order (Galderma_DI_slider_1…10; 6–8 never existed). */
const COVERFLOW_FILES = [
  "Galderma_DI_slider_1-1-scaled.png",
  "Galderma_DI_slider_2-1-scaled.png",
  "Galderma_DI_slider_3-1-scaled.png",
  "Galderma_DI_slider_4-1-scaled.png",
  "Galderma_DI_slider_5-1.png",
  "Galderma_DI_slider_9.png",
  "Galderma_DI_slider_10.png",
];

const HL_TITLE = "Project Highlights";
const HL_BAND = "#8facaa";
const HL_MATTE = "#d9d9d9";

async function buildCoverflow(): Promise<Section> {
  const items = [];
  for (const f of COVERFLOW_FILES) items.push(showcaseItem(await image(join(DIR, f))));
  return {
    _type: "showcaseGallery",
    _key: key(),
    sectionTitle: DI_TITLE,
    introBody: pt(DI_BODY),
    expandable: false,
    sliderStyle: "coverflow",
    items,
    appearance: appearance("#171717", "#ffffff"),
  };
}

function buildHighlights(): Section {
  return {
    _type: "highlightReel",
    _key: key(),
    sectionTitle: HL_TITLE,
    layout: "grid",
    gridGap: 14,
    gridCellMatteColor: sanityColor(HL_MATTE),
    cells: Array.from({ length: 6 }, () => ({
      _type: "highlightCell",
      _key: key(),
      frames: [{ _type: "image", _key: key(), asset: { _type: "reference", _ref: BLANK_MAT_ASSET } }],
    })),
    appearance: appearance(HL_BAND, "#171717"),
  };
}

async function main() {
  console.log(`patch-galderma-structure-nov11 (${APPLY ? "APPLY" : "dry"})`);
  const docs = await fetchDocs(DOC);
  for (const d of docs) refuseIfPresent(d, [DI_TITLE, HL_TITLE], ["highlightReel"]);

  const coverflow = await buildCoverflow();
  const highlights = buildHighlights();
  const added = new Set([coverflow._key, highlights._key]);

  const plan = docs.map((doc) => {
    let sections = insertAfter(doc.sections, AFTER_PROBLEM_CONTEXT, [coverflow]);
    sections = insertAfter(sections, AFTER_IMPACT, [highlights]);
    console.log(`\n${doc._id} (rev ${doc._rev}): ${doc.sections.length} → ${sections.length} sections`);
    console.log(describe(sections, added));
    return { doc, sections };
  });
  console.log(`\ncoverflow: ${COVERFLOW_FILES.length} screens · highlights: 6 blank mats (${BLANK_MAT_ASSET})`);
  await commit("galderma-structure-nov11", plan);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
