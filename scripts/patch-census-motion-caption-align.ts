/**
 * US Census — featured motion band desktop caption → bottom-right (Figma 3999:53406).
 * Updates captionAlign only — does not re-upload images.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-census-motion-caption-align.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const SLUG = "2020-us-census-benefit-calculator";

async function main() {
  const docs = await client.fetch<
    {
      _id: string;
      sections?: {
        _type: string;
        layoutVariant?: string;
        rows?: { captionAlign?: string }[];
      }[];
    }[]
  >(
    `*[_type == "caseStudy" && slug.current == $slug]{
      _id,
      sections[]{
        _type,
        layoutVariant,
        rows[]{ captionAlign }
      }
    }`,
    { slug: SLUG },
  );
  if (!docs.length) throw new Error(`no case study: ${SLUG}`);

  for (const doc of docs) {
    const idx = (doc.sections ?? []).findIndex(
      (s) => s._type === "motionShowcase" && s.layoutVariant === "featured",
    );
    if (idx < 0) {
      console.log(`skip ${doc._id}: no featured motionShowcase`);
      continue;
    }
    const before = doc.sections![idx].rows?.[0]?.captionAlign ?? "unset";
    console.log(`before ${doc._id}: captionAlign=${before}`);
    await client
      .patch(doc._id)
      .set({ [`sections[${idx}].rows[0].captionAlign`]: "right" })
      .commit();
    console.log(`✓ ${doc._id}: captionAlign → right`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
