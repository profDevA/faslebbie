/**
 * Trim buildPage.projects to Figma `3044:2200` (7 cards). Removes legacy
 * root-diamonds / provify / model-affiliate; appends SenseSpace AI; reorders.
 * Does not touch intro or project images except SenseSpace cover upload.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-build-trim-projects.ts --with-user-token
 */
import { createReadStream, existsSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const key = () => randomUUID().replace(/-/g, "").slice(0, 12);
const COVER_DIR = join(process.cwd(), "tmp", "build-covers");

/** Figma row order (4 + 3). */
const ORDER = [
  "leoney",
  "pebble",
  "gradstudio",
  "rookieball",
  "sensespace-ai",
  "deepsocal-agent",
  "mineral-pulse",
] as const;

const DROP = new Set(["root-diamonds", "provify", "model-affiliate"]);

const SENSESPACE = {
  id: "sensespace-ai",
  title: "SenseSpace AI",
  tech: ["Claude", "GPT", "Figma"],
  span: "md" as const,
  tint: "#545064",
  kicker: "Design · 5 Min Read",
  subtitle:
    "An AI research tool built on a design-methodology taxonomy, cutting research analysis time 70% across 50+ design teams.",
  blurb:
    "An AI research tool built on a design-methodology taxonomy, cutting research analysis time 70% across 50+ design teams.",
};

async function uploadSenseCover() {
  const file = join(COVER_DIR, "sensespace-ai.png");
  if (!existsSync(file)) {
    throw new Error(`Missing ${file} — export Figma 3044:3086 @3x first`);
  }
  const asset = await client.assets.upload("image", createReadStream(file), {
    filename: "build-img-3x-sensespace-ai.png",
    contentType: "image/png",
  });
  console.log(`  ↑ sensespace-ai.png → ${asset._id}`);
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
      [k: string]: unknown;
    }[];
  } | null>(`*[_type == "buildPage"][0]{ _id, projects }`);

  if (!page?._id) throw new Error("buildPage not found");

  const beforeIds = (page.projects ?? []).map((p) => p.id).filter(Boolean);
  console.log(`Before: ${beforeIds.length} projects — ${beforeIds.join(", ")}`);

  const byId = new Map(
    (page.projects ?? [])
      .filter((p) => p.id && !DROP.has(p.id))
      .map((p) => [p.id!, p] as const),
  );

  if (!byId.has(SENSESPACE.id)) {
    const cover = await uploadSenseCover();
    byId.set(SENSESPACE.id, {
      _type: "buildProjectItem",
      _key: key(),
      ...SENSESPACE,
      images: [cover],
    });
    console.log(`  + added ${SENSESPACE.id}`);
  }

  const projects = [];
  for (const id of ORDER) {
    const p = byId.get(id);
    if (!p) {
      console.warn(`  ! missing ${id} in Sanity — skipped`);
      continue;
    }
    projects.push({ ...p, _key: p._key ?? key() });
  }

  await client
    .patch(page._id)
    .set({ projects })
    .commit({ autoGenerateArrayKeys: true });

  const afterIds = projects.map((p) => p.id);
  console.log(`After:  ${afterIds.length} projects — ${afterIds.join(", ")}`);
  console.log(`✓ patched ${page._id}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
