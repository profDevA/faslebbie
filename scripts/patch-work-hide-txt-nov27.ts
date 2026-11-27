/**
 * Fas, tracker tab "Fas New Thoughts" (owner Xian, Nov 27): "Case studies: Hide
 * the case study .txt and take it straight to the gallery thumbnail case study.
 * It's just easier for people to access that. For now, we can always put it
 * back later, but let's hide that."
 *
 * Sets Work Page `enableTextView` true → false (Studio: Work Page → "Enable text
 * view"). `enableImageView` must stay true (pinned), or Work would have no view.
 * With text off and gallery on, WorkBody hides the .txt / .img switch and opens
 * /work in .img. Apply AFTER the code deploy of the Nov 27 batch: that
 * WorkBody forces the only enabled view (an old /work?view=txt link shows the
 * gallery) and lets the gallery take the switch row's height. Applied before
 * it, the live site would show the narrative for ?view=txt and leave a ~75 px
 * empty strip under the gallery.
 *
 * Put it back later: Studio → Work Page → switch "Enable text view" on → Publish
 * (or set the field back to true). The narrative ("Text narrative"), Stack icons
 * and section title are not touched.
 *
 * Safety: the published value must still be `true` (pinned; refuses otherwise);
 * an open draft is reported (publishing it would undo this if it still says
 * true) and left alone. Re-reads right before writing, backs up the whole Work
 * Page document to ../exports/sanity-backups/, patches under `ifRevisionID`,
 * then reads back.
 *
 * Plan only (default, or `-- --dry`); write with `-- --apply`.
 *
 *   npx sanity exec scripts/patch-work-hide-txt-nov27.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-work-hide-txt-nov27.ts --with-user-token -- --apply
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { BACKUPS, client as cliClient } from "./lib/structure-nov11";

const client = cliClient.withConfig({ perspective: "raw" });
const APPLY = process.argv.includes("--apply");
const DRY = process.argv.includes("--dry") || !APPLY;

const DOC_ID = "workPage";
const FIELD = "enableTextView";
/** Pinned current value (read 2026-11-27, rev GM6eUGeLE19gkg4A5QgNzl, updated 2026-09-23). */
const FROM = true;
const TO = false;
/** Must hold, or hiding .txt would leave Work with no view. */
const IMAGE_FIELD = "enableImageView";
const IMAGE_EXPECTED = true;
const STUDIO = 'Work Page → "Enable text view"';

type WorkDoc = { _id: string; _rev: string; _updatedAt?: string } & Record<string, unknown>;

const show = (v: unknown) => (v === undefined || v === null ? "(unset)" : JSON.stringify(v));
/** The site treats unset as on (`workFromSanity`: `!== false`). */
const effective = (v: unknown) => v !== false;

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

type Plan = { rev: string; before: unknown; problems: string[]; already: boolean; draftNote: string };

async function plan(log: boolean): Promise<Plan & { doc: WorkDoc | null }> {
  const say = (s: string) => log && console.log(s);
  const { pub, draft, versions } = await readDocs();
  const problems: string[] = [];
  if (!pub) {
    problems.push(`no published ${DOC_ID} document`);
    return { rev: "", before: undefined, problems, already: false, draftNote: "", doc: null };
  }
  const cur = pub[FIELD];
  const img = pub[IMAGE_FIELD];
  say(`\n${DOC_ID} rev ${pub._rev} (updated ${pub._updatedAt ?? "?"})`);
  say(`  Studio: ${STUDIO}`);
  say(`  ${FIELD}: ${show(cur)}   ${IMAGE_FIELD}: ${show(img)}   sectionTitle: ${show(pub.sectionTitle)}`);

  const already = cur === TO;
  if (!already && cur !== FROM) problems.push(`${FIELD} is ${show(cur)}, expected ${show(FROM)} (Studio edit since Nov 27?)`);
  if (effective(img) !== IMAGE_EXPECTED)
    problems.push(`${IMAGE_FIELD} is ${show(img)} — gallery view is off; hiding .txt would leave Work with no view`);

  let draftNote = "";
  if (draft) {
    const dv = draft[FIELD];
    draftNote =
      dv === TO
        ? `draft drafts.${DOC_ID} (rev ${draft._rev}) already has ${FIELD} ${show(dv)}`
        : `DRAFT drafts.${DOC_ID} (rev ${draft._rev}) has ${FIELD} ${show(dv)} — publishing that draft would undo this`;
  }
  if (versions.length) draftNote += `${draftNote ? "; " : ""}release versions: ${versions.map((v) => v._id).join(", ")}`;
  say(`  draft: ${draft ? draftNote : "none"}`);
  return { rev: pub._rev, before: cur, problems, already, draftNote, doc: pub };
}

async function main() {
  console.log(`patch-work-hide-txt-nov27 (${DRY ? "DRY — nothing written" : "APPLY"})`);
  const first = await plan(true);

  if (first.problems.length) {
    console.log(`\nREFUSED (${first.problems.length}):`);
    for (const p of first.problems) console.log(`  - ${p}`);
    if (!DRY) throw new Error("refusing: Work Page not as expected (see above)");
    return;
  }
  if (first.already) return console.log(`\nalready set: ${FIELD} ${show(TO)} — nothing to do`);

  console.log(`\n— Plan: 1 field in 1 document`);
  console.log(`  ${DOC_ID}.${FIELD}: ${show(first.before)} → ${show(TO)}${first.draftNote ? `  [${first.draftNote}]` : ""}`);
  console.log(`  effect: Work opens in .img, no .txt / .img switch; narrative kept in Studio`);
  console.log(`  undo:   Studio → ${STUDIO} on → Publish`);

  if (DRY) return console.log(`\ndry run — nothing written (re-run with -- --apply to write; production)`);

  // Re-read right before writing; refuse if anything moved.
  const p = await plan(false);
  if (p.problems.length || p.rev !== first.rev || p.before !== first.before)
    throw new Error("refusing: the Work Page changed while planning — run again");

  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `work-hide-txt-nov27-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify({ _id: DOC_ID, _rev: p.rev, field: FIELD, before: p.before, after: TO, document: p.doc }, null, 1));
  console.log(`\nbackup (whole document) → ${file}`);

  const res = await client
    .patch(DOC_ID)
    .ifRevisionId(p.rev)
    .set({ [FIELD]: TO })
    .commit({ visibility: "sync" });
  console.log(`✓ committed ${DOC_ID}.${FIELD} = ${show(TO)} → rev ${res._rev} at ${new Date().toISOString()}`);

  const back = await readDocs();
  const v = back.pub?.[FIELD];
  console.log(`\nread back: ${v === TO ? "OK   " : "WRONG"} ${DOC_ID}.${FIELD} = ${show(v)}${back.draft ? ` (draft drafts.${DOC_ID} untouched)` : ""}`);
  if (v !== TO) throw new Error("read-back check failed — restore from the backup");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
