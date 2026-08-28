/**
 * Remove legacy null/orphan keys on Coral Health sections (published + draft).
 * Studio shows "Unknown fields" when old template keys linger on sections.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-coral-unset-section-orphans.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

const SLUG = "coral-health";

/** Keys that belong on each section _type in the current schema. */
const ALLOWED: Record<string, readonly string[]> = {
  heroSection: ["caption", "headingOverride", "image", "imageMobile", "appearance"],
  overviewSection: [
    "sectionTitle",
    "body",
    "serviceCategoryLabel",
    "serviceList",
    "duration",
    "team",
    "confidentialityNote",
    "ctaLabel",
    "ctaUrl",
    "sideImage",
    "sideVideo",
    "sideImageFit",
    "sideImageBackgroundColor",
    "appearance",
  ],
  problemContextSection: [
    "problemHeading",
    "problemBody",
    "broughtHeading",
    "broughtBody",
    "supportingCopy",
    "appearance",
  ],
  coreExperience: [
    "sectionTitle",
    "body",
    "layoutVariant",
    "viewMoreLabel",
    "previewScreens",
    "popupScreens",
    "popupBody",
    "popupTabs",
    "popupItemsBeforeViewMore",
    "popupLoadMoreLabel",
    "image",
    "imageMobile",
    "appearance",
  ],
  accordionSection: [
    "variant",
    "sectionTitle",
    "sideTitle",
    "sideBody",
    "accordionBackgroundColor",
    "items",
    "appearance",
  ],
  showcaseGallery: ["sectionTitle", "introBody", "expandable", "items", "appearance"],
  motionShowcase: ["sectionTitle", "intro", "rows", "appearance"],
  desktopMotionShowcase: [
    "sectionTitle",
    "body",
    "videoUrl",
    "videoFile",
    "posterImage",
    "caption",
    "appearance",
  ],
  statsSection: ["sectionTitle", "body", "items", "appearance"],
  highlightReel: ["sectionTitle", "layout", "cells", "appearance"],
  reflectionSection: [
    "reflectionHeading",
    "reflectionBody",
    "nextStepsHeading",
    "nextStepsItems",
    "appearance",
  ],
};

type Section = Record<string, unknown> & { _key: string; _type: string };

async function cleanDoc(docId: string) {
  const doc = await client.fetch<{ sections?: Section[] }>(
    `*[_id == $id][0]{ sections }`,
    { id: docId },
  );
  if (!doc?.sections?.length) {
    console.log(`skip ${docId} — no sections`);
    return 0;
  }

  let patchCount = 0;
  const unsetPaths: string[] = [];

  doc.sections.forEach((sec, i) => {
    const allowed = ALLOWED[sec._type];
    if (!allowed) return;
    const orphans = Object.keys(sec).filter(
      (k) => !["_key", "_type", ...allowed].includes(k),
    );
    for (const key of orphans) {
      unsetPaths.push(`sections[${i}].${key}`);
      console.log(`  ${docId} ${sec._type}[${i}]: unset ${key}`);
      patchCount++;
    }
  });

  if (patchCount) await client.patch(docId).unset(unsetPaths).commit();
  return patchCount;
}

async function main() {
  const base = await client.fetch<string>(
    `*[_type == "caseStudy" && slug.current == $slug][0]._id`,
    { slug: SLUG },
  );
  if (!base) throw new Error(`no case study: ${SLUG}`);

  let total = 0;
  for (const id of [base, `drafts.${base}`]) {
    console.log(`\n=== ${id} ===`);
    total += await cleanDoc(id);
  }

  console.log(`\ndone — ${total} orphan field(s) unset`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
