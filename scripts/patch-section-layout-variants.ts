/**
 * Backfill layoutVariant on migrated case-study sections.
 *
 * Sanity initialValue only applies when a section is first created. Migrated
 * coreExperience / motionShowcase objects often have no stored value, so Studio
 * shows neither radio selected even though the frontend falls back correctly.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-section-layout-variants.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-section-layout-variants.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");

/** Slugs that use the wide staggered desktop grid on §04 Core Experience. */
const CORE_DESKTOP_GRID_SLUGS = new Set(["acme-lending"]);

/** Slugs that use Census featured-device layout on §07 Motion Showcase. */
const MOTION_FEATURED_SLUGS = new Set(["2020-us-census-benefit-calculator"]);

type Section = {
  _key?: string;
  _type?: string;
  layoutVariant?: string;
};

function isUnset(v: unknown) {
  return v === undefined || v === null || v === "";
}

function targetLayout(
  sectionType: "coreExperience" | "motionShowcase",
  slug: string,
): string {
  if (sectionType === "coreExperience") {
    return CORE_DESKTOP_GRID_SLUGS.has(slug) ? "desktopGrid" : "mobileRow";
  }
  return MOTION_FEATURED_SLUGS.has(slug) ? "featured" : "stacked";
}

async function patchDoc(docId: string, slug: string) {
  const doc = await client.getDocument(docId);
  if (!doc?.sections?.length) {
    console.log(`skip ${docId}: no sections`);
    return 0;
  }

  const patch = client.patch(docId);
  let n = 0;

  for (const s of doc.sections as Section[]) {
    if (!s._key) continue;
    if (s._type !== "coreExperience" && s._type !== "motionShowcase") continue;
    if (!isUnset(s.layoutVariant)) continue;

    const value = targetLayout(s._type, slug);
    patch.set({ [`sections[_key=="${s._key}"].layoutVariant`]: value });
    console.log(`  ${docId} ${s._type}[${s._key}]: (unset) → ${value}`);
    n++;
  }

  if (n && !DRY) await patch.commit();
  return n;
}

async function main() {
  const docs: { _id: string; slug: string }[] = await client.fetch(
    `*[_type == "caseStudy"]{ _id, "slug": slug.current }`,
  );

  let total = 0;
  for (const { _id, slug } of docs) {
    total += await patchDoc(_id, slug);
    const draftId = `drafts.${_id}`;
    if (await client.getDocument(draftId)) {
      total += await patchDoc(draftId, slug);
    }
  }

  console.log(`\n${DRY ? "(dry run) " : ""}${total} layoutVariant field(s) patched`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
