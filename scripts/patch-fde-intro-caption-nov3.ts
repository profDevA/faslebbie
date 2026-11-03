/**
 * FDE intro bands (featured motion: abb8fd154374 FDX, 6b9a5ac0e2eb Mint) → caption
 * "Below device", the Final Cleanup layout (Figma 245:44090 / 245:44401): bold
 * heading + body under the phone, 50 right of its centre, 616 wide @1440
 * (`featuredCaptionInset('below')`). Was "Bottom-right" (old 2229:30253 band).
 * OC Navigator's featured band stays "Bottom-right".
 *
 * Addressed by section + row _key, revision-guarded, refuses if an FDE draft
 * exists. Dry by default; --apply backs the doc up to ../exports/sanity-backups/.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-fde-intro-caption-nov3.ts --with-user-token
 *   npx sanity exec scripts/patch-fde-intro-caption-nov3.ts --with-user-token -- --apply
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const APPLY = process.argv.includes("--apply");
const DOC = "cs-financial-data-exchange";
const SECTIONS = ["abb8fd154374", "6b9a5ac0e2eb"];
const BACKUPS = join(process.cwd(), "..", "exports", "sanity-backups");

type Row = { _key: string; captionAlign?: string };
type Section = { _key: string; _type: string; layoutVariant?: string; rows?: Row[] };
type Doc = { _id: string; _rev: string; sections: Section[] };

async function main() {
  console.log(`patch-fde-intro-caption-nov3 (${APPLY ? "APPLY" : "dry"})`);
  const hasDraft = await client.fetch<boolean>(`defined(*[_id == $id][0]._id)`, { id: `drafts.${DOC}` });
  if (hasDraft) throw new Error(`drafts.${DOC} exists — someone is editing FDE in Studio. Publish or discard it first.`);
  const doc = await client.fetch<Doc>(`*[_id == $id][0]`, { id: DOC });
  const sets: Record<string, string> = {};
  for (const key of SECTIONS) {
    const s = doc.sections.find((x) => x._key === key);
    if (!s || s._type !== "motionShowcase" || s.layoutVariant !== "featured") throw new Error(`${key}: not a featured motionShowcase`);
    const row = s.rows?.[0];
    if (!row) throw new Error(`${key}: no row`);
    console.log(`• ${key} row ${row._key}: captionAlign ${JSON.stringify(row.captionAlign ?? null)} → "below"`);
    sets[`sections[_key=="${key}"].rows[_key=="${row._key}"].captionAlign`] = "below";
  }
  if (!APPLY) {
    console.log("dry run — pass -- --apply to write");
    return;
  }
  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `fde-intro-caption-nov3-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify(doc, null, 1));
  console.log(`backup → ${file}`);
  await client.patch(DOC).ifRevisionId(doc._rev).set(sets).commit();
  console.log("✓ written");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
