/**
 * US Census Key Product Experiences: remove the empty item in the tablet row
 * (Xian, Nov 19: "very big mobile and small tablet video… apply").
 *
 * Since Nov 5 the tablet row has been [empty image item, Sakib's tablet video]
 * — the video was added next to the old image item instead of replacing it.
 * A row with two items sends the band to the old "stacked" layout (phone
 * 696×1527, tablet 338×226 at 1440) instead of Coral's phone + tablet layout.
 * Removing the empty item (no image, no video) leaves one item per row again.
 *
 * Census also has an unpublished Studio draft (Nov 14/17: a second upload of
 * the Work-card thumbnail motion, "Thumbnail (1).mp4"; sections identical).
 * The same item is removed from the draft too, so publishing that draft later
 * doesn't bring the empty item back. The draft is NOT published.
 *
 * Touches only that one item; refuses if it isn't empty or if the row doesn't
 * hold exactly [that item, a video]. Dry by default; `-- --apply` backs up the
 * section of each document and patches both in one transaction under
 * ifRevisionId.
 *
 *   npx sanity exec scripts/patch-census-kpe-empty-item-nov19.ts --with-user-token [-- --apply]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { APPLY, BACKUPS, client } from "./lib/structure-nov11";

const ID = "cs-2020-us-census-benefit-calculator";
const SECTION = "2a384e390c79";
const ROW = "92f40a01169d";
const ITEM = "30a3b637f5ab";
const PATH = `sections[_key=="${SECTION}"].rows[_key=="${ROW}"].items[_key=="${ITEM}"]`;

type Item = { _key: string; mediaType?: string; image?: unknown; videoFile?: unknown; videoUrl?: string; embedUrl?: string; posterImage?: unknown };
type Row = { _key: string; device?: string; items?: Item[] };
type Got = { _id: string; _rev: string; sec?: { sectionTitle?: string; rows?: Row[] } };

const isEmpty = (it: Item) => !it.image && !it.videoFile && !it.videoUrl && !it.embedUrl && !it.posterImage;
const sig = (rows: Row[]) =>
  rows.map((r) => `${r.device}[${(r.items ?? []).map((it) => (isEmpty(it) ? "EMPTY" : it.videoFile ? "video" : "image")).join(",")}]`).join(" ");

function check(doc: Got) {
  if (!doc.sec) throw new Error(`${doc._id}: Key Product Experiences section not found`);
  const rows = doc.sec.rows ?? [];
  const items = rows.find((r) => r._key === ROW)?.items ?? [];
  const target = items.find((it) => it._key === ITEM);
  if (!target) return null; // already gone in this document
  if (!isEmpty(target)) throw new Error(`${doc._id}: the item is not empty — refusing`);
  if (items.length !== 2 || !items.some((it) => it._key !== ITEM && it.videoFile)) throw new Error(`${doc._id}: unexpected tablet row ${sig(rows)}`);
  const after = rows.map((r) => (r._key === ROW ? { ...r, items: items.filter((it) => it._key !== ITEM) } : r));
  console.log(`${doc._id} (rev ${doc._rev})\n  before: ${sig(rows)}\n  after:  ${sig(after)}`);
  return doc;
}

async function main() {
  console.log(`patch-census-kpe-empty-item-nov19 (${APPLY ? "APPLY" : "dry"})`);
  const docs = await client.fetch<Got[]>(
    `*[_id in [$id, "drafts." + $id]]{ _id, _rev, "sec": sections[_key == $s][0] }`,
    { id: ID, s: SECTION },
  );
  if (!docs.some((d) => d._id === ID)) throw new Error("published Census not found");
  const todo = docs.map(check).filter((d): d is Got => d !== null);
  if (!todo.length) return console.log("nothing to do — the empty item is already gone");

  if (!APPLY) return console.log(`dry run — nothing written (re-run with -- --apply)`);

  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `census-kpe-empty-item-nov19-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify(todo, null, 1));
  console.log(`backup → ${file}`);
  const tx = client.transaction();
  for (const d of todo) tx.patch(d._id, (p) => p.ifRevisionId(d._rev).unset([PATH]));
  const res = await tx.commit();
  console.log(`✓ empty tablet item removed from ${todo.map((d) => d._id).join(" + ")} (tx ${res.transactionId})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
