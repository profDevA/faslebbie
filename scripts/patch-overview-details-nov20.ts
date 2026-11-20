/**
 * Overview: move Duration / Team into the flexible "More details" rows
 * (Xian, Nov 20: Sanity structure should be "smart, flexible" for fields like
 * that — Fas wants to add credits such as Photographers / Videographers).
 *
 * For every case study (published AND unpublished drafts — Fas edits in
 * Studio, and publishing an untouched draft later would bring the old fields
 * back), for each Overview section that still has `duration` / `team`:
 *   details = [Duration row, Team row, ...existing details rows]
 *   then unset duration + team.
 * Same text, same order on the page (the code renders Duration, Team, then the
 * rows), so nothing visibly changes. Values are copied as-is (trimmed), line
 * breaks included.
 *
 * Run ONLY after the code that renders `details` is deployed (`More details`,
 * Nov 20) — the old code reads duration / team only.
 *
 * Reads every document at run time (latest data), writes each one under
 * ifRevisionId (refuses if it changed in between), backs up all touched
 * Overview sections first. Dry by default; `-- --apply` writes.
 *
 *   npx sanity exec scripts/patch-overview-details-nov20.ts --with-user-token [-- --apply]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { APPLY, BACKUPS, client as cliClient, key } from "./lib/structure-nov11";

// Raw view: published documents AND drafts.
const client = cliClient.withConfig({ perspective: "raw" });

type Detail = { _key: string; _type?: string; label?: string; value?: string };
type Overview = { _key: string; _type: string; sectionTitle?: string; duration?: string; team?: string; details?: Detail[] };
type Doc = { _id: string; _rev: string; slug?: string; sections?: Overview[] };

const row = (label: string, value: string): Detail => ({ _key: key(), _type: "overviewDetail", label, value });

async function main() {
  console.log(`patch-overview-details-nov20 (${APPLY ? "APPLY" : "dry"})`);
  const docs = await client.fetch<Doc[]>(
    `*[_type == "caseStudy"]{ _id, _rev, "slug": slug.current, "sections": sections[_type == "overviewSection"]{ _key, _type, sectionTitle, duration, team, details } } | order(_id asc)`,
  );

  const plan: { doc: Doc; set: Record<string, unknown>; unset: string[]; before: Overview[] }[] = [];
  for (const doc of docs) {
    const set: Record<string, unknown> = {};
    const unset: string[] = [];
    const before: Overview[] = [];
    for (const ov of doc.sections ?? []) {
      const duration = ov.duration?.trim();
      const team = ov.team?.trim();
      if (!duration && !team && ov.duration === undefined && ov.team === undefined) continue;
      const existing = ov.details ?? [];
      const moved = [
        ...(duration ? [row("Duration", duration)] : []),
        ...(team ? [row("Team", team)] : []),
      ];
      const base = `sections[_key=="${ov._key}"]`;
      set[`${base}.details`] = [...moved, ...existing];
      unset.push(`${base}.duration`, `${base}.team`);
      before.push(ov);
      const label = `${doc._id.startsWith("drafts.") ? "DRAFT " : ""}${doc.slug ?? doc._id} — "${ov.sectionTitle ?? "Overview"}"`;
      console.log(`\n${label}`);
      console.log(`  before: Duration=${JSON.stringify(ov.duration ?? null)}  Team=${JSON.stringify(ov.team ?? null)}  details=${existing.length}`);
      console.log(`  after:  details = [${[...moved, ...existing].map((d) => `${d.label}: ${JSON.stringify((d.value ?? "").slice(0, 60))}`).join(" | ")}]`);
    }
    if (before.length) plan.push({ doc, set, unset, before });
  }

  const drafts = plan.filter((p) => p.doc._id.startsWith("drafts.")).length;
  console.log(`\n${plan.length} documents to change (${plan.length - drafts} published, ${drafts} drafts) of ${docs.length} case-study documents`);
  if (!plan.length) return console.log("nothing to do");
  if (!APPLY) return console.log("dry run — nothing written (re-run with -- --apply)");

  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `overview-details-nov20-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify(plan.map((p) => ({ _id: p.doc._id, _rev: p.doc._rev, overviews: p.before })), null, 1));
  console.log(`backup → ${file}`);

  let ok = 0;
  for (const p of plan) {
    try {
      await client.patch(p.doc._id).ifRevisionId(p.doc._rev).set(p.set).unset(p.unset).commit();
      ok++;
      console.log(`✓ ${p.doc._id}`);
    } catch (err) {
      console.error(`✗ ${p.doc._id}: ${(err as Error).message} — changed since it was read; re-run the script`);
    }
  }
  console.log(`\n${ok} / ${plan.length} documents updated`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
