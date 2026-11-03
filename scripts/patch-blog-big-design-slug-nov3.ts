/**
 * Big Design blog post 404 (Adekunle, Teams Nov 3: "Here's the blog to fix").
 *
 * Its slug is `big-design-why-the-super-IC-Won’t-Save-Us` — capitals and a curly
 * apostrophe. The browser sends the ’ percent-encoded, the deployed
 * /blogs/[slug] page compares it to the raw slug, so the page 404s on
 * faslebbie.com and the Vercel preview (the decode fix in
 * `src/app/blogs/[slug]/page.tsx` is local only). Same words, URL-safe:
 * `big-design-why-the-super-ic-wont-save-us`. The deployed page renders slugs it
 * didn't prerender on request (dynamicParams), so this works without a deploy.
 *
 * One field: blogsPage.posts[_key=="c1d1e7af7acd"].slug. One patch guarded by
 * `ifRevisionId`; refuses if the slug isn't the expected value or a draft
 * exists. Dry by default; --apply backs the document up to
 * ../exports/sanity-backups/ first.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-blog-big-design-slug-nov3.ts --with-user-token
 *   npx sanity exec scripts/patch-blog-big-design-slug-nov3.ts --with-user-token -- --apply
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const APPLY = process.argv.includes("--apply");
const DOC_ID = "blogsPage";
const KEY = "c1d1e7af7acd";
const FROM = "big-design-why-the-super-IC-Won’t-Save-Us";
const TO = "big-design-why-the-super-ic-wont-save-us";
const BACKUPS = join(process.cwd(), "..", "exports", "sanity-backups");

type Post = { _key: string; title?: string; slug?: string };
type Doc = { _id: string; _rev: string; posts?: Post[] };

async function main() {
  console.log(`patch-blog-big-design-slug-nov3 (${APPLY ? "APPLY" : "dry"})`);
  const draft = await client.fetch<string | null>(`*[_id == $id][0]._id`, { id: `drafts.${DOC_ID}` });
  if (draft) throw new Error(`drafts.${DOC_ID} exists — someone is editing in Studio; publish or discard it first`);
  const doc = await client.fetch<Doc | null>(`*[_id == $id][0]`, { id: DOC_ID });
  if (!doc) throw new Error(`${DOC_ID} not found`);
  const post = doc.posts?.find((p) => p._key === KEY);
  if (!post) throw new Error(`post ${KEY} not found`);
  if (doc.posts!.some((p) => p.slug === TO)) throw new Error(`slug ${TO} already used`);
  console.log(`• "${post.title}"\n  slug: ${post.slug} → ${TO}`);
  if (post.slug === TO) return console.log("already done");
  if (post.slug !== FROM) throw new Error(`unexpected current slug: ${post.slug}`);
  if (!APPLY) return console.log("\nwould patch 1 field");

  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `blog-big-design-slug-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify(doc, null, 1));
  console.log(`backup → ${file}`);
  await client.patch(DOC_ID).ifRevisionId(doc._rev).set({ [`posts[_key=="${KEY}"].slug`]: TO }).commit();
  console.log("✓ patched 1 field");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
