/**
 * Set accordionTextColor on My Approach / Design Process panels from Figma Holistic.
 *
 * Black on mid-tone panels: DVA 4001:76133, Design Assist 3719:64964,
 * Experian 2166:93463, Acme (WP text-dark), FDX, Coral, Memory Tubes.
 * White on navy: Census 3999:53211.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-accordion-panel-text-colors.ts --with-user-token
 *   npx sanity exec scripts/patch-accordion-panel-text-colors.ts --with-user-token -- --dry
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");

/** slug → panel copy color from Figma / live WP */
const PANEL_TEXT_BY_SLUG: Record<string, string> = {
  "diamond-valuation-ai": "#000000", // Figma 4001:76137
  "design-assist-ai": "#000000", // Figma 3719:64968
  "experian-boost": "#000000", // Figma 2166:93467
  "acme-lending": "#000000", // live WP text-dark on #4c79c8
  "2020-us-census-benefit-calculator": "#ffffff", // Figma 3999:53215
  "financial-data-exchange": "#000000", // live WP text-dark on teal panel
  "coral-health": "#000000", // live WP text-dark on orange panel
  "memory-tubes": "#000000", // live WP text-dark on sage panel
};

function sanityColor(hex: string, alpha = 1) {
  return { _type: "color" as const, hex, alpha };
}

async function patchDoc(doc: {
  _id: string;
  slug?: string;
  sections?: { _type: string }[];
}) {
  const slug = doc.slug;
  if (!slug || !(slug in PANEL_TEXT_BY_SLUG)) return false;

  const idx = (doc.sections ?? []).findIndex((s) => s._type === "accordionSection");
  if (idx < 0) {
    console.log(`skip ${doc._id}: no accordionSection`);
    return false;
  }

  const panelText = PANEL_TEXT_BY_SLUG[slug];
  if (!DRY) {
    await client
      .patch(doc._id)
      .set({ [`sections[${idx}].accordionTextColor`]: sanityColor(panelText) })
      .commit();
  }
  console.log(`✓ ${doc._id} (${slug}): accordion panel text → ${panelText}`);
  return true;
}

async function main() {
  console.log(`patch-accordion-panel-text-colors (${DRY ? "dry" : "live"})`);

  const slugs = Object.keys(PANEL_TEXT_BY_SLUG);
  const docs = await client.fetch<
    { _id: string; slug?: string; sections?: { _type: string }[] }[]
  >(
    `*[_type == "caseStudy" && slug.current in $slugs]{
      _id,
      "slug": slug.current,
      sections[]{ _type }
    }`,
    { slugs },
  );

  let n = 0;
  for (const doc of docs) {
    if (await patchDoc(doc)) n++;
  }

  console.log(`done — ${n} doc(s)${DRY ? " (dry run)" : ""}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
