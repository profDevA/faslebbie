/**
 * Upload Figma output visuals onto buildPage.projects[].outputVisual.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-build-output-visuals.ts --with-user-token
 *
 * Expects tmp/build-output-visuals/<project-id>.png
 */
import { createReadStream, existsSync } from "node:fs";
import { join } from "node:path";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DIR = join(process.cwd(), "tmp", "build-output-visuals");

/** project id → Figma node (3550:*) */
const OUTPUTS: { id: string; file: string; figma: string }[] = [
  { id: "leoney", file: "leoney.png", figma: "3550:3085" },
  { id: "pebble", file: "pebble.png", figma: "3550:2783" },
  { id: "sensespace-ai", file: "sensespace-ai.png", figma: "3550:3197" },
  { id: "deepsocal-agent", file: "deepsocal-agent.png", figma: "3550:3939" },
  { id: "mineral-pulse", file: "mineral-pulse.png", figma: "3550:4666" },
];

type Project = { id?: string; outputVisual?: unknown; [k: string]: unknown };

async function upload(file: string, filename: string) {
  const path = join(DIR, file);
  if (!existsSync(path)) throw new Error(`Missing ${path}`);
  const asset = await client.assets.upload("image", createReadStream(path), {
    filename,
    contentType: "image/png",
  });
  return {
    _type: "image" as const,
    asset: { _type: "reference" as const, _ref: asset._id },
  };
}

async function main() {
  const page = await client.fetch<{ _id: string; projects?: Project[] } | null>(
    `*[_type == "buildPage"][0]{ _id, projects }`,
  );
  if (!page?._id) throw new Error("buildPage not found");

  const projects = structuredClone(page.projects ?? []);
  let patched = 0;

  for (const spec of OUTPUTS) {
    const row = projects.find((p) => p.id === spec.id);
    if (!row) {
      console.warn(`  ⚠ no project ${spec.id}`);
      continue;
    }
    row.outputVisual = await upload(
      spec.file,
      `build-output-${spec.id}-${spec.figma.replace(":", "-")}.png`,
    );
    console.log(`  ↑ ${spec.file} → ${spec.id} (Figma ${spec.figma})`);
    patched += 1;
  }

  if (!patched) throw new Error("No projects patched");

  await client.patch(page._id).set({ projects }).commit();
  console.log(`✓ outputVisual — ${patched} project(s) updated`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
