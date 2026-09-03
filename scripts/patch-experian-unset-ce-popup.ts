/**
 * Experian Boost — remove View More popup. Band preview screens stay.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-experian-unset-ce-popup.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const SLUG = "experian-boost";

const UNSET = [
  "popupTabs",
  "popupBody",
  "popupScreens",
  "popupKicker",
  "popupTitle",
  "viewMoreLabel",
  "popupItemsBeforeViewMore",
  "popupLoadMoreLabel",
] as const;

async function main() {
  const docs = await client.fetch<{ _id: string; sections?: { _key: string; _type: string }[] }[]>(
    `*[_type == "caseStudy" && slug.current == $slug]{ _id, sections[]{ _key, _type } }`,
    { slug: SLUG },
  );
  if (!docs.length) throw new Error(`no case study: ${SLUG}`);

  for (const doc of docs) {
    const idx = (doc.sections ?? []).findIndex((s) => s._type === "coreExperience");
    if (idx < 0) {
      console.log(`skip ${doc._id}: no coreExperience`);
      continue;
    }
    const paths = UNSET.map((f) => `sections[${idx}].${f}`);
    const before = await client.fetch<{ n: number; body: boolean }>(
      `*[_id == $id][0]{
        "n": count(sections[${idx}].popupTabs[].items),
        "body": defined(sections[${idx}].popupBody)
      }`,
      { id: doc._id },
    );
    console.log(`before ${doc._id}: popup items=${before.n} body=${before.body}`);
    await client.patch(doc._id).unset(paths).commit();
    console.log(`✓ ${doc._id}: unset ${UNSET.join(", ")}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
