/**
 * Teaching intro: "…shown work in exhibitions across China, Africa, and the
 * US." → "…in China, Sierra Leone, and the US." (Fas's QA note #18: "China
 * (country), Africa (continent), and the US (country). Very weird"; wording
 * confirmed by Fas on the Nov 18 evening call: "Yeah").
 *
 * Changes one span's text in the published teachingPage, found by its exact
 * text (refuses if it's not there exactly once). Dry by default; `-- --apply`
 * backs up the intro and patches under ifRevisionId.
 *
 * Note: `drafts.teachingPage` is a stale Studio draft from Aug 13 (old page
 * structure). It's left alone — this patch changes the published page only.
 * Don't publish that draft: it would replace the current Teaching page.
 *
 *   npx sanity exec scripts/patch-teaching-wording-nov19.ts --with-user-token [-- --apply]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { APPLY, BACKUPS, client } from "./lib/structure-nov11";

const FROM = " across China, Africa, and the US.";
const TO = " in China, Sierra Leone, and the US.";

type Span = { _key: string; _type: string; text?: string };
type Block = { _key: string; _type: string; children?: Span[] };

async function main() {
  console.log(`patch-teaching-wording-nov19 (${APPLY ? "APPLY" : "dry"})`);
  const doc = await client.fetch<{ _id: string; _rev: string; intro?: Block[] } | null>(
    `*[_type == "teachingPage" && !(_id in path("drafts.**"))][0]{ _id, _rev, intro }`,
  );
  if (!doc) throw new Error("teachingPage not found");
  const draft = await client.fetch<{ _id: string; _updatedAt: string } | null>(
    `*[_id == "drafts." + $id][0]{ _id, _updatedAt }`,
    { id: doc._id },
  );
  if (draft) console.log(`note: ${draft._id} exists (last edited ${draft._updatedAt}) — left untouched`);

  const hits = (doc.intro ?? []).flatMap((b) =>
    (b.children ?? []).filter((s) => s.text === FROM).map((s) => ({ block: b, span: s })),
  );
  if (hits.length !== 1) throw new Error(`expected the span ${JSON.stringify(FROM)} once, found ${hits.length}`);
  const { block, span } = hits[0];
  const sentence = (b: Block, swap?: string) =>
    (b.children ?? []).map((s) => (s._key === span._key && swap !== undefined ? swap : s.text ?? "")).join("");

  console.log(`\nteachingPage (rev ${doc._rev}), intro block ${block._key}`);
  console.log(`before: …${sentence(block).slice(-160)}`);
  console.log(`after:  …${sentence(block, TO).slice(-160)}`);

  if (!APPLY) return console.log(`\ndry run — nothing written (re-run with -- --apply)`);

  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `teaching-wording-nov19-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify(doc, null, 1));
  console.log(`\nbackup → ${file}`);
  const res = await client
    .patch(doc._id)
    .ifRevisionId(doc._rev)
    .set({ [`intro[_key=="${block._key}"].children[_key=="${span._key}"].text`]: TO })
    .commit();
  console.log(`✓ ${doc._id}: Teaching wording updated (rev ${res._rev})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
