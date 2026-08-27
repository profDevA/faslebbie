/**
 * Fix Coral Health motionShowcase title: "Core Experience Flows" → "Key Product Experiences"
 * (Figma 2110:39759). Idempotent.
 *
 * Run from frontend/:
 *   sanity exec scripts/patch-coral-key-product-title.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const TITLE = "Key Product Experiences";

async function main() {
  const doc: { _id: string; sections: { _key: string; _type: string; sectionTitle?: string }[] } =
    await client.fetch(
      `*[_type == "caseStudy" && slug.current == "coral-health"][0]{
        _id, "sections": sections[]{ _key, _type, sectionTitle }
      }`,
    );
  const i = doc.sections.findIndex((s) => s._type === "motionShowcase");
  if (i < 0) {
    console.error("No motionShowcase on coral-health");
    process.exit(1);
  }
  const cur = doc.sections[i].sectionTitle;
  if (cur === TITLE) {
    console.log(`Already "${TITLE}"`);
    return;
  }
  await client
    .patch(doc._id)
    .set({ [`sections[${i}].sectionTitle`]: TITLE })
    .commit();
  console.log(`→ "${cur}" → "${TITLE}"`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
