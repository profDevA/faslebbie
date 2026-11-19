/**
 * Blog headers: drop the author line typed at the end of a post's description
 * ("By Fas Lebbie" / "Written by Fas Lebbie" / "Author: Fas Lebbie") — Fas,
 * Nov 18 evening call: "why does he have this 'by Fas Lebbie'?… it's here
 * again [at the bottom]… really unprofessional… it should not be showing up
 * written by Fas Lebbie over and over again". The bottom byline ("Written by
 * <authorName ?? Fas Lebbie>") stays — it shows on every post with a body.
 *
 * Touches only `posts[_key].description` on blogsPage, and only when its last
 * line is one of those author lines (8 of 12 posts on Nov 19). Dry by default;
 * `-- --apply` backs up the posts and patches under ifRevisionId. Refuses if a
 * blogsPage draft exists.
 *
 *   npx sanity exec scripts/patch-blog-description-byline-nov19.ts --with-user-token [-- --apply]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { APPLY, BACKUPS, client } from "./lib/structure-nov11";

const AUTHOR_LINE = /\s*\n\s*(?:By|Written by|Author:)\s+Fas Lebbie\.?\s*$/i;

type Post = { _key: string; title?: string; description?: string | null };

async function main() {
  console.log(`patch-blog-description-byline-nov19 (${APPLY ? "APPLY" : "dry"})`);
  const doc = await client.fetch<{ _id: string; _rev: string; posts?: Post[] } | null>(
    `*[_type == "blogsPage" && !(_id in path("drafts.**"))][0]{ _id, _rev, "posts": posts[]{ _key, title, description } }`,
  );
  if (!doc) throw new Error("blogsPage not found");
  const draft = await client.fetch<string | null>(`*[_id == "drafts." + $id][0]._id`, { id: doc._id });
  if (draft) throw new Error(`a draft exists (${draft}) — publish or discard it in Studio first`);

  const posts = doc.posts ?? [];
  const changes = posts
    .filter((p) => p.description && AUTHOR_LINE.test(p.description))
    .map((p) => ({ ...p, next: p.description!.replace(AUTHOR_LINE, "") }));

  console.log(`\nblogsPage (rev ${doc._rev}) — ${posts.length} posts, ${changes.length} with an author line\n`);
  for (const c of changes) {
    console.log(`• ${c.title}`);
    console.log(`  before: ${JSON.stringify(c.description)}`);
    console.log(`  after:  ${JSON.stringify(c.next)}`);
  }
  const untouched = posts.filter((p) => !changes.some((c) => c._key === p._key));
  console.log(`\nunchanged (${untouched.length}): ${untouched.map((p) => p.title).join(" · ")}`);

  if (!changes.length) return console.log("\nnothing to do");
  if (!APPLY) return console.log(`\ndry run — nothing written (re-run with -- --apply)`);

  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `blog-description-byline-nov19-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify(doc, null, 1));
  console.log(`\nbackup → ${file}`);
  const set = Object.fromEntries(changes.map((c) => [`posts[_key=="${c._key}"].description`, c.next]));
  const res = await client.patch(doc._id).ifRevisionId(doc._rev).set(set).commit();
  console.log(`✓ ${doc._id}: ${changes.length} descriptions updated (rev ${res._rev})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
