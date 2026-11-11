/**
 * Vuforia Chalk — Final Cleanup structure (Figma 51:142711 desktop / 51:145848
 * mobile; docs/case-studies/vuforia-chalk.md; Nov 4 V2 = "slider band + 2-col
 * screen grid with View All + second band"). Fas, Nov 10: structure first.
 *
 * Adds the four bands the frame has and the live doc lacks, after Research
 * Artifacts (0e9d75a7fad0), in Figma order:
 *   1. "Hands-Free AR Support" — old-site RealWear photo + caption, light blue
 *      #e9eef7 (Figma 51:142963).
 *   2. "Featured Designs" (RealWear) — interventionGrid, the 12 old RealWear flow
 *      cards, 6 on the page + View All, sage #d6e0d8 (51:142982). Same 12 cards
 *      as the live Research Artifacts slider — Fas to give that band real artifacts.
 *   3. "Chalk Mobile Support" — old-site mobile composite + caption, #e9eef7
 *      (51:143364).
 *   4. "Featured Designs" (Chalk mobile) — interventionGrid, the 19 old mobile
 *      flow cards, 6 on the page + View All, grey #bfbfbf (51:143424).
 * Images: frontend/public/work/vuforia-chalk/ (July extract). The brand video
 * for the overview (V1, vimeo 1073699984) is still Sakib's.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-vuforia-chalk-structure-nov11.ts --with-user-token
 *   npx sanity exec scripts/patch-vuforia-chalk-structure-nov11.ts --with-user-token -- --apply
 */
import { join } from "node:path";

import {
  APPLY,
  WORK,
  type ImageRef,
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

const DOC = "cs-vuforia-chalk";
const AFTER_RESEARCH_ARTIFACTS = "0e9d75a7fad0";
const DIR = join(WORK, "vuforia-chalk");

const HANDSFREE_TITLE = "Hands-Free AR Support";
/** fasandsabrina.com/case-studies/vuforia-chalk § Hands-Free AR Support */
const HANDSFREE_CAPTION =
  "Chalk for RealWear increases workplace productivity and safety with hands-free remote assistance so your frontline employees can focus on getting the job done quickly and efficiently.";

const FEATURED_TITLE = "Featured Designs";
/** Old site § Featured Designs (RealWear) */
const REALWEAR_BODY =
  "To address input paralysis, I contributed to the design of a voice-first user experience to reduce voice fatigue. We overhauled the standard input interactions with a phonetic soft keyboard (e.g., “Alpha, Bravo”). This replaced error-prone natural speech with precise, military-grade commands that work in high-decibel environments. Additionally, we flattened nested menus into high-contrast tiles, ensuring that every visible function was an instant, pronounceable command.";
const REALWEAR_FILES = Array.from({ length: 12 }, (_, i) => `VCR_DI_slider_${i + 1}.Jpg.png`);

const MOBILE_SUPPORT_TITLE = "Chalk Mobile Support";
/** Old site § Chalk Mobile Support */
const MOBILE_SUPPORT_CAPTION =
  "Supporting technicians with live AR remote guidance make it possible for users to realize the potential of combining augmented reality with remote assistance.";
/** Old site § Featured Designs (Chalk mobile) */
const MOBILE_BODY =
  "For Chalk mobile, I helped design a Multi-Expert Session Architecture that transformed the app into a secure command center. Introducing a strict Host/Participant hierarchy with Lobbies and Waiting Rooms empowered users to manage access and direct video broadcasting during complex group calls.";
/** 20 tiles on the old site; slide 18 never existed. */
const MOBILE_FILES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 19, 20].map(
  (n) => `VCA_DI_slider_${n}.Jpg.png`,
);

const PHOTO_BAND = "#e9eef7";
const REALWEAR_BAND = "#d6e0d8";
const MOBILE_BAND = "#bfbfbf";

function photoBand(title: string, poster: ImageRef, caption: string): Section {
  return {
    _type: "desktopMotionShowcase",
    _key: key(),
    layoutVariant: "captionBelow",
    sectionTitle: title,
    caption,
    posterImage: poster,
    // Figma 51:142963 / 51:143364: 1032-wide art, square corners, drop shadow.
    appearance: appearance(PHOTO_BAND, "#171717", { tileBorderRadius: 0, containerMaxWidth: 1032 }),
  };
}

function grid(body: string, items: ImageRef[], bg: string): Section {
  return {
    _type: "interventionGrid",
    _key: key(),
    sectionTitle: FEATURED_TITLE,
    introBody: pt(body),
    items: items.map((img) => showcaseItem(img)),
    initialVisibleCount: 6,
    readMoreLabel: "View All",
    appearance: appearance(bg, "#171717"),
  };
}

async function main() {
  console.log(`patch-vuforia-chalk-structure-nov11 (${APPLY ? "APPLY" : "dry"})`);
  const docs = await fetchDocs(DOC);
  for (const d of docs)
    refuseIfPresent(
      d,
      [HANDSFREE_TITLE, FEATURED_TITLE, MOBILE_SUPPORT_TITLE],
      ["interventionGrid", "desktopMotionShowcase"],
    );

  const realwear: ImageRef[] = [];
  for (const f of REALWEAR_FILES) realwear.push(await image(join(DIR, f)));
  const mobile: ImageRef[] = [];
  for (const f of MOBILE_FILES) mobile.push(await image(join(DIR, f)));

  const bands: Section[] = [
    photoBand(HANDSFREE_TITLE, await image(join(DIR, "Group-1171275367.png")), HANDSFREE_CAPTION),
    grid(REALWEAR_BODY, realwear, REALWEAR_BAND),
    photoBand(MOBILE_SUPPORT_TITLE, await image(join(DIR, "Frame-1171276941-scaled.png")), MOBILE_SUPPORT_CAPTION),
    grid(MOBILE_BODY, mobile, MOBILE_BAND),
  ];
  const added = new Set(bands.map((b) => b._key));

  const plan = docs.map((doc) => {
    const sections = insertAfter(doc.sections, AFTER_RESEARCH_ARTIFACTS, bands);
    console.log(`\n${doc._id} (rev ${doc._rev}): ${doc.sections.length} → ${sections.length} sections`);
    console.log(describe(sections, added));
    return { doc, sections };
  });
  console.log(`\nRealWear grid: ${realwear.length} · mobile grid: ${mobile.length} · 2 photo bands`);
  await commit("vuforia-chalk-structure-nov11", plan);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
