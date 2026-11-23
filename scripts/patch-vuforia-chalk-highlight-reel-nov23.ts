/**
 * Vuforia Chalk, step 1 of 2: add an EMPTY 3×2 "Project Highlights" reel after
 * Impact (before Reflection) — the spot all 13 other reels use — so Sakib can
 * upload his 6 videos in Studio (Sakib, Teams Nov 20: "make those two screen
 * into 3*2 like other case studies highlight reel"; Fas, Nov 22 call 8:12;
 * Xian, Nov 23: "go with A, apply step 1"). Items:
 * docs/meetings/2026-11-22-actions.md #6.
 *
 * Settings match the other grid reels: layout grid, gap 14, white tile matte;
 * background + text colour copied from Chalk's "Hands-Free AR Support" band
 * (#e9eef7 / #171717). No cells — an empty reel renders nothing on the site
 * (no placeholders); Studio asks for at least one item until Sakib adds them.
 * Step 2 (later, separate script): remove the two single-screen bands.
 *
 * Refuses unless Impact is directly followed by Reflection; a re-run when a
 * reel exists is a no-op. Published + any draft. Dry by default; `-- --apply`
 * backs up the section list and patches under ifRevisionId.
 *
 *   npx sanity exec scripts/patch-vuforia-chalk-highlight-reel-nov23.ts --with-user-token [-- --apply]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { APPLY, BACKUPS, client as cliClient, key } from "./lib/structure-nov11";

const client = cliClient.withConfig({ perspective: "raw" });
const BAND_FOR_COLOURS = "c7831caea483"; // "Hands-Free AR Support"

type Sec = { _key: string; _type: string; sectionTitle?: string; appearance?: Record<string, unknown> };
type Doc = { _id: string; _rev: string; sections?: Sec[] };

async function main() {
  console.log(`patch-vuforia-chalk-highlight-reel-nov23 (${APPLY ? "APPLY" : "dry"})`);
  const docs = await client.fetch<Doc[]>(`*[_id in ["cs-vuforia-chalk", "drafts.cs-vuforia-chalk"]]{ _id, _rev, sections }`);
  if (!docs.some((d) => d._id === "cs-vuforia-chalk")) throw new Error("cs-vuforia-chalk not found");

  const plans: { doc: Doc; after: string; reel: Record<string, unknown> }[] = [];
  for (const doc of docs) {
    const s = doc.sections ?? [];
    console.log(`\n${doc._id} (rev ${doc._rev}): ${s.map((x) => x._type.replace("Section", "")).join(" · ")}`);
    if (s.some((x) => x._type === "highlightReel")) {
      console.log("  already has a highlight reel — nothing to do");
      continue;
    }
    const i = s.findIndex((x) => x._type === "statsSection");
    if (i < 0 || s[i + 1]?._type !== "reflectionSection")
      throw new Error("refusing: expected Impact (statsSection) directly before Reflection");
    const band = s.find((x) => x._key === BAND_FOR_COLOURS);
    const app = band?.appearance as { backgroundColor?: { hex?: string }; textColor?: { hex?: string } } | undefined;
    if (app?.backgroundColor?.hex !== "#e9eef7" || app?.textColor?.hex !== "#171717")
      throw new Error(`refusing: "Hands-Free AR Support" colours changed (${app?.backgroundColor?.hex} / ${app?.textColor?.hex})`);
    const reel = {
      _key: key(),
      _type: "highlightReel",
      sectionTitle: "Project Highlights",
      layout: "grid",
      gridGap: 14,
      gridCellMatteColor: { _type: "color", alpha: 1, hex: "#ffffff" },
      appearance: { _type: "appearance", backgroundColor: app.backgroundColor, textColor: app.textColor },
    };
    console.log(`  + highlightReel ${reel._key} "Project Highlights" (grid, gap 14, matte #ffffff, bg #e9eef7, text #171717, no items)`);
    console.log(`    after Impact ${s[i]._key}, before Reflection ${s[i + 1]._key} → ${s.length} → ${s.length + 1} sections`);
    plans.push({ doc, after: s[i]._key, reel });
  }

  if (!plans.length) return console.log("\nnothing to do");
  if (!APPLY) return console.log(`\ndry run — nothing written (re-run with -- --apply)`);

  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `vuforia-chalk-highlight-reel-nov23-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify(plans.map((p) => ({ _id: p.doc._id, _rev: p.doc._rev, sectionKeys: p.doc.sections?.map((x) => x._key) })), null, 1));
  console.log(`\nbackup → ${file}`);
  for (const p of plans) {
    const res = await client
      .patch(p.doc._id)
      .ifRevisionId(p.doc._rev)
      .insert("after", `sections[_key=="${p.after}"]`, [p.reel])
      .commit();
    const after = await client.fetch<Doc>(`*[_id == $id][0]{ _id, sections }`, { id: p.doc._id });
    console.log(`✓ ${p.doc._id} (rev ${res._rev}): ${after.sections?.map((x) => x._type.replace("Section", "")).join(" · ")}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
