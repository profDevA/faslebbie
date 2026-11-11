/**
 * Vuforia Editor (vuforia-expert-capture) — Final Cleanup structure (Figma
 * 194:16228 desktop / 194:13738 mobile, the orange "Section 8" frame;
 * docs/case-studies/vuforia-expert-capture.md). Israel, Nov 10: "everything needs
 * to update"; Fas: structure first, blank where assets are missing.
 *
 * Adds the seven bands the frame has and the live doc lacks:
 *   1. after Problem Context (98b87dd9d6a4) — "Design Process" split accordion
 *      with the four Coral process titles (no body yet; grey panel #bdbdbd).
 *   After Research Artifacts (22eba6806493), in Figma order:
 *   2. "Vuforia Editor Demo" — laptop art + caption (old site's demo frame; the
 *      video comes from Sakib), light grey #dedede.
 *   3. "Expert Capture Flow" — coreExperience desktop grid, 6 old-site tab
 *      screens + View All popup with the same 6, pale green #e6ece8, grey mats.
 *   4. "Speech to Text" — laptop art (old tab screen) + title, #dedede.
 *   5. "Speech to Text" — interventionGrid 2 × 2 on the page (6 old tab screens,
 *      4 visible + View All), #e6ece8.
 *   6. "Versioning & Approval" — laptop art + title, light blue #e9eef7.
 *   7. "Versioning & Approval" — coreExperience desktop grid: first 6 of the old
 *      tab's 31 screens on the page, all 31 in the View All popup (tracker rows
 *      119–120). The redesign lives in Figma file ERHTiq3AHsc610YBAUd1Xr (no
 *      access yet) — swap the screens in Studio when it lands.
 * Images: frontend/public/work/vuforia-expert-capture/ (July extract) and
 * ../exports/oldsite-2026-11-11/vuforia-expert-capture/ (demo frame).
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-vuforia-editor-structure-nov11.ts --with-user-token
 *   npx sanity exec scripts/patch-vuforia-editor-structure-nov11.ts --with-user-token -- --apply
 */
import { join } from "node:path";

import { ACCORDION_APPEARANCE_DEFAULTS, sanityColor } from "../src/lib/sanityAppearanceDefaults";
import {
  APPLY,
  OLDSITE,
  WORK,
  type ImageRef,
  type Section,
  appearance,
  ceScreen,
  commit,
  describe,
  fetchDocs,
  galleryItem,
  image,
  insertAfter,
  key,
  pt,
  refuseIfPresent,
  showcaseItem,
} from "./lib/structure-nov11";

const DOC = "cs-vuforia-expert-capture";
const AFTER_PROBLEM_CONTEXT = "98b87dd9d6a4";
const AFTER_RESEARCH_ARTIFACTS = "22eba6806493";
const DIR = join(WORK, "vuforia-expert-capture");
const DEMO_FRAME = join(OLDSITE, "vuforia-expert-capture", "Frame-1171276928-1.png");

const PROCESS_TITLE = "Design Process";
const PROCESS_ITEMS = [
  "Baseline Information",
  "Design Research & Strategy",
  "Summary of Findings",
  "Prototyping & Implementation Strategy",
];

const DEMO_TITLE = "Vuforia Editor Demo";
/** fasandsabrina.com/case-studies/vuforia-expert-capture § Vuforia Editor Demo */
const DEMO_CAPTION =
  "Demonstrates the design workflow from raw AR captures into structured, compliant procedures.";

const ECF_TITLE = "Expert Capture Flow";
/** Old site § Featured Designs intro (covers all three tabs). */
const FEATURED_BODY =
  "In this case study, I outlined 3 feature solutions delivered within the Vuforia Editor, including a Timeline Interface for capture flow to structure raw video and an AI-driven “harvesting” workflow that instantly converts voiceovers into text, eliminating manual entry. Additionally, I implemented a rigorous “release candidate” governance lifecycle to ensure audit compliance through versioning and approval workflows. This turned raw, messy data into the trusted, compliant assets required by regulated enterprises.";
/** Old site tab "Expert Capture Flow" (mobile-view block). */
const ECF_FILES = ["1445-4.png", "1446-3.png", "1447-4.png", "17-1.png", "1448-3.png", "16-1.png"];

const STT_TITLE = "Speech to Text";
/** Old site tab "Speech to Text" (ipad-view block). */
const STT_FILES = ["1441-3.png", "1442-2.png", "1443-3.png", "1444-2.png", "13-8.png", "14-6.png"];

const VA_TITLE = "Versioning & Approval";
/** Old site tab "Versioning & Approval" (desktop-view block), 31 screens. */
const VA_FILES = [
  "ST_DI_slider_1.Jpg-1-scaled.png",
  "ST_DI_slider_1.Jpg-1-1-scaled.png",
  ...Array.from({ length: 29 }, (_, i) => `ST_DI_slider_1.Jpg-${i + 2}-scaled.png`),
];

