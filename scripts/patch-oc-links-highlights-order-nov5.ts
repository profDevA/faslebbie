/**
 * Israel's recording #2721 (Nov 4, 1:51–2:17; docs/meetings/2026-11-04-2-actions.md
 * L2): OC Links Project Highlights — "this text goes up here, and this image comes
 * down here, so all the images are down, and all the text are up" (Figma 559:38237:
 * Steve / Juliana / Vivi text tiles on top; headset / crouching / hallway photos below).
 *
 * The six cells are Saqib's loops that swap text ↔ photo. Live order starts
 * text / photo / text over photo / text / photo. Re-ordered so every top tile starts
 * on its text card and every bottom tile on its photo (cells 1, 5, 3 / 4, 2, 6) —
 * Figma's order. Same items (same _keys), order only.
 *
 * One revision-guarded patch on cs-oc-links (+ draft if any). Dry by default;
 * --apply backs the doc up to ../exports/sanity-backups/ first. Refuses if the
 * cells are no longer the expected six.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-oc-links-highlights-order-nov5.ts --with-user-token
 *   npx sanity exec scripts/patch-oc-links-highlights-order-nov5.ts --with-user-token -- --apply
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const APPLY = process.argv.includes("--apply");
const BACKUPS = join(process.cwd(), "..", "exports", "sanity-backups");
const DOC = "cs-oc-links";
const SECTION = "9ebf2d8c557f";
const BEFORE = ["1d5620ad5753", "8c1a8e56bd37", "03bfde03ab5a", "f2a0a4490e34", "d810354b378e", "682545e87034"];
const AFTER = ["1d5620ad5753", "d810354b378e", "03bfde03ab5a", "f2a0a4490e34", "8c1a8e56bd37", "682545e87034"];

type Cell = { _key: string } & Record<string, unknown>;
type Doc = { _id: string; _rev: string; sections: ({ _key: string; _type: string; cells?: Cell[] })[] };

async function main() {
  console.log(`patch-oc-links-highlights-order-nov5 (${APPLY ? "APPLY" : "dry"})`);
  const docs = await client.fetch<Doc[]>(`*[_id in $ids]`, { ids: [DOC, `drafts.${DOC}`] });
  if (!docs.some((d) => d._id === DOC)) throw new Error(`${DOC} not found`);
  const plan: { d: Doc; cells: Cell[] }[] = [];
  for (const d of docs) {
    const s = d.sections.find((x) => x._key === SECTION);
    if (!s || s._type !== "highlightReel") throw new Error(`${d._id}: highlightReel ${SECTION} not found`);
    const keys = (s.cells ?? []).map((c) => c._key);
    if (keys.join() === AFTER.join()) { console.log(`• ${d._id}: already in Figma order`); continue; }
    if (keys.join() !== BEFORE.join()) throw new Error(`${d._id}: cells changed since Nov 4 (${keys.join(", ")}) — not touching them`);
    const byKey = new Map((s.cells ?? []).map((c) => [c._key, c]));
    console.log(`• ${d._id}: cells ${BEFORE.map((k) => BEFORE.indexOf(k) + 1).join(",")} → ${AFTER.map((k) => BEFORE.indexOf(k) + 1).join(",")}`);
    plan.push({ d, cells: AFTER.map((k) => byKey.get(k)!) });
  }
  if (!APPLY || !plan.length) return console.log(plan.length ? "would patch" : "nothing to do");
  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `oc-links-highlights-order-nov5-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify(plan.map((p) => p.d), null, 1));
  console.log(`backup → ${file}`);
  for (const { d, cells } of plan) {
    await client.patch(d._id).ifRevisionId(d._rev).set({ [`sections[_key=="${SECTION}"].cells`]: cells }).commit();
  }
  console.log("✓ patched");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
