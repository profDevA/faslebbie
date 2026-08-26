/**
 * Restore case study `sections` from Sanity History (before the bad
 * patch-problem-context-sections run that stripped all media fields).
 *
 * Run from frontend/:
 *   npx sanity exec scripts/restore-case-study-sections-from-history.ts --with-user-token
 *
 * Then re-run the fixed patch-problem-context-sections.ts if needed.
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

/** Just before the destructive patch (2026-08-26T08:05:12Z). */
const HISTORY_TIME = "2026-08-26T07:59:00Z";

type SanityDoc = { _id: string; sections?: unknown[] };

async function historySections(docId: string): Promise<unknown[] | null> {
  const id = docId.replace(/^drafts\./, "");
  const resp = await client.request<{ documents?: SanityDoc[] }>({
    uri: `/data/history/production/documents/${id}?time=${encodeURIComponent(HISTORY_TIME)}`,
    withCredentials: true,
  });
  const sections = resp.documents?.[0]?.sections;
  return sections?.length ? sections : null;
}

function hasOverviewMedia(sections: unknown[]) {
  const overview = sections.find(
    (s) => (s as { _type?: string })._type === "overviewSection",
  ) as { sideImage?: unknown; sideVideo?: unknown } | undefined;
  return !!(overview?.sideImage || overview?.sideVideo);
}

async function main() {
  const docs: { _id: string; slug?: string; title?: string }[] = await client.fetch(
    `*[_type == "caseStudy" && !(_id in path("drafts.**"))]{ _id, title, "slug": slug.current }`,
  );

  console.log(`restoring sections from ${HISTORY_TIME} for ${docs.length} published case studies`);

  let restored = 0;
  let skipped = 0;

  for (const doc of docs) {
    const sections = await historySections(doc._id);
    if (!sections) {
      console.log(`  skip ${doc.slug ?? doc._id}: no history sections`);
      skipped++;
      continue;
    }
    if (!hasOverviewMedia(sections)) {
      console.log(`  skip ${doc.slug ?? doc._id}: history has no overview media`);
      skipped++;
      continue;
    }

    await client.patch(doc._id).set({ sections }).commit();
    console.log(`→ ${doc.slug ?? doc.title ?? doc._id}: restored ${sections.length} sections`);
    restored++;
  }

  console.log(`✓ restored ${restored} doc(s), skipped ${skipped}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
