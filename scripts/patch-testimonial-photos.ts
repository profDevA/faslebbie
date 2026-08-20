/**
 * Upload Figma white-bg headshots and patch testimonial.photo only.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-testimonial-photos.ts --with-user-token
 */
import { createReadStream } from "node:fs";
import { resolve } from "node:path";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

const FILES: { name: string; file: string }[] = [
  { name: "J. Conor Sullivan", file: "conor.png" },
  { name: "Bo Jiang", file: "bo.png" },
  { name: "Mrugesh Patel", file: "mrugesh.png" },
  { name: "Levi Soler", file: "levi.png" },
  { name: "Yinka Jayeola", file: "yinka.png" },
  { name: "Jummy Abodunrin", file: "jummy.png" },
  { name: "Sam Lagoy", file: "sam.png" },
  { name: "Louis Hardiman", file: "louis.png" },
  { name: "Israel Adeleke", file: "israel.png" },
  { name: "Rich Nelson", file: "rich.png" },
  { name: "Virender Kumar", file: "virender.png" },
  { name: "Justyn Ramirez", file: "justyn.png" },
  { name: "Anthony Walsh", file: "anthony.png" },
  { name: "Tori Lamb", file: "tori.png" },
];

async function main() {
  const docs: { _id: string; name: string }[] = await client.fetch(
    `*[_type == "testimonial"]{ _id, name }`,
  );
  console.log(`before: ${docs.length} testimonials`);

  for (const row of FILES) {
    const doc = docs.find((d) => d.name === row.name);
    if (!doc) {
      console.warn(`  ! no Sanity doc for ${row.name}`);
      continue;
    }
    const path = resolve(process.cwd(), "public/testimonials", row.file);
    const asset = await client.assets.upload("image", createReadStream(path), {
      filename: row.file,
      contentType: "image/png",
    });
    await client
      .patch(doc._id)
      .set({
        photo: {
          _type: "image",
          asset: { _type: "reference", _ref: asset._id },
        },
      })
      .commit();
    console.log(`  ${row.name} ← ${row.file} ${asset._id}`);
  }

  const after: { name: string; url: string | null }[] = await client.fetch(
    `*[_type == "testimonial"]|order(orderRank asc){ name, "url": photo.asset->url }`,
  );
  console.log(`after: ${after.filter((t) => t.url).length}/${after.length} have photos`);
  for (const t of after) console.log(`  ${t.name}: ${t.url ? "yes" : "MISSING"}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
