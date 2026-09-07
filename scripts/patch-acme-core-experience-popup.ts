/**
 * Acme Lending — Core Experience View More popup (Figma 3928:11154).
 *
 * Modal interior: six landscape tiles in aligned 2-column grid @4×
 *   3928:11163 / 11185 / 11349 / 11424 / 11664 / 11739
 * Light popup band #cce0f0, navy tile cards #202a33. Band previewScreens unchanged.
 *
 * PNG source: public/work/acme-lending/core-flow/
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-acme-core-experience-popup.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-acme-core-experience-popup.ts --with-user-token
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const SLUG = "acme-lending";
const MODAL_DIR = join(process.cwd(), "public/work/acme-lending/core-flow");

/** Figma 3928:11154 — light blue popup interior. */
const POPUP_BG = "#cce0f0";
const TILE_BG = "#202a33";

const INTRO =
  "The verification flow guides borrowers from connecting trusted financial institutions through account review and automated deposit verification to instant approval—replacing manual document uploads with secure, permissioned data access.";

/** Grid order: Figma rows top → bottom, left → right. */
const GRID = [
  {
    file: "01-scenario-use-case.png",
    figma: "3928:11163",
    caption: "Find Financial Institution: Secure Connections: Connect trusted financial institutions.",
  },
  {
    file: "02-inbox-verification.png",
    figma: "3928:11185",
    caption: "Account Summary: Review selected accounts before sharing.",
  },
  {
    file: "03-mortgage-verify.png",
    figma: "3928:11349",
    caption: "Verifying Deposits: Automated Verification: Income verification happens instantly.",
  },
  {
    file: "04-search-financial-institution.png",
    figma: "3928:11424",
    caption: "Verification Complete: Instant Approval: Verification completed with confidence.",
  },
  {
    file: "05-chase-login.png",
    figma: "3928:11664",
    caption: "Find Financial Institution: Secure Connections: Connect trusted financial institutions.",
  },
  {
    file: "06-account-summary.png",
    figma: "3928:11739",
    caption: "Account Summary: Review selected accounts before sharing.",
  },
] as const;

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

function sanityColor(hex: string, alpha = 1) {
  return { _type: "color" as const, hex, alpha };
}

async function uploadImage(absPath: string) {
  const asset = await client.assets.upload("image", createReadStream(absPath), {
    filename: basename(absPath),
  });
  return { _type: "image" as const, asset: { _type: "reference" as const, _ref: asset._id } };
}

async function patchDoc(docId: string, idx: number) {
  const items = [];
  for (const row of GRID) {
    const abs = join(MODAL_DIR, row.file);
    if (!existsSync(abs)) throw new Error(`Missing PNG: ${abs}`);
    console.log(`${DRY ? "○" : "↑"} ${row.file} (${row.figma})`);
    items.push({
      _key: key(),
      _type: "galleryItem" as const,
      image: DRY
        ? { _type: "image", asset: { _type: "reference", _ref: "dry-run" } }
        : await uploadImage(abs),
      caption: row.caption,
    });
  }

  const popupTabs = [
    {
      _key: key(),
      _type: "deviceTab" as const,
      label: "Flow screens",
      items,
    },
  ];

  const popupBody = [
    {
      _type: "block",
      _key: key(),
      style: "normal",
      markDefs: [],
      children: [{ _type: "span", _key: key(), text: INTRO, marks: [] }],
    },
  ];

  const patch = {
    [`sections[${idx}].popupTitle`]: "Core Experience Flows",
    [`sections[${idx}].popupBody`]: popupBody,
    [`sections[${idx}].popupTabs`]: popupTabs,
    [`sections[${idx}].popupItemsBeforeViewMore`]: 6,
    [`sections[${idx}].popupLoadMoreLabel`]: "Load More",
    [`sections[${idx}].viewMoreLabel`]: "View More",
    [`sections[${idx}].popupAppearance.backgroundColor`]: sanityColor(POPUP_BG),
    [`sections[${idx}].popupAppearance.textColor`]: sanityColor("#000000"),
    [`sections[${idx}].popupAppearance.contentAlignment`]: "left",
    [`sections[${idx}].popupAppearance.tileBackgroundColor`]: sanityColor(TILE_BG),
    [`sections[${idx}].popupAppearance.contentGap`]: 43,
    [`sections[${idx}].popupAppearance.contentGapInner`]: 87,
  };

  if (DRY) {
    console.log(`dry-run ${docId}: popupTabs=1 items=${items.length}`);
    return;
  }

  await client.patch(docId).set(patch).unset([`sections[${idx}].popupScreens`]).commit();
  console.log(`✓ ${docId}: Acme CE popup=${items.length} tiles on ${POPUP_BG}`);
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
  if (draft?.sections && !DRY) {
    await patchDoc(draftId, idx);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
