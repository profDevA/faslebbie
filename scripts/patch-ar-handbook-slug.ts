/**
 * Rename The AR Handbook slug: remote-assistant-object-detection → the-ar-handbook.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-ar-handbook-slug.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-ar-handbook-slug.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const OLD_SLUG = "remote-assistant-object-detection";
const NEW_SLUG = "the-ar-handbook";
const PUB_ID = "cs-remote-assistant-object-detection";

async function main() {
  const doc = await client.fetch<{ _id: string; slug?: { current?: string } }>(
    `*[_type == "caseStudy" && slug.current == $slug][0]{ _id, slug }`,
    { slug: OLD_SLUG },
  );
  if (!doc?._id) {
    const existing = await client.fetch<{ slug?: { current?: string } }>(
      `*[_id == $id][0]{ slug }`,
      { id: PUB_ID },
    );
    if (existing?.slug?.current === NEW_SLUG) {
      console.log(`✓ already ${NEW_SLUG}`);
      return;
    }
    throw new Error(`no case study with slug ${OLD_SLUG}`);
  }

  const slugField = { _type: "slug" as const, current: NEW_SLUG };
  if (DRY) {
    console.log(`DRY ✓ ${OLD_SLUG} → ${NEW_SLUG} (${doc._id})`);
    return;
  }

  await client.patch(doc._id).set({ slug: slugField }).commit();
  console.log(`✓ ${doc._id}: slug → ${NEW_SLUG}`);

  const draftId = `drafts.${doc._id}`;
  const draft = await client.fetch<{ _id: string } | null>(
    `*[_id == $id][0]{ _id }`,
    { id: draftId },
  );
  if (draft?._id) {
    await client.patch(draftId).set({ slug: slugField }).commit();
    console.log(`✓ synced ${draftId}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
