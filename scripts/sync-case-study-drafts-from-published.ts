/**
 * Sync case-study drafts from published after migrate-case-studies-coral-template.ts.
 * Studio edits the draft (`drafts.cs-*`); migration only patched published ids, so
 * drafts can still contain legacy proseSection/bulletSection that the schema rejects.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/sync-case-study-drafts-from-published.ts --with-user-token -- --dry
 *   npx sanity exec scripts/sync-case-study-drafts-from-published.ts --with-user-token
 *   npx sanity exec scripts/sync-case-study-drafts-from-published.ts --with-user-token -- --slug=experian-boost
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const slugArg = process.argv.find((a) => a.startsWith("--slug="))?.split("=")[1];

const LEGACY = new Set(["proseSection", "bulletSection", "mediaSection", "gallerySection"]);

const SYNC_FIELDS = ["sections", "title", "tagline", "from", "to"] as const;

async function main() {
  const pubs: { _id: string; slug: string }[] = await client.fetch(
    `*[_type == "caseStudy" && !(_id in path("drafts.**"))]{
      _id,
      "slug": slug.current
    } | order(slug asc)`,
  );

  const targets = slugArg ? pubs.filter((p) => p.slug === slugArg) : pubs;
  if (slugArg && !targets.length) {
    console.error(`No published case study with slug "${slugArg}"`);
    process.exit(1);
  }

  let synced = 0;
  for (const { _id, slug } of targets) {
    const draftId = `drafts.${_id}`;
    const [pub, draft] = await Promise.all([
      client.getDocument(_id),
      client.getDocument(draftId),
    ]);
    if (!draft) {
      console.log(`  skip ${slug}: no draft`);
      continue;
    }

    const draftLegacy = ((draft.sections ?? []) as { _type: string }[]).filter((s) =>
      LEGACY.has(s._type),
    );
    const pubSections = (pub?.sections ?? []) as { _type: string }[];
    const needsSync =
      draftLegacy.length > 0 ||
      pubSections.length !== (draft.sections ?? []).length ||
      JSON.stringify(pubSections.map((s) => s._type)) !==
        JSON.stringify(((draft.sections ?? []) as { _type: string }[]).map((s) => s._type));

    if (!needsSync) {
      console.log(`  ok ${slug}`);
      continue;
    }

    const patch: Record<string, unknown> = {};
    for (const f of SYNC_FIELDS) {
      if (pub && pub[f] !== undefined) patch[f] = pub[f];
    }

    console.log(
      `→ ${slug}: draft legacy=[${draftLegacy.map((s) => s._type).join(",")}] → sync from published`,
    );
    if (!DRY) {
      await client.patch(draftId).set(patch).commit();
    }
    synced++;
  }

  console.log(`\n${DRY ? "(dry run) " : ""}synced ${synced} draft(s)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