const GRID_BAND = "#e6ece8";
const GRID_MAT = "#c2c7ce";
const LAPTOP_BAND = "#dedede";
const VA_BAND = "#e9eef7";

function laptopBand(title: string, poster: ImageRef, bg: string, caption?: string): Section {
  return {
    _type: "desktopMotionShowcase",
    _key: key(),
    layoutVariant: "captionBelow",
    sectionTitle: title,
    ...(caption ? { caption } : {}),
    posterImage: poster,
    // Figma laptops ~1020 wide with their own chrome: square, no extra frame.
    appearance: appearance(bg, "#171717", { tileBorderRadius: 0, containerMaxWidth: 1020 }),
  };
}

function ceGrid(title: string, preview: ImageRef[], popup: ImageRef[], body?: string): Section {
  return {
    _type: "coreExperience",
    _key: key(),
    sectionTitle: title,
    ...(body ? { body: pt(body) } : {}),
    layoutVariant: "desktopGrid",
    previewColumns: 2,
    previewRowStagger: 0,
    previewScreens: preview.map(ceScreen),
    viewMoreLabel: "View All",
    popupItemsBeforeViewMore: 6,
    popupTabs: [{ _type: "deviceTab", _key: key(), label: title, items: popup.map((img) => galleryItem(img)) }],
    appearance: appearance(GRID_BAND, "#171717", { contentAlignment: "center" }),
    previewAppearance: {
      _type: "appearance",
      tileBackgroundColor: sanityColor(GRID_MAT),
      contentGap: 43,
      contentGapInner: 87,
    },
  };
}

function buildAccordion(): Section {
  return {
    _type: "accordionSection",
    _key: key(),
    variant: "split",
    sectionTitle: PROCESS_TITLE,
    sideTitle: "My Approach",
    accordionBackgroundColor: sanityColor("#bdbdbd"),
    items: PROCESS_ITEMS.map((title, i) => ({ _type: "accordionItem", _key: key(), title, defaultOpen: i === 0 })),
    appearance: { _type: "appearance", ...ACCORDION_APPEARANCE_DEFAULTS },
  };
}

async function main() {
  console.log(`patch-vuforia-editor-structure-nov11 (${APPLY ? "APPLY" : "dry"})`);
  const docs = await fetchDocs(DOC);
  for (const d of docs)
    refuseIfPresent(
      d,
      [PROCESS_TITLE, DEMO_TITLE, ECF_TITLE, STT_TITLE, VA_TITLE],
      ["accordionSection", "coreExperience", "interventionGrid", "desktopMotionShowcase"],
    );

  const ecf: ImageRef[] = [];
  for (const f of ECF_FILES) ecf.push(await image(join(DIR, f)));
  const stt: ImageRef[] = [];
  for (const f of STT_FILES) stt.push(await image(join(DIR, f)));
  const va: ImageRef[] = [];
  for (const f of VA_FILES) va.push(await image(join(DIR, f)));

  const accordion = buildAccordion();
  const bands: Section[] = [
    laptopBand(DEMO_TITLE, await image(DEMO_FRAME), LAPTOP_BAND, DEMO_CAPTION),
    ceGrid(ECF_TITLE, ecf, ecf, FEATURED_BODY),
    laptopBand(STT_TITLE, stt[0], LAPTOP_BAND),
    {
      _type: "interventionGrid",
      _key: key(),
      sectionTitle: STT_TITLE,
      items: stt.map((img) => showcaseItem(img)),
      initialVisibleCount: 4,
      readMoreLabel: "View All",
      appearance: appearance(GRID_BAND, "#171717"),
    },
    laptopBand(VA_TITLE, va[0], VA_BAND),
    ceGrid(VA_TITLE, va.slice(0, 6), va),
  ];
  const added = new Set([accordion._key, ...bands.map((b) => b._key)]);

  const plan = docs.map((doc) => {
    let sections = insertAfter(doc.sections, AFTER_PROBLEM_CONTEXT, [accordion]);
    sections = insertAfter(sections, AFTER_RESEARCH_ARTIFACTS, bands);
    console.log(`\n${doc._id} (rev ${doc._rev}): ${doc.sections.length} → ${sections.length} sections`);
    console.log(describe(sections, added));
    return { doc, sections };
  });
  console.log(
    `\naccordion: ${PROCESS_ITEMS.length} titles · ECF: ${ecf.length} · STT: ${stt.length} · VA: ${va.length} (6 on page) · demo frame`,
  );
  await commit("vuforia-editor-structure-nov11", plan);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
