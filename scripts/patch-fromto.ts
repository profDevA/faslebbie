/**
 * Seed the `from` / `to` pair on every case study.
 *
 * Fas 08/05 asked for the before/after framing on the hero and the .img card.
 * Every frame Israel has drawn carries the same placeholder pair — "Jargon" and
 * "Insightful" — because the real wording per project hasn't been written yet.
 * This puts that placeholder on all 17 so the layout is complete and reviewable,
 * exactly as the placeholder credit names already are. Replace the values in the
 * Studio (Card tab, From / To) as the real copy arrives.
 *
 * Skips any study that already has a value, so real copy is never overwritten.
 *
 * Run from frontend/:
 *   sanity exec scripts/patch-fromto.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

const PLACEHOLDER = { from: "Jargon", to: "Insightful" };

async function main() {
  const docs: { _id: string; slug: string; from?: string; to?: string }[] =
    await client.fetch(
      `*[_type == "caseStudy"]{ _id, "slug": slug.current, from, to }`,
    );

  const pending = docs.filter((d) => !d.from && !d.to);
  console.log(`${docs.length} case studies, ${pending.length} without a From/To pair.`);
  if (!pending.length) return console.log("Nothing to do.");

  let tx = client.transaction();
  for (const doc of pending) tx = tx.patch(doc._id, (p) => p.set(PLACEHOLDER));
  await tx.commit();

  for (const doc of pending) console.log(`  seeded ${doc.slug}`);
  console.log("Done — replace these in the Studio as the real copy arrives.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
