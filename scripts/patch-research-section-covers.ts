/**
 * Upload Figma Mineral Choreography cover (3550:2781) onto
 * researchPage.paradigms.image and researchPage.principles.image.
 * Does not touch copy or field notes.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-research-section-covers.ts --with-user-token
 *
 * Expects tmp/research-covers/mineral-choreography-book.png
 */
import { createReadStream, existsSync } from "node:fs";
import { join } from "node:path";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const FILE = join(process.cwd(), "tmp", "research-covers", "mineral-choreography-book.png");

async function main() {
  if (!existsSync(FILE)) throw new Error(`Missing ${FILE}`);

  const asset = await client.assets.upload("image", createReadStream(FILE), {
    filename: "research-paradigms-principles-mineral-choreography.png",
    contentType: "image/png",
  });
  console.log(`  ↑ mineral-choreography-book.png → ${asset._id}`);

  const image = {
    _type: "image" as const,
    asset: { _type: "reference" as const, _ref: asset._id },
  };

  await client.patch("researchPage").set({
    "paradigms.image": image,
    "principles.image": image,
  }).commit();

  console.log("✓ paradigms.image + principles.image updated (Figma 3550:2781 HQ)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
