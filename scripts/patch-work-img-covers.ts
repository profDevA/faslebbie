/**
 * Patch nine Work `.img` card thumbnails + titles from Figma 2562:39172.
 * Does not replace case-study interiors. Does not re-run migrate.
 *
 * Mosaic is the Design Assist AI card (slug stays design-assist-ai).
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-work-img-covers.ts --with-user-token
 *
 * Expects files in tmp/work-covers/<slug>.png (≥1200px wide for sharp `.img` cards).
 */
import { createReadStream, existsSync } from "node:fs";
import { join } from "node:path";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DIR = join(process.cwd(), "tmp", "work-covers");

const CARDS: { slug: string; title: string; file: string }[] = [
  {
    slug: "2020-us-census-benefit-calculator",
    title: "US Census",
    file: "2020-us-census-benefit-calculator.png",
  },
  {
    slug: "experian-boost",
    title: "Experian Boost",
    file: "experian-boost.png",
  },
  {
    slug: "diamond-valuation-ai",
    title: "Diamond Valuation AI",
    file: "diamond-valuation-ai.png",
  },
  {
    slug: "remote-assistant-object-detection",
    title: "The AR Handbook",
    file: "remote-assistant-object-detection.png",
  },
  {
    slug: "financial-data-exchange",
    title: "Financial Data Exchange",
    file: "financial-data-exchange.png",
  },
  {
    slug: "design-assist-ai",
    title: "Mosaic",
    file: "design-assist-ai.png",
  },
  {
    slug: "oc-digital-resource-navigator",
    title: "OC Navigator",
    file: "oc-digital-resource-navigator.png",
  },
  {
    slug: "oc-links",
    title: "OC Links",
    file: "oc-links.png",
  },
  {
    slug: "acme-lending",
    title: "Acme Lending",
    file: "acme-lending.png",
  },
];

async function uploadCover(file: string) {
  const abs = join(DIR, file);
  if (!existsSync(abs)) throw new Error(`Missing ${abs}`);
  const asset = await client.assets.upload("image", createReadStream(abs), {
    filename: `work-img-${file}`,
    contentType: "image/png",
  });
  console.log(`  ↑ ${file} → ${asset._id}`);
  return {
    _type: "image" as const,
    asset: { _type: "reference" as const, _ref: asset._id },
  };
}

async function main() {
  const docs: { _id: string; slug: string; title?: string }[] =
    await client.fetch(
      `*[_type == "caseStudy"]{ _id, "slug": slug.current, title }`,
    );

  console.log(`before: ${docs.length} case studies`);
  for (const card of CARDS) {
    const doc = docs.find((d) => d.slug === card.slug);
    console.log(`  ${card.slug}: ${doc?.title ?? "MISSING"}`);
  }

  for (const card of CARDS) {
    const abs = join(DIR, card.file);
    if (!existsSync(abs)) {
      console.log(`  skip ${card.slug} — no ${card.file}`);
      continue;
    }
    const doc = docs.find((d) => d.slug === card.slug);
    if (!doc) throw new Error(`No caseStudy for ${card.slug}`);
    const image = await uploadCover(card.file);
    await client
      .patch(doc._id)
      .set({ title: card.title, cardThumbnail: image })
      .commit();
    console.log(`  ✓ ${card.slug} → ${card.title}`);
  }

  const patchedSlugs = CARDS.filter((c) => existsSync(join(DIR, c.file))).map(
    (c) => c.slug,
  );
  const after: { slug: string; title?: string; hasThumb: boolean; w?: number; h?: number }[] =
    await client.fetch(
      `*[_type == "caseStudy" && slug.current in $slugs]{
        "slug": slug.current, title, "hasThumb": defined(cardThumbnail.asset),
        "w": cardThumbnail.asset->metadata.dimensions.width,
        "h": cardThumbnail.asset->metadata.dimensions.height
      }`,
      { slugs: patchedSlugs },
    );
  console.log("after:");
  for (const row of after) {
    console.log(
      `  ${row.slug}: ${row.title} thumb=${row.hasThumb ? "yes" : "NO"} ${row.w ?? "?"}x${row.h ?? "?"}`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
