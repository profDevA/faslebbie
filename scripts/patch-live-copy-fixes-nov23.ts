/**
 * Two live copy fixes found by the Nov 23 read-only comparison of Ade's copy
 * docs with live (docs/reference/ade-case-studies-2026-11-23/compare/SUMMARY.md
 * § 1). Xian, Nov 23: "go with the three live fixes with agent" (the third, the
 * missing space in word-suffix stats, is code: `statSuffixGap` in
 * CaseStudyView).
 *
 * 1. Forever a Surfer (cs-forever-a-surfer) → Impact → "Raised" stat
 *    (`_key` 1f6aaa8265c7): live "$50" (prefix "$", value 50, no suffix). Ade's
 *    doc, green (final): "$50,000". Sets suffix ",000" and keeps value 50 — the
 *    stat tile prints the number as-is (50000 would show "$50000", no comma).
 *    Refuses unless the item is still prefix "$" / value 50 / label "Raised"
 *    with an empty suffix.
 * 2. Experian Boost (cs-experian-boost) → Core Experience Flows → "See the
 *    Impact:" screen (`_key` c9b7958a9bcf): the caption starts mid-sentence,
 *    "how the potential FICO® Score improvement clearly". No source has the
 *    full words (Ade's doc, the master doc, the Sep 6 patch, Sanity history back
 *    to Oct 25 and Figma 2158:83787 all hold the same broken text), so CAPTION
 *    is null and this fix is skipped until Fas / Xian give the words: put them
 *    in CAPTION, dry-run again, then apply.
 *
 * Items are found by `_key` (never by index); published + any draft, so a later
 * Publish doesn't bring the old text back. Re-run after the fix = "already
 * set". Dry by default; `-- --apply` re-reads both documents right before
 * writing, backs the touched items up to ../exports/sanity-backups/ and patches
 * under ifRevisionId. Undo: Studio → the item → clear "Value Suffix" (Forever)
 * / retype the caption (Experian), or the values in the backup JSON.
 *
 *   npx sanity exec scripts/patch-live-copy-fixes-nov23.ts --with-user-token [-- --apply]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { APPLY, BACKUPS, client as cliClient } from "./lib/structure-nov11";

const client = cliClient.withConfig({ perspective: "raw" });

const FOREVER = "cs-forever-a-surfer";
const RAISED = "1f6aaa8265c7"; // statItem "Raised"
const RAISED_SUFFIX = ",000"; // "$" + 50 + ",000" = "$50,000"

const EXPERIAN = "cs-experian-boost";
const SCREEN = "c9b7958a9bcf"; // coreExperienceScreen "See the Impact:"
const BROKEN = "how the potential FICO® Score improvement clearly";
/** The full caption, once Fas / Xian confirm it. null = skip this fix. */
const CAPTION: string | null = null;

type Item = { _key: string; _type?: string } & Record<string, unknown>;
type Section = { _key: string; _type: string } & Record<string, unknown>;
type Doc = { _id: string; _rev: string; sections?: Section[] | null };
type Change = { doc: Doc; path: string; field: string; before: unknown; after: unknown; show: [string, string] };

const ids = (id: string) => [id, `drafts.${id}`];

/** The one item with `_key` inside `sections[].<array>[]`, with its path. Refuses on 0 or >1. */
function findItem(doc: Doc, array: string, key: string) {
  const hits: { sec: Section; item: Item }[] = [];
  for (const sec of doc.sections ?? []) {
    const arr = sec[array];
    if (!Array.isArray(arr)) continue;
    for (const item of arr as Item[]) if (item?._key === key) hits.push({ sec, item });
  }
  if (hits.length !== 1) throw new Error(`refusing: ${doc._id} has ${hits.length} ${array} items with _key ${key}`);
  const { sec, item } = hits[0];
  return { sec, item, path: `sections[_key=="${sec._key}"].${array}[_key=="${key}"]` };
}

const money = (it: Item, suffix = it.suffix) => `${it.prefix ?? ""}${it.value ?? ""}${suffix ?? ""}`;

