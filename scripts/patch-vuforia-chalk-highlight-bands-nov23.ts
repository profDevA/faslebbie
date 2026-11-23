/**
 * Vuforia Chalk: the two middle image sliders become 3×2 "Project Highlights"
 * grids, and the reel added at the end this morning goes (Sakib, Teams Nov 23:
 * "I need that two section as highlight reel. Not to add a highlight reel
 * section in last"; Figma Final Cleanup Page 1 `1189:15066` beside band 5 and
 * `1189:15635` beside band 7; Xian, Nov 23: "let's make him upload correct
 * videos"). Items: docs/meetings/2026-11-22-actions.md #6.
 *
 *   "Hands-Free AR Support" c7831caea483  → new EMPTY reel (Sakib uploads 6)
 *   "Chalk Mobile Support"  455df6df870f  → the reel b633ea07aa0a, moved here
 *                                            with Sakib's 6 Scene-3 videos
 *   end reel b633ea07aa0a (after Impact)  → gone from the end
 *
 * Both reels styled like the Figma: grid, gap 14 (every other reel), section
 * #658181, title #e6ece8, cell matte #baccbd, title "Project Highlights".
 * An empty reel renders nothing on the site. Only the sections array changes;
 * the two old bands are saved in the backup (restore = put them back by key).
 * Published + any draft, one transaction per doc under ifRevisionId.
 * Dry by default; `-- --apply` writes.
 *
 *   npx sanity exec scripts/patch-vuforia-chalk-highlight-bands-nov23.ts --with-user-token [-- --apply]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { sanityColor } from "../src/lib/sanityAppearanceDefaults";
import { APPLY, BACKUPS, client as cliClient, key } from "./lib/structure-nov11";

const client = cliClient.withConfig({ perspective: "raw" });
const BAND_AR = "c7831caea483"; // "Hands-Free AR Support" → new empty reel
const BAND_MOBILE = "455df6df870f"; // "Chalk Mobile Support" → existing reel
const REEL = "b633ea07aa0a"; // reel after Impact, holds Sakib's Scene-3 videos

const STYLE = {
  sectionTitle: "Project Highlights",
  layout: "grid",
  gridGap: 14,
  gridCellMatteColor: sanityColor("#baccbd"),
  appearance: {
    _type: "appearance",
    backgroundColor: sanityColor("#658181"),
    textColor: sanityColor("#e6ece8"),
  },
};

type Sec = { _key: string; _type: string; sectionTitle?: string; cells?: unknown[]; [k: string]: unknown };
type Doc = { _id: string; _rev: string; sections?: Sec[] };

async function main() {
  console.log(`patch-vuforia-chalk-highlight-bands-nov23 (${APPLY ? "APPLY" : "dry"})`);
  const docs = await client.fetch<Doc[]>(`*[_id in ["cs-vuforia-chalk", "drafts.cs-vuforia-chalk"]]{ _id, _rev, sections }`);
  if (!docs.some((d) => d._id === "cs-vuforia-chalk")) throw new Error("cs-vuforia-chalk not found");

  const plans: { doc: Doc; reelNew: Sec; reelMoved: Sec; old: Sec[] }[] = [];
  for (const doc of docs) {
    const s = doc.sections ?? [];
    const label = (x: Sec) => `${x._type.replace("Section", "")}${x.sectionTitle ? ` "${x.sectionTitle}"` : ""}`;
    console.log(`\n${doc._id} (rev ${doc._rev}), ${s.length} sections:`);
    s.forEach((x, i) => console.log(`  ${i} ${x._key} ${label(x)}${x._type === "highlightReel" ? ` (${x.cells?.length ?? 0} items)` : ""}`));

    const ar = s.find((x) => x._key === BAND_AR);
    const mobile = s.find((x) => x._key === BAND_MOBILE);
    const reel = s.find((x) => x._key === REEL);
    if (!ar && !mobile && !reel) {
      console.log("  already done — nothing to do");
      continue;
    }
    if (ar?.sectionTitle !== "Hands-Free AR Support" || ar._type !== "desktopMotionShowcase")
      throw new Error(`refusing: ${BAND_AR} is not the "Hands-Free AR Support" slider`);
    if (mobile?.sectionTitle !== "Chalk Mobile Support" || mobile._type !== "desktopMotionShowcase")
      throw new Error(`refusing: ${BAND_MOBILE} is not the "Chalk Mobile Support" slider`);
    if (reel?._type !== "highlightReel") throw new Error(`refusing: reel ${REEL} missing`);
    const ir = s.indexOf(reel);
    if (s[ir - 1]?._type !== "statsSection") throw new Error("refusing: the reel is no longer right after Impact");
    if (s.filter((x) => x._type === "highlightReel").length !== 1) throw new Error("refusing: expected exactly one reel");

    const reelNew: Sec = { _key: key(), _type: "highlightReel", ...STYLE };
    const reelMoved: Sec = { ...reel, ...STYLE };
    console.log(`  ${BAND_AR} "Hands-Free AR Support" → new reel ${reelNew._key} (empty — Sakib uploads 6)`);
    console.log(`  ${BAND_MOBILE} "Chalk Mobile Support" → reel ${REEL} with its ${reel.cells?.length ?? 0} items, moved from after Impact`);
    console.log(`  both: grid, gap 14, bg #658181, title #e6ece8, matte #baccbd, "Project Highlights"`);
    plans.push({ doc, reelNew, reelMoved, old: [ar, mobile, reel] });
  }

  if (!plans.length) return console.log("\nnothing to do");
  if (!APPLY) return console.log(`\ndry run — nothing written (re-run with -- --apply)`);

  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `vuforia-chalk-highlight-bands-nov23-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(
    file,
    JSON.stringify(plans.map((p) => ({ _id: p.doc._id, _rev: p.doc._rev, sectionKeys: p.doc.sections?.map((x) => x._key), removedOrChanged: p.old })), null, 1),
  );
  console.log(`\nbackup → ${file}`);

  for (const p of plans) {
    // One atomic transaction: drop the end reel, then put a reel in each band's place.
    const res = await client
      .transaction()
      .patch(p.doc._id, (q) => q.ifRevisionId(p.doc._rev).unset([`sections[_key=="${REEL}"]`]))
      .patch(p.doc._id, (q) => q.insert("replace", `sections[_key=="${BAND_AR}"]`, [p.reelNew]))
      .patch(p.doc._id, (q) => q.insert("replace", `sections[_key=="${BAND_MOBILE}"]`, [p.reelMoved]))
      .commit();
    const after = await client.fetch<Doc>(`*[_id == $id][0]{ _id, _rev, sections[]{ _key, _type, sectionTitle, cells } }`, { id: p.doc._id });
    console.log(`✓ ${p.doc._id} (tx ${res.transactionId}):`);
    after.sections?.forEach((x, i) =>
      console.log(`  ${i} ${x._key} ${x._type}${x.sectionTitle ? ` "${x.sectionTitle}"` : ""}${x._type === "highlightReel" ? ` (${x.cells?.length ?? 0} items)` : ""}`),
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
