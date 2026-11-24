/**
 * Vuforia Editor (cs-vuforia-expert-capture), Reflection → Next Steps, third
 * item: "…generate English SOPs automatically./span>" → "…automatically."
 * The stray `/span>` came in with a paste and shows on the live page (mobile
 * QA round 2, Nov 23 — docs/meetings/2026-11-23-mobile-qa.md § Round 2,
 * Content). Xian, Nov 23: "apply the span fix with agent".
 *
 * `nextStepsItems` is a plain string array (no `_key`s), so the item is found
 * by index inside the section `_key`; refuses unless exactly one item of that
 * section contains "/span>", exactly once, as "automatically./span>". Removes
 * only "/span>" from that one string — nothing else changes. Published + any
 * draft (the draft carries the same text). Re-run after the fix = "nothing to
 * do". Dry by default; `-- --apply` backs up and patches under ifRevisionId.
 * Undo: put "/span>" back from the backup JSON (or type it in Studio —
 * Vuforia Editor → Reflection → Next Steps, item 3).
 *
 *   npx sanity exec scripts/patch-vuforia-editor-span-nov23.ts --with-user-token [-- --apply]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { APPLY, BACKUPS, client as cliClient } from "./lib/structure-nov11";

const client = cliClient.withConfig({ perspective: "raw" });
const IDS = ["cs-vuforia-expert-capture", "drafts.cs-vuforia-expert-capture"];
const SECTION = "c42de778766b"; // reflectionSection ("Reflection" / "Next Steps")
const STRAY = "/span>";
const EXPECT = "automatically./span>";

type Sec = { _key: string; _type: string; nextStepsItems?: (string | null)[] | null };
type Doc = { _id: string; _rev: string; sec?: Sec | null };

const around = (s: string, i: number) => `…${s.slice(Math.max(0, i - 60), i + 10)}…`;
const count = (s: string, sub: string) => s.split(sub).length - 1;

async function main() {
  console.log(`patch-vuforia-editor-span-nov23 (${APPLY ? "APPLY" : "dry"})`);
  const docs = await client.fetch<Doc[]>(
    `*[_id in $ids]{ _id, _rev, "sec": sections[_key == $key][0]{ _key, _type, nextStepsItems } }`,
    { ids: IDS, key: SECTION },
  );
  if (!docs.some((d) => d._id === IDS[0])) throw new Error(`${IDS[0]} not found`);

  const plan: { doc: Doc; idx: number; path: string; before: string; after: string }[] = [];
  for (const doc of docs) {
    console.log(`\n${doc._id} (rev ${doc._rev})`);
    const sec = doc.sec;
    if (!sec) throw new Error(`refusing: ${doc._id} has no section ${SECTION}`);
    if (sec._type !== "reflectionSection") throw new Error(`refusing: ${doc._id} section ${SECTION} is ${sec._type}`);
    const items = sec.nextStepsItems ?? [];
    const hits = items.flatMap((t, i) => (typeof t === "string" && t.includes(STRAY) ? [i] : []));
    if (!hits.length) {
      console.log("  no \"/span>\" in Next Steps — nothing to do");
      continue;
    }
    if (hits.length !== 1) throw new Error(`refusing: ${hits.length} Next Steps items contain "/span>" (${hits.join(", ")})`);
    const idx = hits[0];
    const before = items[idx] as string;
    if (count(before, STRAY) !== 1 || count(before, EXPECT) !== 1)
      throw new Error(`refusing: item ${idx} doesn't contain "${EXPECT}" exactly once: ${JSON.stringify(before)}`);
    const after = before.replace(STRAY, "");
    const at = before.indexOf(STRAY);
    console.log(`  Next Steps item ${idx}:`);
    console.log(`    before: ${around(before, at)}`);
    console.log(`    after:  ${around(after, at)}`);
    console.log(`    length ${before.length} → ${after.length}`);
    plan.push({ doc, idx, path: `sections[_key=="${SECTION}"].nextStepsItems[${idx}]`, before, after });
  }

  if (!plan.length) return console.log("\nnothing to do — already fixed");
  if (!APPLY) return console.log(`\ndry run — nothing written (re-run with -- --apply)`);

  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `vuforia-editor-span-nov23-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify(plan.map((p) => ({ _id: p.doc._id, _rev: p.doc._rev, path: p.path, text: p.before })), null, 1));
  console.log(`\nbackup → ${file}`);
  for (const p of plan) {
    const res = await client.patch(p.doc._id).ifRevisionId(p.doc._rev).set({ [p.path]: p.after }).commit();
    console.log(`✓ ${p.doc._id} (rev ${res._rev}): ${p.path}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
