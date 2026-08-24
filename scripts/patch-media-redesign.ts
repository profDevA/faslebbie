/**
 * Patch blogsPage `.media` — Design Again featured + 4 talk rows (Figma 3323:9065).
 * Patches published AND draft. Keeps existing thumbs/videos on matched slugs.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-media-redesign.ts --with-user-token
 */
import { createReadStream } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";

import { getCliClient } from "sanity/cli";

import { seedMediaFeatured, seedMediaTalks } from "./seed/media-seed";

const client = getCliClient({ apiVersion: "2025-01-01" });
const PUBLISHED_ID = "blogsPage";
const DRAFT_ID = `drafts.${PUBLISHED_ID}`;
const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

const HERO_PATH = path.join(
  process.cwd(),
  "public/media/design-again-hero.png",
);

type MediaRow = {
  _key?: string;
  slug?: string;
  title?: string;
  platform?: string;
  year?: string;
  format?: string;
  thumb?: unknown;
  video?: unknown;
  videoFile?: unknown;
  source?: string;
  detail?: string;
  description?: string;
  themes?: string[];
};

async function uploadHeroIfNeeded(): Promise<
  | { _type: "image"; asset: { _type: "reference"; _ref: string } }
  | undefined
> {
  try {
    const asset = await client.assets.upload(
      "image",
      createReadStream(HERO_PATH),
      { filename: "design-again-hero.png" },
    );
    return {
      _type: "image",
      asset: { _type: "reference", _ref: asset._id },
    };
  } catch (err) {
    console.warn("Could not upload hero image:", err);
    return undefined;
  }
}

function buildMediaRows(existing: MediaRow[]) {
  const bySlug = new Map(
    existing.filter((m) => m.slug).map((m) => [m.slug!, m]),
  );

  return seedMediaTalks.map((seed) => {
    const prev = bySlug.get(seed.slug);
    return {
      _type: "mediaEntry" as const,
      _key: prev?._key ?? key(),
      slug: seed.slug,
      format: seed.format,
      title: seed.title,
      platform: seed.platform,
      year: seed.year,
      source: seed.platform,
      detail: `${seed.platform} · ${seed.year}`,
      description: prev?.description ?? "",
      themes: prev?.themes ?? [],
      ...(prev?.thumb ? { thumb: prev.thumb } : {}),
      ...(prev?.video ? { video: prev.video } : {}),
      ...(prev?.videoFile ? { videoFile: prev.videoFile } : {}),
    };
  });
}

async function main() {
  const published = await client.fetch<{
    _id: string;
    media?: MediaRow[];
    mediaFeatured?: unknown;
  } | null>(
    `*[_type == "blogsPage" && _id == $id][0]{ _id, media, mediaFeatured }`,
    { id: PUBLISHED_ID },
  );
  if (!published?._id) throw new Error("No published blogsPage document");

  const draft = await client.getDocument(DRAFT_ID).catch(() => null);

  const before = published.media ?? [];
  console.log(`before: ${before.length} media talks`);

  const heroImage = await uploadHeroIfNeeded();
  const mediaFeatured = {
    _type: "mediaFeatured" as const,
    ...seedMediaFeatured,
    ...(heroImage ? { heroImage } : {}),
  };

  const media = buildMediaRows(before);

  const set = { mediaFeatured, media };

  for (const id of draft ? [PUBLISHED_ID, DRAFT_ID] : [PUBLISHED_ID]) {
    await client.patch(id).set(set).commit();
    console.log(`✓ patched ${id}`);
  }

  console.log(`after: featured podcast + ${media.length} talks`);
  media.forEach((m, i) => console.log(`  ${i + 1}. ${m.title}`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
