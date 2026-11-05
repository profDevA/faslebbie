/**
 * Israel's recording #2721 (Nov 4; docs/meetings/2026-11-04-2-actions.md A1):
 * "the black all over should not be this colour… everywhere you see this colour,
 * it should be [#171717]… not completely black" (Figma annotation "color code
 * (171717)", 559:36817; repeated for OC Navigator, AR, Design Assist, Vuforia).
 *
 * Every case-study section whose band background is pure black (#000000 — Problem
 * Context, Research Artifacts) → #171717. Only `appearance.backgroundColor`; text
 * colours and everything else untouched. Sections addressed by _key; published +
 * drafts; one revision-guarded patch per document. Dry by default; --apply backs
 * the docs up to ../exports/sanity-backups/ first. Idempotent (re-run finds none).
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-black-bands-171717-nov4.ts --with-user-token
 *   npx sanity exec scripts/patch-black-bands-171717-nov4.ts --with-user-token -- --apply
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getCliClient } from "sanity/cli";
import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });
const APPLY = process.argv.includes("--apply");
const BACKUPS = join(process.cwd(), "..", "exports", "sanity-backups");
const BLACK = new Set(["#000000", "#000"]);
const TO = sanityColor("#171717");

type Section = { _key: string; _type: string; sectionTitle?: string; appearance?: { backgroundColor?: { hex?: string } } };
type Doc = { _id: string; _rev: string; slug?: { current?: string }; sections?: Section[] };

async function main() {
  console.log(`patch-black-bands-171717-nov4 (${APPLY ? "APPLY" : "dry"})`);
  const docs = await client.fetch<Doc[]>(`*[_type == "caseStudy"]{ _id, _rev, slug, sections }`);
  const plan = docs
    .map((d) => ({ d, hits: (d.sections ?? []).filter((s) => BLACK.has((s.appearance?.backgroundColor?.hex ?? "").toLowerCase())) }))
    .filter((p) => p.hits.length);
  let n = 0;
  for (const { d, hits } of plan) {
    console.log(`• ${d._id} (${d.slug?.current}): ${hits.map((s) => `${s._type}${s.sectionTitle ? ` "${s.sectionTitle}"` : ""} [${s._key}]`).join(", ")}`);
    n += hits.length;
  }
  console.log(`\n${n} section(s) in ${plan.length} document(s): #000000 → #171717`);
  if (!APPLY || !plan.length) return;
  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `black-bands-171717-nov4-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify(plan.map((p) => p.d), null, 1));
  console.log(`backup → ${file}`);
  for (const { d, hits } of plan) {
    let patch = client.patch(d._id).ifRevisionId(d._rev);
    for (const s of hits) patch = patch.set({ [`sections[_key=="${s._key}"].appearance.backgroundColor`]: TO });
    await patch.commit();
  }
  console.log("✓ patched");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
