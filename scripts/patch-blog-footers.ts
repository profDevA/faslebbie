/**
 * Patch blogsPage posts → article footer fields (avatar, date, author).
 * Source: live faslebbie.com + blog-footer-avatar.png (Figma export).
 * Patches published AND draft. Does not replace posts[] or body.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-blog-footers.ts --with-user-token
 */
import { createReadStream } from "node:fs";
import { access } from "node:fs/promises";
import { resolve } from "node:path";

import { getCliClient } from "sanity/cli";

import {
  blogFooterAuthorName,
  blogFooterAvatarPath,
  blogFooterDates,
} from "./seed/blog-footer-seed";

const client = getCliClient({ apiVersion: "2025-01-01" });
const PUBLISHED_ID = "blogsPage";
const DRAFT_ID = `drafts.${PUBLISHED_ID}`;

type BlogPostRow = {
  _key: string;
  slug?: string;
  publishedAt?: string;
  authorName?: string;
  authorAvatar?: { asset?: { _ref?: string } };
};

async function uploadAvatar(): Promise<string> {
  const path = resolve(process.cwd(), blogFooterAvatarPath);
  await access(path);
  const asset = await client.assets.upload("image", createReadStream(path), {
    filename: "blog-footer-avatar.png",
    contentType: "image/png",
  });
  console.log(`uploaded blog-footer-avatar.png → ${asset._id}`);
  return asset._id;
}

function footerForPost(slug: string, avatarAssetId: string) {
  const publishedAt = blogFooterDates[slug];
  if (!publishedAt) {
    console.warn(`  ! no footer date for slug: ${slug}`);
  }
  return {
    authorName: blogFooterAuthorName,
    ...(publishedAt ? { publishedAt } : {}),
    authorAvatar: {
      _type: "image" as const,
      asset: { _type: "reference" as const, _ref: avatarAssetId },
    },
  };
}

function patchPosts(posts: BlogPostRow[] | undefined, avatarAssetId: string) {
  if (!posts?.length) return posts;
  let patched = 0;
  const next = posts.map((post) => {
    const slug = post.slug?.trim();
    if (!slug || !blogFooterDates[slug]) return post;
    patched += 1;
    return { ...post, ...footerForPost(slug, avatarAssetId) };
  });
  console.log(`  footer fields applied to ${patched}/${posts.length} posts`);
  return next;
}

async function patchDocument(id: string, avatarAssetId: string) {
  const doc = await client.getDocument(id);
  if (!doc) {
    console.log(`skip ${id}: document not found`);
    return;
  }
  const posts = patchPosts(doc.posts as BlogPostRow[] | undefined, avatarAssetId);
  await client.patch(id).set({ posts }).commit();
  console.log(`✓ patched ${id}`);
}

async function main() {
  const published = await client.fetch<{ _id: string; posts?: BlogPostRow[] } | null>(
    `*[_type == "blogsPage" && _id == $id][0]{ _id, posts[]{ _key, slug, publishedAt, authorName } }`,
    { id: PUBLISHED_ID },
  );
  if (!published?._id) throw new Error("No published blogsPage document");

  const before = (published.posts ?? []).filter((p) => p.publishedAt).length;
  console.log(`before published: ${before}/${published.posts?.length ?? 0} posts with publishedAt`);

  const avatarAssetId = await uploadAvatar();

  await patchDocument(PUBLISHED_ID, avatarAssetId);
  await patchDocument(DRAFT_ID, avatarAssetId);

  const after = await client.fetch<number>(
    `count(*[_type == "blogsPage" && _id == $id][0].posts[defined(publishedAt)])`,
    { id: PUBLISHED_ID },
  );
  console.log(`after published: ${after} posts with publishedAt + authorAvatar in Sanity`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
