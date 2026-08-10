/**
 * Upload Figma Build .img card covers (16:2783) into Sanity buildPage.
 * Gradstudio + Mineral Pulse stay empty (white placeholders in Figma).
 *
 * Run from frontend/:
 *   sanity exec scripts/patch-build-covers.ts --with-user-token
 *
 * Expects files in tmp/build-covers/<project-id>.png
 */
import { createReadStream, existsSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DIR = join(process.cwd(), "tmp", "build-covers");
const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

/** project id → local cover filename (Figma card export @2x). */
const COVERS: { id: string; file: string }[] = [
  { id: "leoney", file: "leoney.png" },
  { id: "pebble", file: "pebble.png" },
  { id: "rookieball", file: "rookieball.png" },
  { id: "root-diamonds", file: "root-diamonds.png" },
  { id: "deepsocal-agent", file: "deepsocal-agent.png" },
  { id: "provify", file: "provify.png" },
  { id: "model-affiliate", file: "model-affiliate.png" },
];

async function uploadCover(file: string) {
  const abs = join(DIR, file);
  if (!existsSync(abs)) throw new Error(`Missing ${abs}`);
  const asset = await client.assets.upload("image", createReadStream(abs), {
    filename: `build-${file}`,
    contentType: "image/png",
  });
  console.log(`  ↑ ${file} → ${asset._id}`);
  return {
    _type: "image" as const,
    _key: key(),
    asset: { _type: "reference" as const, _ref: asset._id },
  };
}

async function main() {
  const page = await client.fetch<{
    _id: string;
    projects?: {
      _key?: string;
      id?: string;
      title?: string;
      images?: unknown[];
      [k: string]: unknown;
    }[];
  } | null>(`*[_type == "buildPage"][0]{ _id, projects }`);

  if (!page?._id) throw new Error("buildPage not found");

  const byId = new Map(
    COVERS.map((c) => [c.id, c] as const),
  );

  const projects = [];
  for (const p of page.projects ?? []) {
    const cover = p.id ? byId.get(p.id) : undefined;
    if (!cover) {
      projects.push(p);
      console.log(`  · skip ${p.id ?? p.title} (no Figma cover / placeholder)`);
      continue;
    }
    const image = await uploadCover(cover.file);
    projects.push({
      ...p,
      _key: p._key ?? key(),
      images: [image],
    });
    console.log(`  ✓ ${p.id} cover set`);
  }

  await client
    .patch(page._id)
    .set({ projects })
    .commit({ autoGenerateArrayKeys: true });

  console.log(`✓ patched ${page._id} (${projects.length} projects)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
