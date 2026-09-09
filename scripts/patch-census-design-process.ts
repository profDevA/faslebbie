/**
 * US Census — My Approach / Design Process split band colors (Figma 3999:53211).
 * Cream page band #E3E3DB + navy accordion panel #194498.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-census-design-process.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const SLUG = "2020-us-census-benefit-calculator";
const BAND_BG = "#e3e3db";
const PANEL_BG = "#194498";

function sanityColor(hex: string, alpha = 1) {
  return { _type: "color" as const, hex, alpha };
}

async function main() {
  const docs = await client.fetch<
    {
      _id: string;
      sections?: {
        _key: string;
        _type: string;
        accordionBackgroundColor?: { hex?: string; alpha?: number };
        appearance?: { backgroundColor?: { hex?: string; alpha?: number } };
      }[];
    }[]
  >(
    `*[_type == "caseStudy" && slug.current == $slug]{
      _id,
      sections[]{
        _key, _type,
        accordionBackgroundColor{ hex, alpha },
        appearance{ backgroundColor{ hex, alpha } }
      }
    }`,
    { slug: SLUG },
  );
  if (!docs.length) throw new Error(`no case study: ${SLUG}`);

  for (const doc of docs) {
    const idx = (doc.sections ?? []).findIndex((s) => s._type === "accordionSection");
    if (idx < 0) {
      console.log(`skip ${doc._id}: no accordionSection`);
      continue;
    }
    const s = doc.sections![idx];
    const band = s.appearance?.backgroundColor;
    const panel = s.accordionBackgroundColor;
    console.log(
      `before ${doc._id}: band=${band?.hex ?? "unset"} a=${band?.alpha ?? "-"} panel=${panel?.hex ?? "unset"} a=${panel?.alpha ?? "-"}`,
    );
    await client
      .patch(doc._id)
      .set({
        [`sections[${idx}].appearance.backgroundColor`]: sanityColor(BAND_BG),
        [`sections[${idx}].accordionBackgroundColor`]: sanityColor(PANEL_BG),
      })
      .commit();
    console.log(`✓ ${doc._id}: band ${BAND_BG} / panel ${PANEL_BG}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
