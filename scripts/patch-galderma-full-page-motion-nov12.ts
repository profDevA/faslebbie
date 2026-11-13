/**
 * Galderma — the "Full Page Motion" band (tracker row 117, Ade: "the screens
 * to showcase there need to be in their correct sizing"; Fas, Teams Nov 11/12:
 * "I think we missed one section in Galderma"). Coral's equivalent is the
 * "Marketing Website" desktopMotionShowcase (laptop + full-page scroll video,
 * after Research Artifacts, before Impact). The old site had this band as a
 * 1-up laptop slider of three GAIN Connect screens with the caption "This
 * slider demonstrates three key engagement features…" (fasandsabrina.com
 * /case-studies/galderma § desktop_screen_videos). The Final Cleanup frame
 * (62:58416) doesn't have it yet — Ade's screens / Sakib's motion are pending.
 *
 * Adds one desktopMotionShowcase after Research Artifacts (1835c843acbe):
 * layout "single" with the three old-site laptop screens as poster slides
 * (carousel) and the old caption; no title (the old band had none — Fas /
 * Israel to name it); laptop at Coral's Marketing width (container 1176, square
 * corners because the screens include the laptop chrome); band #e6ece8 like the
 * old site's light grey. Swap in Sakib's video (videoFile / videoUrl) in Studio
 * when it lands — the slides are a placeholder.
 * Refuses to run twice (a desktopMotionShowcase already on the doc). Dry by
 * default; --apply uploads the 3 screens, backs the doc up, commits under
 * ifRevisionId.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-galderma-full-page-motion-nov12.ts --with-user-token
 *   npx sanity exec scripts/patch-galderma-full-page-motion-nov12.ts --with-user-token -- --apply
 */
import { join } from "node:path";

import {
  APPLY,
  OLDSITE,
  type Section,
  appearance,
  commit,
  describe,
  fetchDocs,
  image,
  insertAfter,
  key,
  refuseIfPresent,
} from "./lib/structure-nov11";

const DOC = "cs-galderma";
const AFTER_RESEARCH_ARTIFACTS = "1835c843acbe";
const DIR = join(OLDSITE, "galderma");

/** Old-site slider order (fasandsabrina.com § desktop_screen_videos). */
const SCREENS = ["Frame-1171276937-1-1.png", "Frame-1171276937-2-scaled.png", "Frame-1171276937-1.png"];
/** Old-site caption, verbatim. */
const CAPTION =
  "This slider demonstrates three key engagement features: timestamped video modules that enable 'Smart Resurrection' by directing users who fail assessments back to specific lessons instead of restarting entire courses; the Interactive Facial Assessment Scale (FAS) that serves as the 'Aha!' moment where users experience core clinical value through active diagnosis; and the tiered plan interface that forces active commitment between Freemium and Premium, eliminating passive 'Non-Activated' user states.";

async function build(): Promise<Section> {
  const slides = [];
  for (const f of SCREENS) {
    slides.push({ _type: "desktopMotionSlide", _key: key(), alt: "GAIN Connect screen", image: await image(join(DIR, f)) });
  }
  return {
    _type: "desktopMotionShowcase",
    _key: key(),
    layoutVariant: "single",
    caption: CAPTION,
    slides,
    appearance: appearance("#e6ece8", "#171717", { tileBorderRadius: 0, containerMaxWidth: 1176 }),
  };
}

async function main() {
  console.log(`patch-galderma-full-page-motion-nov12 (${APPLY ? "APPLY" : "dry"})`);
  const docs = await fetchDocs(DOC);
  for (const d of docs) refuseIfPresent(d, [], ["desktopMotionShowcase"]);
  const band = await build();
  const plan = docs.map((doc) => {
    const sections = insertAfter(doc.sections, AFTER_RESEARCH_ARTIFACTS, [band]);
    console.log(`\n${doc._id} (rev ${doc._rev}): ${doc.sections.length} → ${sections.length} sections`);
    console.log(describe(sections, new Set([band._key])));
    return { doc, sections };
  });
  console.log(`\nfull-page motion band: ${SCREENS.length} old-site laptop screens as poster slides + old caption, no title`);
  await commit("galderma-full-page-motion-nov12", plan);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
