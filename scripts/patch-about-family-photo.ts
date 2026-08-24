/**
 * Re-upload the inline About family photo (replaces tiny thumbnail in Sanity).
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-about-family-photo.ts --with-user-token
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const PUBLIC = join(process.cwd(), "public");
const FAMILY = join(PUBLIC, "family.png");

async function main() {
  if (!existsSync(FAMILY)) {
    throw new Error(`Missing ${FAMILY} — add a high-res family.png first.`);
  }

  const asset = await client.assets.upload("image", createReadStream(FAMILY), {
    filename: basename(FAMILY),
  });
  const { width, height } = asset.metadata?.dimensions ?? {};
  console.log(`uploaded family.png → ${asset._id} (${width ?? "?"}×${height ?? "?"})`);

  const doc = await client.fetch<{ _id: string; bio?: unknown[] }>(
    `*[_type == "aboutPage"][0]{ _id, bio }`,
  );
  if (!doc?._id || !doc.bio?.length) throw new Error("aboutPage not found");

  let patched = 0;
  const bio = structuredClone(doc.bio) as Array<{
    _type?: string;
    children?: Array<{
      _type?: string;
      image?: { _type: "image"; asset: { _type: "reference"; _ref: string } };
    }>;
  }>;

  for (const block of bio) {
    if (block._type !== "block" || !block.children) continue;
    for (const child of block.children) {
      if (child._type !== "aboutPhoto") continue;
      child.image = {
        _type: "image",
        asset: { _type: "reference", _ref: asset._id },
      };
      patched += 1;
    }
  }

  if (!patched) throw new Error("No aboutPhoto inline object found in bio");

  await client.patch(doc._id).set({ bio }).commit();
  console.log(`patched ${patched} aboutPhoto reference(s) on ${doc._id}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
