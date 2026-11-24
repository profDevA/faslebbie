/**
 * Approach: one section "How I Lead and Work" instead of "How I Lead" +
 * "How I Work" (Fas, Nov 23 call 37:23–38:05 on /approach: "these two looks
 * funny… change this to How I Lead and Work… then move this to the second
 * paragraph… combining these two will make it big like this"). Items:
 * docs/meetings/2026-11-23-actions.md #4. Same pattern as
 * patch-approach-work-best-with-nov22.ts (the merge Fas said "looks good").
 *
 * In one patch per document:
 *   - "How I Lead" title → "How I Lead and Work" (Fas's capitalisation; the
 *     section keeps its _key and its paragraph, incl. the Scalar Leadership
 *     pill's "my Scalar Framework" → /research reveal link);
 *   - the "How I Work" paragraph ("As an embedded ally…") moves as it is (text,
 *     its four grey pills + reveal copy, its _key) to be the 2nd paragraph;
 *   - the empty "How I Work" section is removed.
 * Nothing else changes. Sections are found by (trimmed) title and patched by
 * _key; refuses if either is missing, ambiguous or holds anything other than
 * the one expected paragraph. A re-run after the merge is a no-op. Published +
 * any draft (raw perspective). Dry by default; `-- --apply` plans again right
 * before writing (refuses if anything changed), backs up both full documents
 * and patches under ifRevisionId.
 *
 *   npx sanity exec scripts/patch-approach-lead-and-work-nov24.ts --with-user-token [-- --apply]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { APPLY, BACKUPS, client as cliClient } from "./lib/structure-nov11";

const client = cliClient.withConfig({ perspective: "raw" });
const TARGET = "How I Lead";
const NEW_TITLE = "How I Lead and Work";
const SOURCE = "How I Work"; // live title is "How I Work " (trailing space) — matched trimmed
const TARGET_START = "I lead by designing the conditions";
const MOVED_START = "As an embedded ally";
const LINK = { linkText: "my Scalar Framework", linkHref: "/research" };

type MarkDef = { _key: string; _type: string; expansion?: string; linkText?: string; linkHref?: string };
type Para = { _key: string; _type?: string; markDefs?: MarkDef[]; children?: { text?: string; marks?: string[] }[] };
type Block = { _key: string; _type?: string; subheading?: string; body?: Para[] };
type Sec = { _key: string; _type?: string; title?: string; static?: boolean; blocks?: Block[] };
type Doc = { _id: string; _rev: string; sections?: Sec[] } & Record<string, unknown>;
type Plan = { doc: Doc; target: Sec; source: Sec };

const text = (b: Block) => (b.body ?? []).flatMap((p) => p.children ?? []).map((c) => c.text ?? "").join("");
const titled = (secs: Sec[], t: string) => secs.filter((s) => (s.title ?? "").trim() === t);
const marks = (b: Block) => (b.body ?? []).flatMap((p) => p.markDefs ?? []);
const pills = (b: Block) =>
  marks(b).map((m) => {
    const words = (b.body ?? []).flatMap((p) => p.children ?? []).filter((c) => c.marks?.includes(m._key)).map((c) => c.text).join("");
    return `${m._type} "${words}"${m.linkText ? ` (reveal link "${m.linkText}" → ${m.linkHref})` : ""}`;
  });
const hasLink = (b: Block) => marks(b).some((m) => m._type === "expandPill" && m.linkText === LINK.linkText && m.linkHref === LINK.linkHref);
const outline = (secs: Sec[]) =>
  secs.map((s, i) => `    [${i}] ${s._key} "${s.title}"${s.static ? " (static)" : ""} — ${s.blocks?.length ?? 0} paragraph(s)`).join("\n");

/** The merge as it will be written, applied to a copy (for the dry-run "after"). */
function merged(secs: Sec[], target: Sec, source: Sec): Sec[] {
  return secs
    .filter((s) => s._key !== source._key)
    .map((s) =>
      s._key === target._key
        ? { ...s, title: NEW_TITLE, blocks: [target.blocks![0], ...source.blocks!, ...target.blocks!.slice(1)] }
        : s,
    );
}

