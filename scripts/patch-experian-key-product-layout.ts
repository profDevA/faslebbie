/**
 * Write Band layout = stacked (Coral) on Experian Key Product Experiences.
 *
 * Schema initialValue only applies to NEW motionShowcase objects. Migrated
 * sections have no layoutVariant stored, so Studio shows neither radio
 * selected even though the frontend already falls back to stacked.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-experian-key-product-layout.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const SLUG = "experian-boost";

type Section = {
  _key?: string;
  _type?: string;
  layoutVariant?: string;
};

async function main() {
  const docs = await client.fetch<
    { _id: string; sections?: Section[] }[]
  >(
    `*[_type == "caseStudy" && slug.current == $slug]{
      _id, sections[]{ _key, _type, layoutVariant }
    }`,
    { slug: SLUG },
  );

  if (!docs.length) throw new Error(`No case study with slug ${SLUG}`);

  for (const doc of docs) {
    const section = (doc.sections ?? []).find((s) => s._type === "motionShowcase");
    if (!section?._key) {
      console.log(`skip ${doc._id}: no motionShowcase`);
      continue;
    }

    const before = section.layoutVariant ?? "(unset)";
    if (section.layoutVariant === "stacked") {
      console.log(`Already stacked on ${doc._id} ${section._key}`);
      continue;
    }

    await client
      .patch(doc._id)
      .set({ [`sections[_key=="${section._key}"].layoutVariant`]: "stacked" })
      .commit();

    console.log(
      `✓ ${doc._id} ${section._key}: layoutVariant ${before} → stacked`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
