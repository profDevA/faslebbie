/**
 * Match Coral Health's band backgrounds to Figma, one for one.
 *
 * Fas, 08/05: "assume now, match it one for one… let's not skip. This is how
 * things get left."
 *
 * Source of truth is frame 2110:39398 (content frame 2110:39410). Its bands
 * carry raw fills rather than variables, so each value below was read off a
 * full-resolution export of the band itself — the flat areas sample at 100%
 * purity, so these are the exact fills, not averages:
 *
 *   #171717  near-black narrative bands (not #000000, which is what we shipped)
 *   #e3e3db  warm light bands
 *   #52747e  slate
 *   #fe9d68  coral orange
 *   #164553  deep teal
 *
 * Two bands already matched: Core Experience Flow (#52747e) and Marketing
 * Website (#fe9d68). The hero is left alone — its blackness is baked into the
 * artwork, not set in CSS, so #000000 vs #171717 there is an export to redo.
 *
 * Sections are matched on type + title rather than index so re-ordering in the
 * Studio can't misfire this. Idempotent.
 *
 * Run from frontend/:
 *   sanity exec scripts/patch-coral-colors.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

const INK = "#171717";
const SAND = "#e3e3db";
const SLATE = "#52747e";
const TEAL = "#164553";

/** [section _type, section title, target background] */
const TARGETS: [string, string, string][] = [
  ["overviewSection", "Overview", SAND],
  ["proseSection", "Problem Context", INK],
  ["proseSection", "What I Brought", INK],
  ["coreExperience", "Core Experience Flow", SLATE],
  ["accordionSection", "Design Process", SAND],
  ["showcaseGallery", "Research Artifacts", INK],
  ["motionShowcase", "Key Product Experiences", SLATE],
  ["desktopMotionShowcase", "Marketing Website", "#fe9d68"],
  ["mediaSection", "Marketing Website", "#fe9d68"],
  ["statsSection", "Impact", SAND],
  ["highlightReel", "Project Highlights", TEAL],
  ["proseSection", "Reflection", INK],
  ["bulletSection", "Next Steps", INK],
];

type Section = {
  _key: string;
  _type: string;
  sectionTitle?: string;
  appearance?: { backgroundColor?: { hex?: string; alpha?: number } };
};

async function main() {
  const doc: { _id: string; sections: Section[] } = await client.fetch(
    `*[_type == "caseStudy" && slug.current == "coral-health"][0]{
       _id, "sections": sections[]{ _key, _type, sectionTitle, appearance }
     }`,
  );

  const patch = client.patch(doc._id);
  let changed = 0;

  for (const [type, title, hex] of TARGETS) {
    const i = doc.sections.findIndex(
      (s) => s._type === type && (s.sectionTitle ?? "").toLowerCase() === title.toLowerCase(),
    );
    if (i < 0) {
      console.warn(`! no ${type} titled "${title}"`);
      continue;
    }
    const cur = doc.sections[i].appearance?.backgroundColor;
    // The two washed bands carry an alpha — Design Process at 0.4, Impact at
    // 0.6 — so the alpha has to be reset alongside the hex or the new fill
    // comes through diluted.
    if (cur?.hex?.toLowerCase() === hex && (cur.alpha ?? 1) === 1) {
      console.log(`  ${title}: already ${hex}`);
      continue;
    }
    patch.set({
      [`sections[${i}].appearance.backgroundColor`]: { _type: "color", hex, alpha: 1 },
    });
    console.log(
      `→ ${title}: ${cur?.hex ?? "none"}${cur?.alpha != null && cur.alpha !== 1 ? `@${cur.alpha}` : ""} → ${hex}`,
    );
    changed++;
  }

  if (!changed) return console.log("\nNothing to change.");
  await patch.commit();
  console.log(`\n${changed} band(s) updated.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
