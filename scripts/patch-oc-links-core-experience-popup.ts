/**
 * OC Links §04 View More popup — 12-tile flow grid (Figma 4151:34943).
 *
 * Tiles @4× (photo plates, navy popup #0A2A58). Crop 4px off Figma clip fringe
 * so plate edges are flat #668FBC (matches tile fill).
 *   4151:34952 login
 *   4151:34985 dashboard
 *   4151:35165 new contact
 *   4295:32784 crisis assessment
 *   4295:32942 issues selected
 *   4295:33088 specialist homelessness
 *   4151:35897 resource search
 *   4295:33231 report finished
 *   4151:36244 report success
 *   4295:33377 contacts
 *   4295:33556 chat
 *   4295:33709 notifications
 *
 * Band previewScreens unchanged — patch-oc-links-core-experience.ts.
 * Single popup tab (tab bar hidden). All 12 tiles visible (no Load More).
 * Figma leftover “builder for digital exhibitions” copy is ignored.
 *
 * PNG source: public/work/oc-links/core-flow/modal/
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-oc-links-core-experience-popup.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-oc-links-core-experience-popup.ts --with-user-token
 *   npx sanity exec scripts/patch-oc-links-core-experience-popup.ts --with-user-token -- --appearance-only
 *   npx sanity exec scripts/patch-oc-links-core-experience-popup.ts --with-user-token -- --trim-to-12
 *
 * Do not re-run full patch after manual Studio image uploads.
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const APPEARANCE_ONLY = process.argv.includes("--appearance-only");
const TRIM_TO_12 = process.argv.includes("--trim-to-12");
const SLUG = "oc-links";
const PUB_ID = "cs-oc-links";
const MODAL_DIR = join(process.cwd(), "public/work/oc-links/core-flow/modal");

/** Figma 4151:34943 page navy; tile fill matches the plate PNG edges (same trick as DVA #999). */
const POPUP_BG = "#0A2A58";
const POPUP_TILE_BG = "#668FBC";
const TEXT = "#ffffff";

const INTRO =
  "The core flow takes a crisis call from intake through assessment, needs identification, and verified resource matching, so OC Links, the Crisis Assessment Team, and the NAMI WarmLine share one navigator platform instead of three disconnected systems.";

const GRID = [
  { file: "01-login.png", figma: "4151:34952" },
  { file: "02-dashboard.png", figma: "4151:34985" },
  { file: "03-new-contact.png", figma: "4151:35165" },
  { file: "05-crisis-assessment.png", figma: "4295:32784" },
  { file: "06-issues-selected.png", figma: "4295:32942" },
  { file: "07-specialist-homelessness.png", figma: "4295:33088" },
  { file: "08-resource-search.png", figma: "4151:35897" },
  { file: "09-report-finished.png", figma: "4295:33231" },
  { file: "10-report-success.png", figma: "4151:36244" },
  { file: "11-contacts.png", figma: "4295:33377" },
  { file: "13-chat.png", figma: "4295:33556" },
  { file: "14-notifications.png", figma: "4295:33709" },
] as const;

/** Drop leftover tiles that are not in Figma 4151:34943 (crisis-check, resources). */
const KEEP_FROM_14 = [0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 12, 13];

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

async function uploadImage(absPath: string) {
  const asset = await client.assets.upload("image", createReadStream(absPath), {
    filename: basename(absPath),
    contentType: "image/png",
  });
  return {
    _type: "image" as const,
    asset: { _type: "reference" as const, _ref: asset._id },
  };
}

function ceIdx(sections: { _type: string }[]) {
  return sections.findIndex((s) => s._type === "coreExperience");
}

async function patchDoc(docId: string, idx: number) {
  const appearancePatch = {
    [`sections[${idx}].popupAppearance.backgroundColor`]: sanityColor(POPUP_BG),
    [`sections[${idx}].popupAppearance.textColor`]: sanityColor(TEXT),
    [`sections[${idx}].popupAppearance.contentAlignment`]: "left",
    [`sections[${idx}].popupAppearance.tileBackgroundColor`]:
      sanityColor(POPUP_TILE_BG),
    [`sections[${idx}].popupAppearance.contentGap`]: 43,
    [`sections[${idx}].popupAppearance.contentGapInner`]: 87,
  };

  if (TRIM_TO_12) {
    const doc = await client.getDocument(docId);
    const tab = doc?.sections?.[idx]?.popupTabs?.[0];
    const current = tab?.items ?? [];
    const items = KEEP_FROM_14.map((i) => current[i]).filter(Boolean);
    if (items.length !== 12) {
      throw new Error(
        `${docId}: trim expected 12 from ${current.length} items, got ${items.length}`,
      );
    }
    if (DRY) {
      console.log(`dry-run ${docId}: trim ${current.length} → 12`);
      return;
    }
    await client
      .patch(docId)
      .set({
        [`sections[${idx}].popupTabs`]: [{ ...tab, items }],
        [`sections[${idx}].popupItemsBeforeViewMore`]: 12,
      })
      .commit();
    console.log(`✓ ${docId}: OC Links CE popup trimmed ${current.length} → 12`);
    return;
  }

  if (APPEARANCE_ONLY) {
    if (DRY) {
      console.log(`dry-run ${docId}: appearance-only bg=${POPUP_BG} tile=${POPUP_TILE_BG}`);
      return;
    }
    await client.patch(docId).set(appearancePatch).commit();
    console.log(`✓ ${docId}: OC Links CE popup appearance`);
    return;
  }

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
    });
  }

  const popupBody = [
    {
      _type: "block",
      _key: key(),
      style: "normal",
      markDefs: [],
      children: [{ _type: "span", _key: key(), text: INTRO, marks: [] }],
    },
  ];

  const popupTabs = [
    {
      _key: key(),
      _type: "deviceTab" as const,
      label: "Flow screens",
      items,
    },
  ];

  const patch = {
    [`sections[${idx}].popupTitle`]: "Core Experience Flow",
    [`sections[${idx}].popupBody`]: popupBody,
    [`sections[${idx}].popupTabs`]: popupTabs,
    [`sections[${idx}].popupItemsBeforeViewMore`]: 12,
    [`sections[${idx}].popupLoadMoreLabel`]: "Load More",
    [`sections[${idx}].viewMoreLabel`]: "View More",
    ...appearancePatch,
  };

  if (DRY) {
    console.log(`dry-run ${docId}: popupTabs=1 items=${items.length}`);
    return;
  }

  await client
    .patch(docId)
    .set(patch)
    .unset([`sections[${idx}].popupScreens`])
    .commit();
  console.log(`✓ ${docId}: OC Links CE popup (${items.length} tiles)`);
}

async function main() {
  console.log(
    `patch-oc-links-core-experience-popup (${DRY ? "dry" : TRIM_TO_12 ? "trim-to-12" : APPEARANCE_ONLY ? "appearance-only" : "live"})`,
  );

  const pub = await client.fetch<{ sections: { _type: string }[] } | null>(
    `*[_id == $id][0]{ sections[]{ _type } }`,
    { id: PUB_ID },
  );
  if (!pub?.sections?.length) throw new Error(`Missing ${PUB_ID}`);

  const idx = ceIdx(pub.sections);
  if (idx < 0) throw new Error("No coreExperience section");

  await patchDoc(PUB_ID, idx);

  const draftId = `drafts.${PUB_ID}`;
  if (await client.getDocument(draftId)) {
    console.log(`→ sync ${draftId}`);
    await patchDoc(draftId, idx);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
