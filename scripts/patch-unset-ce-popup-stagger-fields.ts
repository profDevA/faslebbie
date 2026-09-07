/**
 * Unset legacy popupRowStagger / popupColumns on all case studies.
 * View More popups use a flat 2-column grid only (no row stagger).
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-unset-ce-popup-stagger-fields.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

async function main() {
  const docs = await client.fetch<{ _id: string; sections?: { _type: string }[] }[]>(
    `*[_type == "caseStudy"]{ _id, sections[]{ _type } }`,
  );

  for (const doc of docs) {
    const idx = (doc.sections ?? []).findIndex((s) => s._type === "coreExperience");
    if (idx < 0) continue;

    await client
      .patch(doc._id)
      .unset([
        `sections[${idx}].popupRowStagger`,
        `sections[${idx}].popupColumns`,
      ])
      .commit();
    console.log(`✓ ${doc._id}: unset popupRowStagger, popupColumns`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
