/**
 * One-off migration: seed the `blogsPage` singleton in Sanity from the in-code
 * data model (src/lib/blogs.ts). Idempotent: fixed _id + createOrReplace.
 * Uploads the real blog cover art + in-article diagrams (migrated from
 * faslebbie.com into frontend/public/blog/) as Sanity image assets, so the CMS
 * owns them. Media thumbs/embeds are still added by the team in the Studio.
 *
 * Run from frontend/:
 *   sanity exec scripts/migrate-blogs.ts --with-user-token
 */
import { createReadStream } from "node:fs";
import { access } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";

import { getCliClient } from "sanity/cli";

import { blogPosts, mediaItems, type BlogBlock } from "../src/lib/blogs";

const client = getCliClient({ apiVersion: "2025-01-01" });
const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

// Upload a /blog/… public image once, returning its Sanity asset _id. Cached so
// re-runs (and repeated srcs) don't re-upload.
const assetCache = new Map<string, string>();
async function uploadImage(src: string): Promise<string | undefined> {
  if (assetCache.has(src)) return assetCache.get(src);
  const file = path.join(process.cwd(), "public", src);
  try {
    await access(file);
  } catch {
    console.warn(`  ! missing image, skipping: ${src}`);
    return undefined;
  }
  const asset = await client.assets.upload("image", createReadStream(file), {
    filename: path.basename(file),
  });
  assetCache.set(src, asset._id);
  return asset._id;
}

function imageValue(assetId: string) {
  return { _type: "image", _key: key(), asset: { _type: "reference", _ref: assetId } };
}

// Convert the flat article body into Portable Text blocks (+ image blocks) for
// the Studio.
async function toPortableText(body: BlogBlock[] | undefined) {
  if (!body?.length) return undefined;
  const out = [];
  for (const b of body) {
    if (b.kind === "img") {
      const id = await uploadImage(b.text);
      if (id) out.push(imageValue(id));
      continue;
    }
    out.push({
      _type: "block",
      _key: key(),
      style: b.kind === "h2" ? "h2" : b.kind === "h3" ? "h3" : "normal",
      ...(b.kind === "li" ? { listItem: "bullet", level: 1 } : {}),
      markDefs: [],
      children: [{ _type: "span", _key: key(), text: b.text, marks: [] }],
    });
  }
  return out;
}

async function migrate() {
  const posts = [];
  for (const p of blogPosts) {
    const coverId = p.cover ? await uploadImage(p.cover) : undefined;
    posts.push({
      _type: "blogPostItem",
      _key: key(),
      slug: p.slug,
      category: p.category,
      meta: p.meta,
      title: p.title,
      kicker: p.kicker,
      description: p.description,
      body: await toPortableText(p.body),
      url: p.url,
      ...(coverId
        ? { cover: { _type: "image", asset: { _type: "reference", _ref: coverId } } }
        : {}),
      coverBg: p.coverBg,
      panelBg: p.panelBg,
      panelText: p.panelText,
    });
  }

  const media = mediaItems.map((m) => ({
    _type: "mediaEntry",
    _key: key(),
    slug: m.slug,
    format: m.format,
    title: m.title,
    platform: m.platform,
    year: m.year,
    source: m.source,
    detail: m.detail,
    description: m.description,
    themes: m.themes,
  }));

  await client.createOrReplace({ _id: "blogsPage", _type: "blogsPage", posts, media });
  console.log(
    `Seeded blogsPage: ${posts.length} posts, ${media.length} media entries, ${assetCache.size} images uploaded.`,
  );
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
