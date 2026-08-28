/**
 * Prefill Overview copy/media column padding on existing case studies.
 * New sections get initialValue from schema; migrated docs may still have empty fields
 * while the frontend applied Figma defaults silently.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-case-study-overview-padding-defaults.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-case-study-overview-padding-defaults.ts --with-user-token
 *   npx sanity exec scripts/patch-case-study-overview-padding-defaults.ts --with-user-token -- --slug=acme-lending
 */
import { getCliClient } from "sanity/cli";

import {
  OVERVIEW_COPY_COLUMN_PAD,
  OVERVIEW_MEDIA_COLUMN_PAD,
} from "../src/lib/caseStudyDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const slugArg = process.argv.find((a) => a.startsWith("--slug="))?.split("=")[1];

type OverviewSection = {
  _key: string;
  _type: "overviewSection";
  copyPaddingTop?: number;
  copyPaddingBottom?: number;
  mediaPaddingTop?: number;
  mediaPaddingBottom?: number;
};

type Section = OverviewSection | { _key: string; _type: string; [k: string]: unknown };

function isUnset(v: unknown): v is null | undefined {
  return v === null || v === undefined;
}

function fillOverviewPadding(section: OverviewSection): { next: OverviewSection; changed: string[] } {
  const next = { ...section };
  const changed: string[] = [];

  if (isUnset(next.copyPaddingTop)) {
    next.copyPaddingTop = OVERVIEW_COPY_COLUMN_PAD.paddingTop;
    changed.push(`copyPaddingTop→${next.copyPaddingTop}`);
  }
  if (isUnset(next.copyPaddingBottom)) {
    next.copyPaddingBottom = OVERVIEW_COPY_COLUMN_PAD.paddingBottom;
    changed.push(`copyPaddingBottom→${next.copyPaddingBottom}`);
  }
  if (isUnset(next.mediaPaddingTop)) {
    next.mediaPaddingTop = OVERVIEW_MEDIA_COLUMN_PAD.paddingTop;
    changed.push(`mediaPaddingTop→${next.mediaPaddingTop}`);
  }
  if (isUnset(next.mediaPaddingBottom)) {
    next.mediaPaddingBottom = OVERVIEW_MEDIA_COLUMN_PAD.paddingBottom;
    changed.push(`mediaPaddingBottom→${next.mediaPaddingBottom}`);
  }

  return { next, changed };
}

function patchSections(sections: Section[]) {
  let overviewCount = 0;
  const notes: string[] = [];
  const next = sections.map((s) => {
    if (s._type !== "overviewSection") return s;
    overviewCount++;
    const { next: filled, changed } = fillOverviewPadding(s as OverviewSection);
    if (changed.length) notes.push(changed.join(", "));
    return filled;
  });
  return { sections: next, overviewCount, notes, changed: notes.length > 0 };
}

async function main() {
  const filter = slugArg
    ? `*[_type == "caseStudy" && slug.current == $slug]._id`
    : `*[_type == "caseStudy"]._id`;
  const params = slugArg ? { slug: slugArg } : {};
  const ids: string[] = await client.fetch(filter, params);

  if (slugArg && !ids.length) {
    console.error(`No case study with slug "${slugArg}"`);
    process.exit(1);
  }

  let docs = 0;
  let overviews = 0;

  for (const id of ids) {
    const doc = await client.getDocument(id);
    if (!doc?.sections?.length) continue;

    const { sections, overviewCount, notes, changed } = patchSections(
      doc.sections as Section[],
    );
    if (!changed) continue;

    const slug =
      (doc.slug as { current?: string } | undefined)?.current ??
      id.replace(/^drafts\./, "");
    console.log(`→ ${slug} (${id}): ${notes.join(" | ")}`);
    docs++;
    overviews += overviewCount;

    if (!DRY) await client.patch(id).set({ sections }).commit();
  }

  console.log(
    `\n${DRY ? "(dry run) " : ""}${docs} doc(s), ${overviews} overview section(s) prefilled`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