async function plan(log: boolean): Promise<Plan[]> {
  const say = (s: string) => log && console.log(s);
  const docs = await client.fetch<Doc[]>(`*[_type == "leadershipPage"]`);
  const odd = docs.filter((d) => d._id !== "leadershipPage" && d._id !== "drafts.leadershipPage");
  if (odd.length) throw new Error(`refusing: unexpected Approach documents (release versions?): ${odd.map((d) => d._id).join(", ")}`);
  if (!docs.some((d) => d._id === "leadershipPage")) throw new Error("leadershipPage not found");
  docs.sort((a, b) => a._id.length - b._id.length); // published first

  const plans: Plan[] = [];
  for (const doc of docs) {
    const secs = doc.sections ?? [];
    say(`\n${doc._id} (rev ${doc._rev}, updated ${doc._updatedAt})\n  before:\n${outline(secs)}`);
    const sources = titled(secs, SOURCE);
    const targets = titled(secs, TARGET);
    if (sources.length === 0 && targets.length === 0) {
      const done = titled(secs, NEW_TITLE);
      const ok = done.length === 1 && text(done[0].blocks?.[1] ?? { _key: "" }).startsWith(MOVED_START);
      if (!ok) throw new Error(`refusing: neither "${TARGET}" nor "${SOURCE}" found, and "${NEW_TITLE}" doesn't hold the moved paragraph`);
      say("  already merged — nothing to do");
      continue;
    }
    if (targets.length !== 1) throw new Error(`refusing: "${TARGET}" found ${targets.length}×`);
    if (sources.length !== 1) throw new Error(`refusing: "${SOURCE}" found ${sources.length}×`);
    if (titled(secs, NEW_TITLE).length) throw new Error(`refusing: a "${NEW_TITLE}" section already exists`);
    const [target, source] = [targets[0], sources[0]];
    const ti = secs.indexOf(target);
    if (secs.indexOf(source) !== ti + 1) throw new Error(`refusing: "${SOURCE}" isn't right after "${TARGET}"`);
    const tb = target.blocks ?? [];
    const sb = source.blocks ?? [];
    if (tb.length !== 1 || !text(tb[0]).startsWith(TARGET_START))
      throw new Error(`refusing: "${TARGET}" doesn't hold the single expected paragraph (${tb.length} blocks)`);
    if (sb.length !== 1 || !text(sb[0]).startsWith(MOVED_START))
      throw new Error(`refusing: "${SOURCE}" doesn't hold the single expected paragraph (${sb.length} blocks)`);
    if (sb[0].subheading) throw new Error(`refusing: the "${SOURCE}" paragraph has a subheading ("${sb[0].subheading}")`);
    if (Boolean(source.static) !== Boolean(target.static))
      throw new Error(`refusing: "${SOURCE}" static=${source.static} but "${TARGET}" static=${target.static} (pills would change)`);
    if (!hasLink(tb[0])) throw new Error(`refusing: the "${LINK.linkText}" → ${LINK.linkHref} reveal link isn't on "${TARGET}"`);
    const otherKeys = (sb[0].body ?? []).flatMap((p) => [p._key, ...(p.markDefs ?? []).map((m) => m._key)]);
    const targetKeys = new Set([tb[0]._key, ...(tb[0].body ?? []).flatMap((p) => [p._key, ...(p.markDefs ?? []).map((m) => m._key)])]);
    if (targetKeys.has(sb[0]._key) || otherKeys.some((k) => targetKeys.has(k))) throw new Error("refusing: key clash between the two paragraphs");

    say(`  "${TARGET}" (${target._key}) → "${NEW_TITLE}": 1 paragraph → 2`);
    say(`    P1 ${tb[0]._key} (stays): ${text(tb[0]).slice(0, 90)}…`);
    pills(tb[0]).forEach((p) => say(`       ${p}`));
    say(`    P2 ${sb[0]._key} (moved from "${SOURCE}"): ${text(sb[0]).slice(0, 90)}…`);
    pills(sb[0]).forEach((p) => say(`       ${p}`));
    say(`  "${source.title}" (${source._key}): section removed (no other content in it)`);
    say(`  after:\n${outline(merged(secs, target, source))}`);
    plans.push({ doc, target, source });
  }
  return plans;
}

async function main() {
  console.log(`patch-approach-lead-and-work-nov24 (${APPLY ? "APPLY" : "dry"})`);
  const first = await plan(true);
  if (!first.length) return console.log("\nnothing to do");
  if (!APPLY) return console.log(`\ndry run — nothing written (re-run with -- --apply)`);

  // Re-read right before writing; refuse if anything moved since the plan above.
  const plans = await plan(false);
  const sig = (ps: Plan[]) => JSON.stringify(ps.map((p) => [p.doc._id, p.doc._rev, p.target._key, p.source._key]));
  if (sig(plans) !== sig(first)) throw new Error("refusing: the Approach documents changed while planning — run again");

  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `approach-lead-and-work-nov24-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify(plans.map((p) => p.doc), null, 1));
  console.log(`\nbackup (full documents) → ${file}`);

  for (const { doc, target, source } of plans) {
    const t = `sections[_key=="${target._key}"]`;
    const res = await client
      .patch(doc._id)
      .ifRevisionId(doc._rev)
      .set({ [`${t}.title`]: NEW_TITLE })
      .insert("after", `${t}.blocks[_key=="${target.blocks![0]._key}"]`, source.blocks!)
      .unset([`sections[_key=="${source._key}"]`])
      .commit();
    const after = await client.fetch<Doc>(`*[_id == $id][0]{ _id, _rev, sections }`, { id: doc._id });
    const secs = after.sections ?? [];
    const m = secs.find((s) => s._key === target._key);
    const unchanged = (doc.sections ?? [])
      .filter((s) => s._key !== target._key && s._key !== source._key)
      .every((s) => JSON.stringify(s) === JSON.stringify(secs.find((x) => x._key === s._key)));
    console.log(`✓ ${doc._id} (rev ${res._rev}): sections ${doc.sections?.length} → ${secs.length}`);
    console.log(outline(secs));
    console.log(
      `  "${m?.title}": ${m?.blocks?.length} paragraphs, P2 = ${m?.blocks?.[1]?._key}; Scalar link intact: ${m?.blocks?.[0] ? hasLink(m.blocks[0]) : false}; ` +
        `"${SOURCE}" left: ${titled(secs, SOURCE).length}; other sections unchanged: ${unchanged}`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
