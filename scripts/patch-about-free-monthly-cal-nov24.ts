/**
 * About → "free monthly" opens Fas's cal.com booking page in a new tab instead
 * of the Contact drawer (Nov 23 call, item 10 in
 * docs/meetings/2026-11-23-actions.md; link from Fas to Xian, Nov 24).
 *
 * The words carry a `redKey` annotation ("Red keyword") in aboutPage.bio. This
 * sets that mark's "Opens" to "Web page (new tab)" (`kind: "url"`) and its
 * "Web page" to CAL_URL. The red underline stays (AboutContent renders a `url`
 * red keyword as an <a target="_blank">).
 *
 * ORDER: apply only once the code that knows `kind: "url"` is live. The older
 * code reads any kind other than "contact" as the testimonials modal, so
 * applying first would make "free monthly" open the testimonials on the live
 * site until the deploy.
 *
 * Found by text + mark (exactly one span "free monthly" with a redKey mark,
 * else refuse), in the published doc and any draft, so a later Publish doesn't
 * bring the drawer back. Expects kind "contact" (refuses anything else);
 * re-run after the fix = "already set". Dry by default; `-- --apply` re-reads
 * both documents right before writing, backs the mark up to
 * ../exports/sanity-backups/ and patches under ifRevisionId by `_key`.
 * Undo: Studio → About → select "free monthly" → Opens: Contact drawer, or
 * set the backup's values.
 *
 *   npx sanity exec scripts/patch-about-free-monthly-cal-nov24.ts --with-user-token [-- --apply]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { APPLY, BACKUPS, client as cliClient } from "./lib/structure-nov11";

const client = cliClient.withConfig({ perspective: "raw" });

const ABOUT = "aboutPage";
const WORDS = "free monthly";
const CAL_URL = "https://cal.com/fas-lebbie-khntak/mentorship";

type MarkDef = { _key: string; _type: string } & Record<string, unknown>;
type Span = { _key: string; _type: string; text?: string; marks?: string[] };
type Block = { _key: string; _type: string; children?: Span[]; markDefs?: MarkDef[] };
type Doc = { _id: string; _rev: string; bio?: Block[] | null };
type Change = { doc: Doc; path: string; before: { kind: unknown; href: unknown }; mark: MarkDef };

const ids = [ABOUT, `drafts.${ABOUT}`];

/** The one redKey mark on a span reading WORDS in bio. Refuses on 0 or >1. */
function findMark(doc: Doc) {
  const hits: { block: Block; mark: MarkDef; span: Span }[] = [];
  for (const block of doc.bio ?? []) {
    for (const span of block.children ?? []) {
      if (span.text?.trim().toLowerCase() !== WORDS) continue;
      for (const k of span.marks ?? []) {
        const mark = (block.markDefs ?? []).find((m) => m._key === k);
        if (mark?._type === "redKey") hits.push({ block, mark, span });
      }
    }
  }
  if (hits.length !== 1) throw new Error(`refusing: ${doc._id} has ${hits.length} "${WORDS}" red keywords`);
  const { block, mark, span } = hits[0];
  return { block, mark, span, path: `bio[_key=="${block._key}"].markDefs[_key=="${mark._key}"]` };
}

async function plan(log: boolean): Promise<Change[]> {
  const say = (s: string) => log && console.log(s);
  const docs = await client.fetch<Doc[]>(`*[_id in $ids]{ _id, _rev, bio }`, { ids });
  if (!docs.some((d) => d._id === ABOUT)) throw new Error(`${ABOUT} not found`);
  if (!docs.some((d) => d._id !== ABOUT)) say(`  drafts.${ABOUT}: none`);
  const changes: Change[] = [];
  for (const doc of docs) {
    const { block, mark, span, path } = findMark(doc);
    say(`  ${doc._id} (rev ${doc._rev}) — bio block ${block._key}, span ${span._key} "${span.text}"`);
    say(`    mark now: ${JSON.stringify(mark)}`);
    if (mark.kind === "url" && mark.href === CAL_URL) {
      say(`    already set — nothing to do`);
      continue;
    }
    if (mark.kind !== "contact") throw new Error(`refusing: ${doc._id} "${WORDS}" opens ${JSON.stringify(mark.kind)}, expected "contact"`);
    changes.push({ doc, path, before: { kind: mark.kind, href: mark.href ?? null }, mark });
    say(`    kind: "contact" (Contact drawer) → "url" (Web page, new tab)`);
    say(`    href: ${JSON.stringify(mark.href ?? null)} → ${JSON.stringify(CAL_URL)}`);
  }
  return changes;
}

async function main() {
  console.log(`patch-about-free-monthly-cal-nov24 (${APPLY ? "APPLY" : "dry"})`);
  const first = await plan(true);
  console.log(`\n${first.length} mark(s) to change in ${first.length} document(s)`);
  if (!first.length) return console.log("nothing to do");
  console.log(`apply only after the code with the "Web page (new tab)" red keyword is live (see ORDER above)`);
  if (!APPLY) return console.log(`dry run — nothing written (re-run with -- --apply)`);

  // Re-read right before writing; refuse if anything moved since the plan above.
  const changes = await plan(false);
  const sig = (cs: Change[]) => JSON.stringify(cs.map((c) => [c.doc._id, c.doc._rev, c.path, c.before]));
  if (sig(changes) !== sig(first)) throw new Error("refusing: the documents changed while planning — run again");

  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `about-free-monthly-cal-nov24-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(
    file,
    JSON.stringify(changes.map((c) => ({ _id: c.doc._id, _rev: c.doc._rev, path: c.path, before: c.mark })), null, 1),
  );
  console.log(`\nbackup → ${file}`);

  for (const c of changes) {
    const res = await client
      .patch(c.doc._id)
      .ifRevisionId(c.doc._rev)
      .set({ [`${c.path}.kind`]: "url", [`${c.path}.href`]: CAL_URL })
      .commit();
    console.log(`✓ ${c.doc._id} (rev ${res._rev}): "${WORDS}" → ${CAL_URL} (new tab)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
