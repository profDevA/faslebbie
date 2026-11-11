/**
 * Life of a Miner VR — Final Cleanup structure (Figma 618:21376 desktop /
 * 618:19256 mobile; docs/case-studies/life-of-a-miner-vr.md). Fas, Nov 10:
 * "this is the feature we're doing… get this structure ready, so we can upload
 * even if it's blank"; Xian, Nov 11: build all four.
 *
 * Adds the four bands the frame has and the live doc lacks:
 *   1. after Problem Context (a44239a58df2) — the centred card slider
 *      (Figma 618:21805, horizonx.so "Virtual Try-On App"): showcaseGallery,
 *      Tap-to-expand off, Slider style "cards", brown band #906952, padding
 *      163 / 118. Content = the old site's 12 VR screens (Root-VR_DI_slider_*,
 *      the "two rows of stills" Fas starred) — ../exports/oldsite-2026-11-11/.
 *   2. after Design Process (1567000bf2e5) — "Research Artifacts": the six
 *      artifact cards from Figma 550:35316 (3-up expandable slider).
 *   3. "VR Journey" — the old site's storyboard (Root-VR_BI) as a
 *      desktopMotionShowcase "Large device, caption below", tan #ac8e7d.
 *   4. "Design Interventions" — interventionGrid 2 × 3 of blank placeholder mats
 *      (Figma 618:21960), tan #c7b4a9. Replace the mats in Studio.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-life-of-a-miner-structure-nov11.ts --with-user-token
 *   npx sanity exec scripts/patch-life-of-a-miner-structure-nov11.ts --with-user-token -- --apply
 */
import { join } from "node:path";

import {
  APPLY,
  BLANK_MAT_ASSET,
  OLDSITE,
  type Section,
  appearance,
  assetRef,
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

const DOC = "cs-life-of-a-miner-vr";
const AFTER_PROBLEM_CONTEXT = "a44239a58df2";
const AFTER_DESIGN_PROCESS = "1567000bf2e5";
const DIR = join(OLDSITE, "life-of-a-miner-vr");

/** Old-site Design Interventions grid order. */
const VR_SCREENS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) =>
  n === 5 ? "Root-VR_DI_slider_5.png" : `Root-VR_DI_slider_${n}.Jpg.png`,
);

const RA_TITLE = "Research Artifacts";
/** Figma 550:35316 cards, exported Nov 11 (4× PNG). */
const ARTIFACTS: { file: string; caption?: string }[] = [
  { file: "01-sensory-design-framework.png", caption: "Sensory Design Framework" },
  { file: "02-diegetic-non-diegetic-visuals.png", caption: "Diegetic & Non-Diegetic Visuals" },
  { file: "03-ecosystem-map.png", caption: "Ecosystem Map" },
  { file: "04-artifact-four.png" },
  { file: "05-inputs-outputs-outcomes.png", caption: "Inputs, Outputs, Outcomes & Goals" },
  { file: "06-baseline-design-research.png", caption: "Baseline Information & Design Research" },
];

const JOURNEY_TITLE = "VR Journey";
/** fasandsabrina.com/case-studies/life-of-a-miner-vr § VR Journey */
const JOURNEY_CAPTION =
  "Storyboard visualizes Root VR’s immersive mining journey, users embody miners’ choices from onboarding to diamond discovery.";

const DI_TITLE = "Design Interventions";
/** fasandsabrina.com/case-studies/life-of-a-miner-vr § Design Interventions */
const DI_BODY =
  "The “Life of a Miner” VR experience immerses users in the daily reality of a Sierra Leone diamond miner. Participants make crucial decisions, like selling possessions for tools and choosing digging locations, while experiencing haptic feedback that simulates tool weight and harsh conditions. Authentic sounds and accurate weights enhance realism. The journey also illustrates the complex process from diamond extraction to market, offering users a visceral understanding of the challenges miners face in sacrifice zones.";

async function buildCards(): Promise<Section> {
  const items = [];
  for (const f of VR_SCREENS) items.push(showcaseItem(await image(join(DIR, f))));
  return {
    _type: "showcaseGallery",
    _key: key(),
    expandable: false,
    sliderStyle: "cards",
    items,
    // Figma 618:21805: band 867 tall, card top at 162.5, controls end at 749.5.
    appearance: appearance("#906952", "#171717", { paddingTop: 163, paddingBottom: 118 }),
  };
}

async function buildArtifacts(): Promise<Section> {
  const items = [];
  for (const a of ARTIFACTS) items.push(showcaseItem(await image(join(DIR, "artifacts", a.file)), a.caption));
  return {
    _type: "showcaseGallery",
    _key: key(),
    sectionTitle: RA_TITLE,
    expandable: true,
    sliderGap: 20,
    items,
    appearance: appearance("#171717", "#ffffff"),
  };
}

async function buildJourney(): Promise<Section> {
  return {
    _type: "desktopMotionShowcase",
    _key: key(),
    layoutVariant: "captionBelow",
    sectionTitle: JOURNEY_TITLE,
    caption: JOURNEY_CAPTION,
    posterImage: await image(join(DIR, "Root-VR_BI.Jpg.png")),
    // Figma 618:21949: 1008-wide art, square corners.
    appearance: appearance("#ac8e7d", "#171717", { tileBorderRadius: 0, containerMaxWidth: 1008 }),
  };
}

function buildGrid(): Section {
  return {
    _type: "interventionGrid",
    _key: key(),
    sectionTitle: DI_TITLE,
    introBody: pt(DI_BODY),
    items: Array.from({ length: 6 }, () => showcaseItem(assetRef(BLANK_MAT_ASSET))),
    initialVisibleCount: 6,
    readMoreLabel: "View All",
    appearance: appearance("#c7b4a9", "#171717"),
  };
}

async function main() {
  console.log(`patch-life-of-a-miner-structure-nov11 (${APPLY ? "APPLY" : "dry"})`);
  const docs = await fetchDocs(DOC);
  for (const d of docs)
    refuseIfPresent(d, [RA_TITLE, JOURNEY_TITLE, DI_TITLE], ["showcaseGallery", "interventionGrid", "desktopMotionShowcase"]);

  const cards = await buildCards();
  const artifacts = await buildArtifacts();
  const journey = await buildJourney();
  const grid = buildGrid();
  const added = new Set([cards._key, artifacts._key, journey._key, grid._key]);

  const plan = docs.map((doc) => {
    let sections = insertAfter(doc.sections, AFTER_PROBLEM_CONTEXT, [cards]);
    sections = insertAfter(sections, AFTER_DESIGN_PROCESS, [artifacts, journey, grid]);
    console.log(`\n${doc._id} (rev ${doc._rev}): ${doc.sections.length} → ${sections.length} sections`);
    console.log(describe(sections, added));
    return { doc, sections };
  });
  console.log(
    `\ncards: ${VR_SCREENS.length} VR screens · artifacts: ${ARTIFACTS.length} · journey: storyboard · grid: 6 blank mats`,
  );
  await commit("life-of-a-miner-structure-nov11", plan);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
