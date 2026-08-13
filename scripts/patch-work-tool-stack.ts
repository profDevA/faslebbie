/**
 * Seed Work Page → toolStack from public/tools/stack/*.png (when present).
 *
 * Run from frontend/:
 *   sanity exec scripts/patch-work-tool-stack.ts --with-user-token
 */
import { randomUUID } from "node:crypto";
import { createReadStream, existsSync } from "node:fs";
import { resolve } from "node:path";

import { getCliClient } from "sanity/cli";

import { toolStackLogos } from "../src/lib/content";

const client = getCliClient({ apiVersion: "2025-01-01" });
const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

async function uploadLogo(filename: string) {
  const path = resolve(process.cwd(), "public/tools/stack", filename);
  if (!existsSync(path)) {
    console.log(`  · skip ${filename} (file missing)`);
    return null;
  }
  const asset = await client.assets.upload(
    "image",
    createReadStream(path),
    { filename, contentType: "image/png" },
  );
  return asset._id;
}

async function main() {
  const id: string | null = await client.fetch(
    `*[_type == "workPage"][0]._id`,
  );
  if (!id) throw new Error("No workPage document");

  const toolStack = [];
  for (const logo of toolStackLogos) {
    const filename = logo.src.split("/").pop()!;
    const assetId = await uploadLogo(filename);
    if (!assetId) continue;
    toolStack.push({
      _type: "toolStackItem",
      _key: key(),
      label: logo.name,
      logo: {
        _type: "image",
        asset: { _type: "reference", _ref: assetId },
      },
    });
    console.log(`  · ${logo.name}`);
  }

  await client
    .patch(id)
    .set({ toolStack, toolStackPerRow: 6 })
    .commit();

  console.log(`patched ${id}: ${toolStack.length} stack icons`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
