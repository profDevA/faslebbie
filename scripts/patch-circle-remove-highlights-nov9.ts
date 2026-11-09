/**
 * Tracker (2) row 81 (Fas, Nov 8): "Circle — Remove the Project Highlight section
 * from live site" (docs/meetings/2026-11-09-tracker-actions.md).
 *
 * Unsets the one `highlightReel` section (composite board, key d4e4176ef72f) on
 * `cs-circle` (+ its draft if one exists). Nothing else changes; the section
 * can be re-added in Studio later. Revision-guarded; dry by default; --apply
 * writes a backup of the full document(s) to ../exports/sanity-backups/ first.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-circle-remove-highlights-nov9.ts --with-user-token
 *   npx sanity exec scripts/patch-circle-remove-highlights-nov9.ts --with-user-token -- --apply
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const APPLY = process.argv.includes("--apply");
const BACKUPS = join(process.cwd(), "..", "exports", "sanity-backups");
const DOC = "cs-circle";
const SECTION_KEY = "d4e4176ef72f";

type Section = { _key: string; _type: string; sectionTitle?: string };
type Doc = { _id: string; _rev: string; sections: Section[] };

async function main() {
  console.log(`patch-circle-remove-highlights-nov9 (${APPLY ? "APPLY" : "dry"})`);
  const plan: Doc[] = [];
  for (const id of [DOC, `drafts.${DOC}`]) {
    const doc = await client.fetch<Doc | null>(`*[_id == $id][0]{_id, _rev, sections}`, { id });
    if (!doc) { console.log(`• ${id}: not found (skip)`); continue; }
    const hl = doc.sections.filter((s) => s._type === "highlightReel");
    const target = doc.sections.find((s) => s._key === SECTION_KEY);
    if (!target || target._type !== "highlightReel") throw new Error(`${id}: highlightReel ${SECTION_KEY} not found (highlightReel keys: ${hl.map((s) => s._key).join(", ") || "none"})`);
    if (hl.length !== 1) throw new Error(`${id}: expected exactly 1 highlightReel, found ${hl.length}`);
    const idx = doc.sections.indexOf(target);
    console.log(`• ${id} (rev ${doc._rev}): ${doc.sections.length} sections → ${doc.sections.length - 1}; removing [${idx}] ${target._type} "${target.sectionTitle ?? ""}" (${target._key}); neighbours: ${doc.sections[idx - 1]?._type ?? "—"} / ${doc.sections[idx + 1]?._type ?? "—"}`);
    plan.push(doc);
  }
  if (!plan.length) throw new Error("nothing to patch");
  if (APPLY) {
    mkdirSync(BACKUPS, { recursive: true });
    const file = join(BACKUPS, `circle-remove-highlights-nov9-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
    const full = await client.fetch(`*[_id in $ids]`, { ids: plan.map((d) => d._id) });
    writeFileSync(file, JSON.stringify(full, null, 1));
    console.log(`backup → ${file}`);
    for (const doc of plan) {
      const res = await client.patch(doc._id).ifRevisionId(doc._rev).unset([`sections[_key=="${SECTION_KEY}"]`]).commit<Doc>();
      console.log(`✓ ${doc._id}: now ${res.sections.length} sections, highlightReel left: ${res.sections.filter((s) => s._type === "highlightReel").length}`);
    }
  } else {
    console.log(`would patch ${plan.length} document(s) — re-run with -- --apply`);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
