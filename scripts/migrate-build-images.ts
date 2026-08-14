/**
 * Upload Figma Build .img card covers + fix lorem blurbs on buildPage.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/migrate-build-images.ts --with-user-token
 */
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import {
  BUILD_COVER_URLS,
  BUILD_PLACEHOLDER_IDS,
} from "./seed/build-covers";

const client = getCliClient({ apiVersion: "2025-01-01" });
const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

async function uploadFromUrl(url: string, filename: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const asset = await client.assets.upload("image", buf, {
    filename,
    contentType: "image/png",
  });
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
      subtitle?: string;
      blurb?: string;
      images?: unknown[];
      [k: string]: unknown;
    }[];
  } | null>(`*[_type == "buildPage"][0]{ _id, projects }`);

  if (!page?._id) throw new Error("buildPage not found — run migrate-pages.ts first");

  const coverById = new Map(BUILD_COVER_URLS.map((c) => [c.id, c.url]));

  const projects = [];
  for (const p of page.projects ?? []) {
    const id = p.id ?? "";
    const url = coverById.get(id);
    let images = p.images;

    if (url) {
      console.log(`  ↑ ${id} cover…`);
      const image = await uploadFromUrl(url, `build-${id}.png`);
      images = [image];
    } else if (BUILD_PLACEHOLDER_IDS.has(id)) {
      console.log(`  · ${id} — Figma white placeholder (no image)`);
      images = [];
    } else {
      console.log(`  · skip ${id || p.title}`);
    }

    const blurb =
      p.subtitle?.trim() ||
      (typeof p.blurb === "string" && !p.blurb.includes("Lorem ipsum")
        ? p.blurb
        : p.subtitle) ||
      p.blurb;

    projects.push({
      ...p,
      _key: p._key ?? key(),
      images,
      blurb: blurb ?? "",
    });
  }

  await client
    .patch(page._id)
    .set({ projects })
    .commit({ autoGenerateArrayKeys: true });

  console.log(`✓ patched buildPage (${projects.length} projects)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
