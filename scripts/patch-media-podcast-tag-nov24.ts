/**
 * Words · Media → podcast card: drop the "Podcast · Ongoing" line (Fas, Nov 23
 * call, 40:13: "Let's remove this 'Podcast · Ongoing'. It doesn't do
 * anything." — item 2c in docs/meetings/2026-11-23-actions.md).
 *
 * The line is Studio content: Blogs & Media → Featured media (podcast) → "Tag
 * line" (blogsPage.mediaFeatured.tag). This unsets that field. MediaBody now
 * shows the line only when the field has text, so Studio can bring it back by
 * typing one. (Older code fell back to "Podcast · Ongoing" when the field was
 * empty, so on the live site the line goes away only once the new code is
 * live too — either order is safe.)
 *
 * Published doc + any draft. Refuses unless the tag is still "Podcast ·
 * Ongoing"; re-run after the fix = "already empty". Dry by default; `-- --apply`
 * re-reads right before writing, writes a backup to ../exports/sanity-backups/
 * and patches under ifRevisionId. Undo: type the old text back into "Tag line".
 *
 *   npx sanity exec scripts/patch-media-podcast-tag-nov24.ts --with-user-token [-- --apply]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { APPLY, BACKUPS, client as cliClient } from "./lib/structure-nov11";

const client = cliClient.withConfig({ perspective: "raw" });

const BLOGS = "blogsPage";
const OLD_TAG = "Podcast · Ongoing";

type Doc = { _id: string; _rev: string; title?: string; tag?: string | null };

const ids = [BLOGS, `drafts.${BLOGS}`];

async function plan(log: boolean): Promise<Doc[]> {
  const say = (s: string) => log && console.log(s);
  const docs = await client.fetch<Doc[]>(
    `*[_id in $ids]{ _id, _rev, "title": mediaFeatured.title, "tag": mediaFeatured.tag }`,
    { ids },
  );
  if (!docs.some((d) => d._id === BLOGS)) throw new Error(`${BLOGS} not found`);
  if (!docs.some((d) => d._id !== BLOGS)) say(`  drafts.${BLOGS}: none`);
  const todo: Doc[] = [];
  for (const doc of docs) {
    say(`  ${doc._id} (rev ${doc._rev}) — "${doc.title ?? ""}"`);
    say(`    mediaFeatured.tag now: ${JSON.stringify(doc.tag ?? null)}`);
    if (doc.tag == null || doc.tag.trim() === "") {
      say(`    already empty — nothing to do`);
      continue;
    }
    if (doc.tag.trim() !== OLD_TAG) throw new Error(`refusing: ${doc._id} tag is ${JSON.stringify(doc.tag)}, expected "${OLD_TAG}"`);
    todo.push(doc);
    say(`    mediaFeatured.tag: ${JSON.stringify(doc.tag)} → (unset) — the line under the blurb disappears`);
  }
  return todo;
}

async function main() {
  console.log(`patch-media-podcast-tag-nov24 (${APPLY ? "APPLY" : "dry"})`);
  const first = await plan(true);
  console.log(`\n${first.length} document(s) to change`);
  if (!first.length) return console.log("nothing to do");
  if (!APPLY) return console.log(`dry run — nothing written (re-run with -- --apply)`);

  const docs = await plan(false);
  const sig = (ds: Doc[]) => JSON.stringify(ds.map((d) => [d._id, d._rev, d.tag]));
  if (sig(docs) !== sig(first)) throw new Error("refusing: the documents changed while planning — run again");

  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `media-podcast-tag-nov24-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify(docs.map((d) => ({ _id: d._id, _rev: d._rev, path: "mediaFeatured.tag", before: d.tag })), null, 1));
  console.log(`\nbackup → ${file}`);

  for (const d of docs) {
    const res = await client.patch(d._id).ifRevisionId(d._rev).unset(["mediaFeatured.tag"]).commit();
    console.log(`✓ ${d._id} (rev ${res._rev}): mediaFeatured.tag "${d.tag}" → (unset)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