async function plan(log: boolean): Promise<Change[]> {
  const say = (s: string) => log && console.log(s);
  const docs = await client.fetch<Doc[]>(`*[_id in $ids]{ _id, _rev, sections }`, {
    ids: [...ids(FOREVER), ...ids(EXPERIAN)],
  });
  const changes: Change[] = [];

  say(`\n— Fix 2: Forever a Surfer "Raised" ($50 → $50,000)`);
  const fDocs = docs.filter((d) => ids(FOREVER).includes(d._id));
  if (!fDocs.some((d) => d._id === FOREVER)) throw new Error(`${FOREVER} not found`);
  if (!fDocs.some((d) => d._id !== FOREVER)) say(`  drafts.${FOREVER}: none`);
  for (const doc of fDocs) {
    const { sec, item, path } = findItem(doc, "items", RAISED);
    say(`  ${doc._id} (rev ${doc._rev}) — ${sec._type} "${sec.sectionTitle ?? ""}"`);
    if (sec._type !== "statsSection") throw new Error(`refusing: ${RAISED} sits in ${sec._type}`);
    const fields = { prefix: item.prefix, value: item.value, suffix: item.suffix ?? null, label: item.label };
    say(`    now: ${JSON.stringify(fields)} → renders "${money(item)}"`);
    if (item.suffix === RAISED_SUFFIX && item.value === 50 && item.prefix === "$") {
      say(`    already set — nothing to do`);
      continue;
    }
    if (item.prefix !== "$" || item.value !== 50 || item.label !== "Raised" || (item.suffix ?? "") !== "")
      throw new Error(`refusing: ${doc._id} "Raised" changed since Nov 23 (${JSON.stringify(fields)})`);
    changes.push({
      doc,
      path: `${path}.suffix`,
      field: "suffix",
      before: item.suffix ?? null,
      after: RAISED_SUFFIX,
      show: [money(item), money(item, RAISED_SUFFIX)],
    });
    say(`    suffix: ${JSON.stringify(item.suffix ?? null)} → ${JSON.stringify(RAISED_SUFFIX)}`);
    say(`    renders: "${money(item)}" → "${money(item, RAISED_SUFFIX)}"`);
  }

  say(`\n— Fix 3: Experian Boost "See the Impact:" caption`);
  const eDocs = docs.filter((d) => ids(EXPERIAN).includes(d._id));
  if (!eDocs.some((d) => d._id === EXPERIAN)) throw new Error(`${EXPERIAN} not found`);
  if (!eDocs.some((d) => d._id !== EXPERIAN)) say(`  drafts.${EXPERIAN}: none`);
  for (const doc of eDocs) {
    const { sec, item, path } = findItem(doc, "previewScreens", SCREEN);
    say(`  ${doc._id} (rev ${doc._rev}) — ${sec._type} "${sec.sectionTitle ?? ""}"`);
    say(`    label: ${JSON.stringify(item.label)}`);
    say(`    description now: ${JSON.stringify(item.description)}`);
    if (CAPTION === null) {
      say(`    skipped — no confirmed full caption yet (CAPTION is null)`);
      continue;
    }
    if (item.description === CAPTION) {
      say(`    already set — nothing to do`);
      continue;
    }
    if (item.description !== BROKEN) throw new Error(`refusing: ${doc._id} caption changed since Nov 23`);
    changes.push({
      doc,
      path: `${path}.description`,
      field: "description",
      before: item.description,
      after: CAPTION,
      show: [String(item.description), CAPTION],
    });
    say(`    description: ${JSON.stringify(item.description)} → ${JSON.stringify(CAPTION)}`);
  }
  return changes;
}

async function main() {
  console.log(`patch-live-copy-fixes-nov23 (${APPLY ? "APPLY" : "dry"})`);
  const first = await plan(true);
  console.log(`\n${first.length} field(s) to change in ${new Set(first.map((c) => c.doc._id)).size} document(s)`);
  if (!first.length) return console.log("nothing to do");
  if (!APPLY) return console.log(`dry run — nothing written (re-run with -- --apply)`);

  // Re-read right before writing; refuse if anything moved since the plan above.
  const changes = await plan(false);
  const sig = (cs: Change[]) => JSON.stringify(cs.map((c) => [c.doc._id, c.doc._rev, c.path, c.before, c.after]));
  if (sig(changes) !== sig(first)) throw new Error("refusing: the documents changed while planning — run again");

  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `live-copy-fixes-nov23-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(
    file,
    JSON.stringify(changes.map((c) => ({ _id: c.doc._id, _rev: c.doc._rev, path: c.path, before: c.before, after: c.after })), null, 1),
  );
  console.log(`\nbackup → ${file}`);

  const byDoc = new Map<string, Change[]>();
  for (const c of changes) byDoc.set(c.doc._id, [...(byDoc.get(c.doc._id) ?? []), c]);
  for (const [id, cs] of byDoc) {
    const set = Object.fromEntries(cs.map((c) => [c.path, c.after]));
    const res = await client.patch(id).ifRevisionId(cs[0].doc._rev).set(set).commit();
    for (const c of cs) console.log(`✓ ${id} (rev ${res._rev}): ${c.field} "${c.show[0]}" → "${c.show[1]}"`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
