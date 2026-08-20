/**
 * Patch Work `.img` card titles + order to Figma 2562:39172.
 *
 * Wall is round-robin into 4 columns (`WorkBody`), so this list is the
 * Figma columns interleaved (row by row). Extra studies not on that
 * frame stay at the end.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-work-img-titles-order.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

console.log("patch-work-img-titles-order starting");

const client = getCliClient({ apiVersion: "2025-01-01" });

/** Figma caption text. Slug unchanged. */
const TITLES: Record<string, string> = {
  "2020-us-census-benefit-calculator": "US Census",
  "snapback-lifestyle": "Snapback Watch",
  "oc-digital-resource-navigator": "OC Navigator",
  "coral-health": "Coral Health",
  "diamond-valuation-ai": "Diamond Valuation AI",
  "forever-a-surfer": "Forever a Surfer",
  "memory-tubes": "Memory Tubes",
  "experian-boost": "Experian Boost",
  "financial-data-exchange": "Financial Data Exchange",
  "design-assist-ai": "Mosaic",
  "acme-lending": "Acme Lending",
  "life-of-a-miner-vr": "Life of a Miner VR",
  "remote-assistant-object-detection": "The AR Handbook",
  "oc-links": "OC Links",
};

/**
 * Round-robin order so desktop 4-col wall matches Figma columns:
 *   col1: Census, Snapback Watch, OC Navigator
 *   col2: Coral, Diamond, Forever a Surfer, Memory Tubes
 *   col3: Experian, FDX, Mosaic, Acme
 *   col4: Miner VR, AR Handbook, OC Links
 * Then studies not on that frame.
 */
const ORDER = [
  "2020-us-census-benefit-calculator",
  "coral-health",
  "experian-boost",
  "life-of-a-miner-vr",
  "snapback-lifestyle",
  "diamond-valuation-ai",
  "financial-data-exchange",
  "remote-assistant-object-detection",
  "oc-digital-resource-navigator",
  "forever-a-surfer",
  "design-assist-ai",
  "oc-links",
  "memory-tubes",
  "acme-lending",
  "galderma",
  "vuforia-chalk",
  "vuforia-expert-capture",
];

async function main() {
  const docs: { _id: string; slug: string; title?: string; orderRank?: string }[] =
    await client.fetch(
      `*[_type == "caseStudy"]{ _id, "slug": slug.current, title, orderRank }`,
    );

  console.log(`before: ${docs.length} docs`);
  const published = docs.filter((d) => !d._id.startsWith("drafts."));
  published
    .slice()
    .sort((a, b) => (a.orderRank ?? "").localeCompare(b.orderRank ?? ""))
    .forEach((d, i) => console.log(`  ${i + 1}. ${d.title} (${d.slug})`));

  const bySlug = new Map<string, typeof docs>();
  for (const d of docs) {
    const list = bySlug.get(d.slug) ?? [];
    list.push(d);
    bySlug.set(d.slug, list);
  }

  const missing = ORDER.filter((s) => !bySlug.has(s));
  if (missing.length) throw new Error(`Missing slugs: ${missing.join(", ")}`);

  const extras = [...bySlug.keys()].filter((s) => !ORDER.includes(s));
  const finalOrder = [...ORDER, ...extras];

  let tx = client.transaction();
  finalOrder.forEach((slug, i) => {
    const rank = String(i + 1).padStart(5, "0");
    const title = TITLES[slug];
    for (const doc of bySlug.get(slug) ?? []) {
      const patch: { orderRank: string; title?: string } = { orderRank: rank };
      if (title) patch.title = title;
      tx = tx.patch(doc._id, (p) => p.set(patch));
    }
  });
  await tx.commit();

  const after: { slug: string; title?: string; orderRank?: string }[] =
    await client.fetch(
      `*[_type == "caseStudy" && !(_id in path("drafts.**"))] | order(orderRank asc){
        "slug": slug.current, title, orderRank
      }`,
    );
  console.log("after:");
  after.forEach((d, i) => console.log(`  ${i + 1}. ${d.title} (${d.slug}) ${d.orderRank}`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
