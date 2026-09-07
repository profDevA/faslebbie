/**
 * Acme Lending — band previewRowStagger only (145px).
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-acme-ce-stagger-fields.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const SLUG = "acme-lending";
const BAND_STAGGER = 145;

async function patchDoc(docId: string, idx: number) {
  await client
    .patch(docId)
    .set({ [`sections[${idx}].previewRowStagger`]: BAND_STAGGER })
    .commit();
  console.log(`✓ ${docId}: previewRowStagger=${BAND_STAGGER}`);
}

async function main() {
  const docId = await client.fetch<string>(
    `*[_type == "caseStudy" && slug.current == $slug][0]._id`,
    { slug: SLUG },
  );
  if (!docId) throw new Error(`no case study: ${SLUG}`);

  const doc = await client.fetch<{ sections: { _type: string }[] }>(
    `*[_id == $id][0]{ sections[]{ _type } }`,
    { id: docId },
  );
  const idx = doc.sections.findIndex((s) => s._type === "coreExperience");
  if (idx < 0) throw new Error("no coreExperience section");

  await patchDoc(docId, idx);

  const draftId = `drafts.${docId}`;
  const draft = await client.fetch<{ sections?: unknown[] } | null>(
    `*[_id == $id][0]{ sections }`,
    { id: draftId },
  );
  if (draft?.sections) await patchDoc(draftId, idx);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
