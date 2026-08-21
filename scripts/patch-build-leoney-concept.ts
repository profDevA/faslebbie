/**
 * Upload Leoney concept screenshot (Figma 16:2615 / 16:2613) as images[1].
 * Keeps images[0] gallery cover untouched.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-build-leoney-concept.ts --with-user-token
 *
 * Expects tmp/build-covers/leoney-concept.png
 */
import { createReadStream, existsSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const key = () => randomUUID().replace(/-/g, "").slice(0, 12);
const FILE = join(process.cwd(), "tmp", "build-covers", "leoney-concept.png");

async function main() {
  if (!existsSync(FILE)) {
    throw new Error(`Missing ${FILE} — export Figma 16:2615 first`);
  }

  const page = await client.fetch<{
    _id: string;
    projects?: {
      _key?: string;
      id?: string;
      images?: { _key?: string; asset?: { _ref?: string } }[];
    }[];
  } | null>(`*[_type == "buildPage"][0]{ _id, projects }`);

  if (!page?._id) throw new Error("buildPage not found");

  const leoney = (page.projects ?? []).find((p) => p.id === "leoney");
  if (!leoney) throw new Error("leoney not found");

  const asset = await client.assets.upload(
    "image",
    createReadStream(FILE),
    {
      filename: "build-concept-leoney-16-2615.png",
      contentType: "image/png",
    },
  );
  console.log(`  ↑ leoney-concept.png → ${asset._id}`);

  const cover = leoney.images?.[0];
  const concept = {
    _type: "image" as const,
    _key: key(),
    asset: { _type: "reference" as const, _ref: asset._id },
  };

  const projects = (page.projects ?? []).map((p) =>
    p.id === "leoney"
      ? { ...p, images: cover ? [cover, concept] : [concept] }
      : p,
  );

  await client.patch(page._id).set({ projects }).commit({
    autoGenerateArrayKeys: true,
  });

  console.log(`✓ leoney images[1] concept set on ${page._id}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
