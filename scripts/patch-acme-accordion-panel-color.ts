/**
 * Acme Lending — My Approach accordion panel #4C79C8 (Figma Holistic).
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-acme-accordion-panel-color.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

import { ACME_ACCORDION_PANEL_BACKGROUND } from "../src/lib/caseStudyDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });
const SLUG = "acme-lending";

function sanityColor(hex: string, alpha = 1) {
  return { _type: "color" as const, hex, alpha };
}

async function main() {
  const docs = await client.fetch<
    {
      _id: string;
      sections?: {
        _type: string;
        accordionBackgroundColor?: { hex?: string; alpha?: number };
      }[];
    }[]
  >(
    `*[_type == "caseStudy" && slug.current == $slug]{
      _id,
      sections[]{ _type, accordionBackgroundColor{ hex, alpha } }
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
    const before = doc.sections![idx].accordionBackgroundColor;
    console.log(
      `before ${doc._id}: panel=${before?.hex ?? "unset"} a=${before?.alpha ?? "-"}`,
    );
    await client
      .patch(doc._id)
      .set({
        [`sections[${idx}].accordionBackgroundColor`]: sanityColor(
          ACME_ACCORDION_PANEL_BACKGROUND,
        ),
      })
      .commit();
    console.log(`✓ ${doc._id}: accordion panel → ${ACME_ACCORDION_PANEL_BACKGROUND}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
