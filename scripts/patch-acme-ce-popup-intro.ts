/**
 * Acme Lending — replace lorem in Core Experience View More popup intro only.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-acme-ce-popup-intro.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-acme-ce-popup-intro.ts --with-user-token
 */
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const SLUG = "acme-lending";

const POPUP_BODY =
  "Three borrower scenarios shaped the build: single-account verification, multiple-account verification, and error recovery. High-fidelity flows for each use case were tested against Acme Lending's brand and compliance requirements.";

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

function popupBodyBlocks() {
  return [
    {
      _type: "block",
      _key: key(),
      style: "normal",
      markDefs: [],
      children: [{ _type: "span", _key: key(), text: POPUP_BODY, marks: [] }],
    },
  ];
}

async function patchDoc(docId: string, idx: number) {
  const patch = {
    [`sections[${idx}].popupBody`]: popupBodyBlocks(),
    [`sections[${idx}].popupItemsBeforeViewMore`]: 4,
    [`sections[${idx}].popupLoadMoreLabel`]: "See more",
  };
  if (DRY) {
    console.log(`[dry] ${docId} sections[${idx}] popup intro`);
    return;
  }
  await client.patch(docId).set(patch).commit();
  console.log(`✓ ${docId}: Acme CE popup intro`);
}

async function main() {
  const docId = await client.fetch<string>(
    `*[_type == "caseStudy" && slug.current == $slug][0]._id`,
    { slug: SLUG },
  );
  if (!docId) throw new Error(`No case study: ${SLUG}`);

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

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
