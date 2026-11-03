/**
 * Blog cleanup (Teams Nov 2, "Blog update fix.pdf"; docs/meetings/2026-11-02-2-actions.md).
 *
 * An editor duplicated 12 posts inside `blogsPage.posts`, edited the copies
 * (titles start with "*") and published. The site opens the FIRST post with a
 * given slug, so the edits never showed; copies whose slug was replaced by the
 * title 404. The Design Pulse original also had its slug replaced by its title.
 *
 * For each pair below: the "*" copy's written content (title, kicker, meta,
 * description, body, category) goes into the original item; everything else
 * stays the original's (`_key`, position, slug = original URL, cover, colours,
 * author, date, legacy URL — the "*Building Trust" copy was a fresh item with
 * those empty). The "*" is dropped from the title and the copy is removed.
 * Design Pulse gets its original slug back.
 * One document, items addressed by `_key`, one patch guarded by `ifRevisionId`.
 * Text only, no assets. Dry by default; --apply backs the document up to
 * ../exports/sanity-backups/ first.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-blogs-merge-star-duplicates.ts --with-user-token
 *   npx sanity exec scripts/patch-blogs-merge-star-duplicates.ts --with-user-token -- --apply
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const APPLY = process.argv.includes("--apply");
const DOC_ID = "blogsPage";
const BACKUPS = join(process.cwd(), "..", "exports", "sanity-backups");

/** [original _key, "*" copy _key] — read from the dataset on Nov 2. */
const PAIRS: [string, string][] = [
  ["b7ddc95894fb", "cd470ecfde61"], // Design Pulse
  ["ffb64f8a6909", "1f955a4e2797"], // Tetrahedral Model
  ["8e7bb36d8f5d", "9b75b3835f2e"], // Design Handbook
  ["371d8cf8e75b", "ab4de5967859"], // Building Trust Through Five Clear Expectations
  ["c03e434f3fbb", "c3c4e871d269"], // My Commitments to a Design Team
  ["c1d1e7af7acd", "a95c6b8efb14"], // Big Design
  ["e1059f921939", "e2b251f20f79"], // Making Your Design Ops Accessible
  ["d76ff5ca38bc", "9eb6f81a84d2"], // Six Roles → Six Contexts of Design Practice
  ["dae32f2428b9", "deea5ec54f9e"], // Scalar Approach → Scalar Leadership: A Systems Approach…
  ["5d5c3fe2de66", "4d1b86a85e76"], // Extractive 2.0
  ["51cc56cc7b10", "19e03dd88238"], // AI Design-Led Research
  ["8f0601b88c7a", "a9e51874f984"], // The Great Value Inversion
];

/** Slug before the Nov 2 Studio edit (scripts/seed/blog-footer-seed.ts). */
const SLUG_RESTORE: Record<string, string> = {
  b7ddc95894fb: "design-pulse-org-design-health-monitor",
};

type Post = { _key: string; title?: string; slug?: string } & Record<string, unknown>;

/** Written content the editor changed in the "*" copies. */
const CONTENT_FIELDS = ["category", "meta", "kicker", "description", "body"] as const;

const short = (v: unknown) => {
  const s = typeof v === "string" ? v : JSON.stringify(v);
  return s == null ? "∅" : s.length > 70 ? `${s.slice(0, 67)}…` : s;
};

async function main() {
  console.log(`patch-blogs-merge-star-duplicates (${APPLY ? "APPLY" : "dry"})`);
  const hasDraft = await client.fetch<boolean>(`defined(*[_id == $id][0]._id)`, { id: `drafts.${DOC_ID}` });
  if (hasDraft) throw new Error(`drafts.${DOC_ID} exists — publish or discard it in Studio first`);

  const doc = await client.fetch<({ _rev: string; posts: Post[] } & Record<string, unknown>) | null>(`*[_id == $id][0]`, { id: DOC_ID });
  if (!doc?.posts) throw new Error(`${DOC_ID} not found`);
  const byKey = new Map(doc.posts.map((p) => [p._key, p]));
  console.log(`posts before: ${doc.posts.length}`);

  const sets: Record<string, Post> = {};
  const unsets: string[] = [];
  for (const [origKey, starKey] of PAIRS) {
    const orig = byKey.get(origKey);
    const star = byKey.get(starKey);
    if (!orig || !star) throw new Error(`missing item: ${origKey} / ${starKey}`);
    if (!/^\s*\*/.test(star.title ?? "")) throw new Error(`${starKey} is not a "*" copy: ${star.title}`);

    const slug = SLUG_RESTORE[origKey] ?? orig.slug;
    const merged: Post = { ...orig, slug, title: (star.title ?? "").replace(/^\s*\*\s*/, "") };
    for (const k of CONTENT_FIELDS) if (star[k] != null) merged[k] = star[k];

    console.log(`\n• ${merged.title}`);
    console.log(`  keep ${origKey} (slug ${short(slug)}), remove ${starKey}`);
    for (const k of new Set([...Object.keys(orig), ...Object.keys(merged)])) {
      if (k === "_key") continue;
      const a = JSON.stringify(orig[k]);
      const b = JSON.stringify(merged[k]);
      if (a === b) continue;
      if (k === "body") {
        const len = (v: unknown) => JSON.stringify(v ?? "").length;
        console.log(`  body: ${len(orig[k])} → ${len(merged[k])} chars (the "*" version)`);
      } else {
        console.log(`  ${k}: ${short(orig[k])} → ${short(merged[k])}`);
      }
    }
    sets[`posts[_key=="${origKey}"]`] = merged;
    unsets.push(`posts[_key=="${starKey}"]`);
  }

  const after = doc.posts.length - PAIRS.length;
  console.log(`\nposts after: ${after}`);
  if (!APPLY) {
    console.log("dry run — pass -- --apply to write");
    return;
  }
  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `blogs-merge-star-duplicates-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify(doc, null, 1));
  console.log(`backup → ${file}`);
  await client.patch(DOC_ID).ifRevisionId(doc._rev).set(sets).unset(unsets).commit();
  const titles = await client.fetch<string[]>(`*[_id == $id][0].posts[].title`, { id: DOC_ID });
  const stars = titles.filter((t) => /^\s*\*/.test(t ?? "")).length;
  console.log(`✓ written. posts now ${titles.length}, "*" titles left ${stars}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
