/**
 * Work Page intro (.txt narrative): "The AR Handbook" still links the old slug
 * `remote-assistant-object-detection` (the study was renamed; /work/remote-…
 * only reaches it through a 308 in next.config.ts). Points that one link at
 * `the-ar-handbook` (Xian's batch, Nov 27).
 *
 * Changes 1 field: workPage.intro[_key=="7dd917c0c6b4"].markDefs[_key=="61fd00d8b527"].slug
 * (Studio: Work Page → Intro → PTC paragraph → "The AR Handbook" link → Project).
 * Text, other links and every other field are untouched.
 *
 * Safety: the published value must still be the old slug (pinned; refuses
 * otherwise) and the new slug must be a published case study. The rev is not
 * pinned, so this runs before or after patch-work-hide-txt-nov27.ts. An open
 * draft is reported (publishing it would undo this) and left alone. Re-reads
 * right before writing, backs up the whole Work Page document to
 * ../exports/sanity-backups/, patches under `ifRevisionID`, then reads back.
 *
 * Plan only (default, or `-- --dry`); write with `-- --apply`.
 *
 *   npx sanity exec scripts/patch-work-ar-link-nov27.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-work-ar-link-nov27.ts --with-user-token -- --apply
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { BACKUPS, client as cliClient } from "./lib/structure-nov11";

const client = cliClient.withConfig({ perspective: "raw" });
const APPLY = process.argv.includes("--apply");
const DRY = process.argv.includes("--dry") || !APPLY;

const DOC_ID = "workPage";
/** Pinned location + value (read 2026-11-27, rev GM6eUGeLE19gkg4A5QgNzl). */
const BLOCK_KEY = "7dd917c0c6b4";
const MARK_KEY = "61fd00d8b527";
const LINK_TEXT = "The AR Handbook";
const FROM = "remote-assistant-object-detection";
const TO = "the-ar-handbook";
const PATH = `intro[_key=="${BLOCK_KEY}"].markDefs[_key=="${MARK_KEY}"].slug`;
const STUDIO = 'Work Page → Intro → PTC paragraph → "The AR Handbook" link';

type Span = { _type: string; text?: string; marks?: string[] };
type MarkDef = { _key: string; _type: string; slug?: string };
type Block = { _key: string; _type: string; children?: Span[]; markDefs?: MarkDef[] };
type WorkDoc = { _id: string; _rev: string; _updatedAt?: string; intro?: Block[] } & Record<string, unknown>;

const show = (v: unknown) => (v === undefined || v === null ? "(unset)" : JSON.stringify(v));

async function readDocs(): Promise<{ pub: WorkDoc | null; draft: WorkDoc | null; versions: WorkDoc[] }> {
  const all = await client.fetch<WorkDoc[]>(`*[_type == "workPage"]`);
  const others = all.filter((d) => d._id !== DOC_ID && !d._id.startsWith("drafts.") && !d._id.startsWith("versions."));
  if (others.length) throw new Error(`refusing: unexpected workPage documents ${others.map((d) => d._id).join(", ")}`);
  return {
    pub: all.find((d) => d._id === DOC_ID) ?? null,
    draft: all.find((d) => d._id === `drafts.${DOC_ID}`) ?? null,
    versions: all.filter((d) => d._id.startsWith("versions.")),
  };
}

function findLink(doc: WorkDoc | null) {
  const block = doc?.intro?.find((b) => b._key === BLOCK_KEY);
  const mark = block?.markDefs?.find((m) => m._key === MARK_KEY);
  const text = (block?.children ?? [])
    .filter((c) => c.marks?.includes(MARK_KEY))
    .map((c) => c.text ?? "")
    .join("");
  return { block, mark, text };
}

type Plan = { rev: string; before: unknown; problems: string[]; already: boolean; draftNote: string; doc: WorkDoc | null };

