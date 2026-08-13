/**
 * Upload public/home-portrait.png → Site Settings → homePortrait only.
 *
 * Run from frontend/:
 *   sanity exec scripts/patch-home-portrait.ts --with-user-token
 */
import { createReadStream } from "node:fs";
import { resolve } from "node:path";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

async function main() {
  const id: string | null = await client.fetch(
    `*[_type == "siteSettings"][0]._id`,
  );
  if (!id) throw new Error("No siteSettings document");

  const path = resolve(process.cwd(), "public/home-portrait.png");
  const asset = await client.assets.upload(
    "image",
    createReadStream(path),
    {
      filename: "home-portrait.png",
      contentType: "image/png",
    },
  );
  console.log(`uploaded home-portrait.png → ${asset._id}`);

  await client
    .patch(id)
    .set({
      homePortrait: {
        _type: "image",
        asset: { _type: "reference", _ref: asset._id },
      },
    })
    .commit();

  console.log(`patched ${id}: homePortrait`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
