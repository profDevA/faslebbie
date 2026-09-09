/**
 * Read-only audit — Core Experience config for all published case studies.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/check-case-study-ce-status.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient();

async function main() {
  const rows = await client.fetch<
    {
      slug: string;
      title: string;
      layoutVariant: string | null;
      mobileCount: number | null;
      popupCount: number | null;
      previewCount: number | null;
    }[]
  >(
    `*[_type == "caseStudy" && !(_id in path("drafts.**")) && defined(slug.current)]{
      "slug": slug.current,
      title,
      "layoutVariant": sections[_type == "coreExperience"][0].layoutVariant,
      "mobileCount": count(sections[_type == "coreExperience"][0].mobilePreviewScreens),
      "previewCount": count(sections[_type == "coreExperience"][0].previewScreens),
      "popupCount": count(sections[_type == "coreExperience"][0].popupTabs[0].items)
    } | order(slug asc)`,
  );

  console.log(`Published case studies: ${rows.length}\n`);
  console.table(
    rows.map(r => ({
      slug: r.slug,
      title: r.title,
      layout: r.layoutVariant ?? "—",
      preview: r.previewCount ?? "—",
      popup: r.popupCount ?? "—",
      mobilePreviewScreens: r.mobileCount ?? "—",
    })),
  );
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