async function plan(log: boolean): Promise<Plan> {
  const say = (s: string) => log && console.log(s);
  const { pub, draft, versions } = await readDocs();
  const problems: string[] = [];
  if (!pub) {
    problems.push(`no published ${DOC_ID} document`);
    return { rev: "", before: undefined, problems, already: false, draftNote: "", doc: null };
  }
  const { block, mark, text } = findLink(pub);
  say(`\n${DOC_ID} rev ${pub._rev} (updated ${pub._updatedAt ?? "?"})`);
  say(`  Studio: ${STUDIO}`);
  say(`  ${PATH}: ${show(mark?.slug)}   link text: ${show(text)}`);

  if (!block) problems.push(`intro block ${BLOCK_KEY} not found (Studio edit since Nov 27?)`);
  else if (!mark) problems.push(`link ${MARK_KEY} not found in block ${BLOCK_KEY}`);
  else if (mark._type !== "project") problems.push(`link ${MARK_KEY} is type ${show(mark._type)}, expected "project"`);
  if (mark && text !== LINK_TEXT) problems.push(`link text is ${show(text)}, expected ${show(LINK_TEXT)}`);
  const already = mark?.slug === TO;
  if (mark && !already && mark.slug !== FROM) problems.push(`slug is ${show(mark.slug)}, expected ${show(FROM)}`);

  const target = await client.fetch<string | null>(
    `*[_type == "caseStudy" && slug.current == $s && !(_id in path("drafts.**")) && !(_id in path("versions.**"))][0]._id`,
    { s: TO },
  );
  say(`  target case study "${TO}": ${target ?? "NOT FOUND"}`);
  if (!target) problems.push(`no published case study with slug ${show(TO)}`);

  let draftNote = "";
  if (draft) {
    const dv = findLink(draft).mark?.slug;
    draftNote =
      dv === TO
        ? `draft drafts.${DOC_ID} (rev ${draft._rev}) already links ${show(dv)}`
        : `DRAFT drafts.${DOC_ID} (rev ${draft._rev}) links ${show(dv)} — publishing that draft would undo this`;
  }
  if (versions.length) draftNote += `${draftNote ? "; " : ""}release versions: ${versions.map((v) => v._id).join(", ")}`;
  say(`  draft: ${draft ? draftNote : "none"}`);
  return { rev: pub._rev, before: mark?.slug, problems, already, draftNote, doc: pub };
}

async function main() {
  console.log(`patch-work-ar-link-nov27 (${DRY ? "DRY — nothing written" : "APPLY"})`);
  const first = await plan(true);

  if (first.problems.length) {
    console.log(`\nREFUSED (${first.problems.length}):`);
    for (const p of first.problems) console.log(`  - ${p}`);
    if (!DRY) throw new Error("refusing: Work Page not as expected (see above)");
    return;
  }
  if (first.already) return console.log(`\nalready set: "${LINK_TEXT}" → ${show(TO)} — nothing to do`);

  console.log(`\n— Plan: 1 field in 1 document`);
  console.log(`  ${DOC_ID}.${PATH}: ${show(first.before)} → ${show(TO)}${first.draftNote ? `  [${first.draftNote}]` : ""}`);
  console.log(`  effect: "${LINK_TEXT}" in the Work .txt opens /work/${TO} directly (no 308 hop)`);
  console.log(`  undo:   set the slug back to ${show(FROM)} (backup below) — the 308 keeps the old one working`);

  if (DRY) return console.log(`\ndry run — nothing written (re-run with -- --apply to write; production)`);

  // Re-read right before writing; refuse if anything moved.
  const p = await plan(false);
  if (p.problems.length || p.rev !== first.rev || p.before !== first.before)
    throw new Error("refusing: the Work Page changed while planning — run again");

  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `work-ar-link-nov27-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify({ _id: DOC_ID, _rev: p.rev, path: PATH, before: p.before, after: TO, document: p.doc }, null, 1));
  console.log(`\nbackup (whole document) → ${file}`);

  const res = await client
    .patch(DOC_ID)
    .ifRevisionId(p.rev)
    .set({ [PATH]: TO })
    .commit({ visibility: "sync" });
  console.log(`✓ committed ${DOC_ID}.${PATH} = ${show(TO)} → rev ${res._rev} at ${new Date().toISOString()}`);

  const back = await readDocs();
  const v = findLink(back.pub).mark?.slug;
  console.log(`\nread back: ${v === TO ? "OK   " : "WRONG"} ${PATH} = ${show(v)}${back.draft ? ` (draft drafts.${DOC_ID} untouched)` : ""}`);
  if (v !== TO) throw new Error("read-back check failed — restore from the backup");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
