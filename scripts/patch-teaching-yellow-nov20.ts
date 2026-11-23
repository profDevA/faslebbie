/**
 * Teaching intro, paragraphs 2–3 → the collab doc's yellow ("needs update")
 * copy, Teaching tab of the Nov 20 download (Xian, Nov 20: "go fix, now,
 * patch apply, with latest one"). Paragraph 1 already matches (Fas, Studio,
 * Nov 20 17:06 UTC).
 *
 * Changes only the plain words between the chips — the expanding pills
 * (Carnegie Mellon … learn it, teach it, practice it) and the "projects" /
 * "exhibitions" links keep their text and marks. Each change must match its
 * span exactly once, and each paragraph must end up equal to the doc text,
 * or the script refuses. Reads the latest document at run time (published +
 * any draft), backs up the intro, patches under ifRevisionId. Dry by default.
 *
 *   npx sanity exec scripts/patch-teaching-yellow-nov20.ts --with-user-token [-- --apply]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { APPLY, BACKUPS, client as cliClient } from "./lib/structure-nov11";

const client = cliClient.withConfig({ perspective: "raw" });

// [from, to] inside plain (unmarked) spans.
const EDITS: [string, string][] = [
  ["I practice a pedagogical structure I call the LTP cycle: ", "I use the LTP cycle: "],
  [". Students’ work should never end", ". The work students make should never end"],
  [" demonstrate how students learn to frame problems", " show how students frame problems"],
  ["Apple, and top design firms", "Apple, and design firms"],
  ["graduate programs at leading universities", "graduate programs at universities"],
];

// The doc's paragraphs 2 and 3 (Teaching tab, yellow), for the final check.
const EXPECTED = [
  "My teaching philosophy is rooted in entrepreneurial practice, critique, prototyping, and systems thinking. Knowledge is co-created, not delivered, through active learning, reflective assessment, learning portfolios, and studio-like approaches. I use the LTP cycle: learn it, teach it, practice it. The work students make should never end with a submission. It should travel into portfolios, exhibitions, communities, and public conversations. Across these settings, students move from ideas into systems, translating research into artifacts, services, and speculative futures.",
  "Their projects show how students frame problems, build interventions, and communicate ideas through design. Many of my students have gone on to Google, Apple, and design firms, entered graduate programs at universities, and shown work in exhibitions in China, Sierra Leone, and the US.",
];

type Span = { _key: string; _type: string; text?: string; marks?: string[] };
type Block = { _key: string; children?: Span[] };
type Doc = { _id: string; _rev: string; intro?: Block[] };

const plain = (b: Block) => (b.children ?? []).map((s) => s.text ?? "").join("");

async function main() {
  console.log(`patch-teaching-yellow-nov20 (${APPLY ? "APPLY" : "dry"})`);
  const docs = await client.fetch<Doc[]>(`*[_id in ["teachingPage", "drafts.teachingPage"]]{ _id, _rev, intro }`);
  if (!docs.some((d) => d._id === "teachingPage")) throw new Error("teachingPage not found");

  const plans: { doc: Doc; set: Record<string, string> }[] = [];
  for (const doc of docs) {
    const blocks = doc.intro ?? [];
    const set: Record<string, string> = {};
    const next = new Map<string, string>(); // span key → new text
    for (const [from, to] of EDITS) {
      const hits = blocks.flatMap((b) =>
        (b.children ?? [])
          .filter((s) => !(s.marks ?? []).length && (next.get(s._key) ?? s.text ?? "").includes(from))
          .map((s) => ({ b, s })),
      );
      if (hits.length === 0) {
        const already = blocks.some((b) => plain(b).includes(to.trim()));
        console.log(`  ${doc._id}: "${from.trim()}" not found${already ? " (already updated)" : ""}`);
        if (!already) throw new Error(`refusing: "${from}" not found and not already updated`);
        continue;
      }
      if (hits.length > 1) throw new Error(`refusing: "${from}" found ${hits.length}×`);
      const { b, s } = hits[0];
      const t = (next.get(s._key) ?? s.text ?? "").replace(from, to);
      next.set(s._key, t);
      set[`intro[_key=="${b._key}"].children[_key=="${s._key}"].text`] = t;
    }
    // Final check: paragraphs 2–3 must equal the doc.
    const after = blocks.map((b) => ({ ...b, children: (b.children ?? []).map((s) => ({ ...s, text: next.get(s._key) ?? s.text })) }));
    [1, 2].forEach((i, k) => {
      const got = plain(after[i] ?? { _key: "", children: [] });
      if (got !== EXPECTED[k]) throw new Error(`refusing: paragraph ${i + 1} would not match the doc:\n  got:  ${got}\n  want: ${EXPECTED[k]}`);
    });
    console.log(`\n${doc._id} (rev ${doc._rev})`);
    [1, 2].forEach((i) => {
      console.log(`  P${i + 1} before: ${plain(blocks[i])}`);
      console.log(`  P${i + 1} after:  ${plain(after[i])}`);
    });
    if (Object.keys(set).length) plans.push({ doc, set });
  }

  if (!plans.length) return console.log("\nnothing to do — already matches the doc");
  if (!APPLY) return console.log(`\ndry run — nothing written (re-run with -- --apply)`);

  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `teaching-yellow-nov20-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify(plans.map((p) => ({ _id: p.doc._id, _rev: p.doc._rev, intro: p.doc.intro })), null, 1));
  console.log(`\nbackup → ${file}`);
  for (const p of plans) {
    const res = await client.patch(p.doc._id).ifRevisionId(p.doc._rev).set(p.set).commit();
    console.log(`✓ ${p.doc._id}: Teaching paragraphs 2–3 updated (rev ${res._rev})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
