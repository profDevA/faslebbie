/**
 * Reset Overview media column padding to template defaults (currently 0 all sides).
 * Unlike patch-case-study-overview-padding-defaults.ts, this overwrites stored values.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-overview-media-padding-zero.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-overview-media-padding-zero.ts --with-user-token
 *   npx sanity exec scripts/patch-overview-media-padding-zero.ts --with-user-token -- --slug=coral-health
 */
import { getCliClient } from "sanity/cli";

import {
  OVERVIEW_MEDIA_COLUMN_PAD,
  OVERVIEW_MEDIA_COLUMN_PAD_PAGE,
} from "../src/lib/caseStudyDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const slugArg = process.argv.find((a) => a.startsWith("--slug="))?.split("=")[1];

type OverviewSection = {
  _key: string;
  _type: "overviewSection";
  mediaPaddingTop?: number;
  mediaPaddingBottom?: number;
  mediaPaddingLeft?: number;
  mediaPaddingRight?: number;
};

type Section = OverviewSection | { _key: string; _type: string; [k: string]: unknown };

function patchOverviewMedia(section: OverviewSection): { next: OverviewSection; changed: string[] } {
  const next = {
    ...section,
    mediaPaddingTop: OVERVIEW_MEDIA_COLUMN_PAD.paddingTop,
    mediaPaddingBottom: OVERVIEW_MEDIA_COLUMN_PAD.paddingBottom,
    mediaPaddingLeft: OVERVIEW_MEDIA_COLUMN_PAD_PAGE.paddingLeft,
    mediaPaddingRight: OVERVIEW_MEDIA_COLUMN_PAD_PAGE.paddingRight,
  };
  const changed: string[] = [];
  if (section.mediaPaddingTop !== next.mediaPaddingTop) {
    changed.push(`mediaPaddingTop ${section.mediaPaddingTop ?? "∅"}→${next.mediaPaddingTop}`);
  }
  if (section.mediaPaddingBottom !== next.mediaPaddingBottom) {
    changed.push(`mediaPaddingBottom ${section.mediaPaddingBottom ?? "∅"}→${next.mediaPaddingBottom}`);
  }
  if (section.mediaPaddingLeft !== next.mediaPaddingLeft) {
    changed.push(`mediaPaddingLeft ${section.mediaPaddingLeft ?? "∅"}→${next.mediaPaddingLeft}`);
  }
  if (section.mediaPaddingRight !== next.mediaPaddingRight) {
    changed.push(`mediaPaddingRight ${section.mediaPaddingRight ?? "∅"}→${next.mediaPaddingRight}`);
  }
  return { next, changed };
}

function patchSections(sections: Section[]) {
  let overviewCount = 0;
  const notes: string[] = [];
  const next = sections.map((s) => {
    if (s._type !== "overviewSection") return s;
    overviewCount++;
    const { next: patched, changed } = patchOverviewMedia(s as OverviewSection);
    if (changed.length) notes.push(changed.join(", "));
    return patched;
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
    `\n${DRY ? "(dry run) " : ""}${docs} doc(s), ${overviews} overview section(s) updated`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
