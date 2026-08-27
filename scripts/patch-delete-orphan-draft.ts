/**
 * Delete stray caseStudy draft with no slug/title (causes duplicate null keys in queries).
 *
 * Run from frontend/:
 *   sanity exec scripts/patch-delete-orphan-draft.ts --with-user-token -- --dry
 *   sanity exec scripts/patch-delete-orphan-draft.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const ORPHAN_ID = "drafts.d25ccff2-9cde-454d-a555-3f998abb73ed";
const DRY = process.argv.includes("--dry");

async function main() {
  const doc = await client.fetch<{ _id: string; slug?: { current?: string }; title?: string } | null>(
    `*[_id == $id][0]{ _id, slug, title }`,
    { id: ORPHAN_ID },
  );
  if (!doc) {
    console.log("Orphan draft already gone.");
    return;
  }
  console.log("orphan:", doc._id, "slug:", doc.slug?.current ?? null, "title:", doc.title ?? null);
  if (DRY) {
    console.log("(dry run — nothing deleted)");
    return;
  }
  await client.delete(ORPHAN_ID);
  console.log(`✓ deleted ${ORPHAN_ID}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
