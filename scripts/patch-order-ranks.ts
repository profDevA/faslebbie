/**
 * Reset orderRank to valid LexoRank strings for all orderable document types.
 *
 * migrate scripts seeded "00001"-style ranks; @sanity/orderable-document-list
 * expects LexoRank (e.g. "0|100008:"). Invalid ranks break drag-and-drop.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-order-ranks.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

import { commitLexoRankOrder, type OrderRankDoc } from "./lib/lexorank-order";

const client = getCliClient({ apiVersion: "2025-01-01" });

const ORDERABLE_TYPES = [
  { type: "category", label: "title" },
  { type: "caseStudy", label: "title" },
  { type: "testimonial", label: "name" },
] as const;

async function resetType(type: string, label: string) {
  const docs: (OrderRankDoc & { label?: string })[] = await client.fetch(
    `*[_type == $type && !(_id in path("drafts.**"))] | order(orderRank asc) {
      _id,
      orderRank,
      "label": coalesce(${label}, _id)
    }`,
    { type },
  );

  console.log(`\n${type}: ${docs.length} docs`);
  for (const [i, d] of docs.entries()) {
    console.log(`  ${i + 1}. ${d.label ?? d._id} — ${d.orderRank ?? "(missing)"}`);
  }

  if (!docs.length) return;
  const count = await commitLexoRankOrder(client, docs);
  console.log(`✓ patched ${count} ${type} documents`);
}

async function main() {
  for (const { type, label } of ORDERABLE_TYPES) {
    await resetType(type, label);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
