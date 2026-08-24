/**
 * Reset testimonial orderRank to valid LexoRank strings.
 *
 * migrate-testimonials.ts seeded "00001"-style ranks; the orderable list plugin
 * expects LexoRank (e.g. "0|hzzzzz:"). Invalid ranks all parse to min(), so
 * drag-and-drop throws on between() and reorder fails silently in Studio.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-testimonial-order-ranks.ts --with-user-token
 */
import { LexoRank } from "lexorank";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

async function main() {
  const docs: { _id: string; name?: string; orderRank?: string }[] =
    await client.fetch(
      `*[_type == "testimonial" && !(_id in path("drafts.**"))] | order(orderRank asc) { _id, name, orderRank }`,
    );

  console.log(`before: ${docs.length} testimonials`);
  docs.forEach((d, i) =>
    console.log(`  ${i + 1}. ${d.name ?? d._id} — ${d.orderRank ?? "(missing)"}`),
  );

  if (!docs.length) {
    console.log("nothing to patch");
    return;
  }

  let rank = LexoRank.min();
  let tx = client.transaction();
  for (const doc of docs) {
    rank = rank.genNext().genNext();
    tx = tx.patch(doc._id, (p) => p.set({ orderRank: rank.toString() }));
  }
  await tx.commit();

  const after: { name?: string; orderRank?: string }[] = await client.fetch(
    `*[_type == "testimonial" && !(_id in path("drafts.**"))] | order(orderRank asc) { name, orderRank }`,
  );
  console.log(`✓ patched ${after.length} testimonials with LexoRank orderRank`);
  after.forEach((d, i) => console.log(`  ${i + 1}. ${d.name} — ${d.orderRank}`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
