/**
 * Approach: drop the "Who I Work Best With" title and make its paragraph the
 * second paragraph of "How We Could Work Together" (Fas, Nov 22 call 4:14–4:55:
 * "removing this title and moving this as part of this paragraph here";
 * Xian, Nov 23: "go… apply"). Items: docs/meetings/2026-11-22-actions.md #3.
 *
 * Moves the paragraph block as it is (text, the red "let's talk" contact link,
 * its _key) to the end of "How We Could Work Together", then removes the empty
 * "Who I Work Best With" section. Nothing else changes. Sections are found by
 * title and patched by _key; refuses if either is missing or ambiguous. A
 * re-run after the move is a no-op. Published + any draft (raw perspective).
 * Dry by default; `-- --apply` backs up both sections and patches under
 * ifRevisionId.
 *
 *   npx sanity exec scripts/patch-approach-work-best-with-nov22.ts --with-user-token [-- --apply]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { APPLY, BACKUPS, client as cliClient } from "./lib/structure-nov11";

const client = cliClient.withConfig({ perspective: "raw" });
const TARGET = "How We Could Work Together";
const SOURCE = "Who I Work Best With";
const MOVED_START = "I am most useful when there is no direction yet";

type Block = { _key: string; subheading?: string; body?: { children?: { text?: string }[] }[] };
type Sec = { _key: string; title?: string; static?: boolean; blocks?: Block[] };
type Doc = { _id: string; _rev: string; sections?: Sec[] };

const text = (b: Block) => (b.body ?? []).flatMap((p) => p.children ?? []).map((c) => c.text ?? "").join("");
const titled = (d: Doc, t: string) => (d.sections ?? []).filter((s) => (s.title ?? "").trim() === t);

async function main() {
  console.log(`patch-approach-work-best-with-nov22 (${APPLY ? "APPLY" : "dry"})`);
  const docs = await client.fetch<Doc[]>(`*[_id in ["leadershipPage", "drafts.leadershipPage"]]{ _id, _rev, sections }`);
  if (!docs.some((d) => d._id === "leadershipPage")) throw new Error("leadershipPage not found");

  const plans: { doc: Doc; target: Sec; source: Sec }[] = [];
  for (const doc of docs) {
    const targets = titled(doc, TARGET);
    const sources = titled(doc, SOURCE);
    console.log(`\n${doc._id} (rev ${doc._rev}) — sections: ${(doc.sections ?? []).map((s) => `"${(s.title ?? "").trim()}"`).join(", ")}`);
    if (targets.length !== 1) throw new Error(`refusing: "${TARGET}" found ${targets.length}×`);
    const target = targets[0];
    if (sources.length === 0) {
      const done = (target.blocks ?? []).some((b) => text(b).startsWith(MOVED_START));
      if (!done) throw new Error(`refusing: "${SOURCE}" not found and its paragraph isn't under "${TARGET}"`);
      console.log("  already moved — nothing to do");
      continue;
    }
    if (sources.length > 1) throw new Error(`refusing: "${SOURCE}" found ${sources.length}×`);
    const source = sources[0];
    const moving = source.blocks ?? [];
    if (moving.length !== 1 || !text(moving[0]).startsWith(MOVED_START))
      throw new Error(`refusing: "${SOURCE}" doesn't hold the single expected paragraph (${moving.length} blocks)`);
    if (moving[0].subheading) throw new Error(`refusing: the paragraph has a subheading ("${moving[0].subheading}")`);
    const keys = new Set((target.blocks ?? []).map((b) => b._key));
    if (keys.has(moving[0]._key)) throw new Error(`refusing: block key ${moving[0]._key} already used in "${TARGET}"`);

    console.log(`  "${TARGET}" (${target._key}): ${target.blocks?.length ?? 0} paragraph(s) → ${(target.blocks?.length ?? 0) + 1}`);
    (target.blocks ?? []).forEach((b, i) => console.log(`    P${i + 1} ${b._key}: ${text(b).slice(0, 90)}…`));
    console.log(`    P${(target.blocks?.length ?? 0) + 1} ${moving[0]._key} (moved): ${text(moving[0]).slice(0, 90)}…`);
    console.log(`  "${SOURCE}" (${source._key}): section removed`);
    plans.push({ doc, target, source });
  }

  if (!plans.length) return console.log("\nnothing to do");
  if (!APPLY) return console.log(`\ndry run — nothing written (re-run with -- --apply)`);

  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `approach-work-best-with-nov22-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify(plans.map((p) => ({ _id: p.doc._id, _rev: p.doc._rev, target: p.target, source: p.source })), null, 1));
  console.log(`\nbackup → ${file}`);
  for (const { doc, target, source } of plans) {
    const res = await client
      .patch(doc._id)
      .ifRevisionId(doc._rev)
      .insert("after", `sections[_key=="${target._key}"].blocks[-1]`, source.blocks!)
      .unset([`sections[_key=="${source._key}"]`])
      .commit();
    const after = await client.fetch<Doc>(`*[_id == $id][0]{ _id, _rev, sections }`, { id: doc._id });
    const t = titled(after, TARGET)[0];
    console.log(`✓ ${doc._id} (rev ${res._rev}): "${TARGET}" now ${t?.blocks?.length} paragraphs; "${SOURCE}" sections left: ${titled(after, SOURCE).length}; sections ${doc.sections?.length} → ${after.sections?.length}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
