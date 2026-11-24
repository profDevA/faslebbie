/**
 * Build popups (/build/<project>): set the left image panel per project so it
 * matches the card image's own background (Nov 23 call, item 7 in
 * docs/meetings/2026-11-23-actions.md). Fas: the teal #133034 "was for this
 * first one" (Leoney, whose image background is exactly #133034); photos go
 * "full size".
 *
 * Fields (Studio → Build Page → Projects → <project> → Modal tab, live since
 * 4f7c333): `panelColor` ("Popup image panel colour", Sanity `color`; empty =
 * #133034) and `panelImageFit` ("Popup image size"; empty / "padded" = as now,
 * "fill" = the card image covers the panel, object-cover).
 *
 * Values (card image = projects[].images[0], edges sampled Nov 24 with ffmpeg
 * from the Sanity CDN, 4 corners + 4 edge midpoints):
 *   mineral-pulse   panelColor #342f2f (flat edge), fit left empty (= padded)
 *   gradstudio      panelColor #c7c7c7 (flat edge), fit left empty (= padded)
 *   pebble          panelImageFit "fill" (photo, no single edge colour)
 *   rookieball      panelImageFit "fill" (photo)
 *   deepsocal-agent panelImageFit "fill" (photo)
 * Untouched: leoney (empty = #133034 padded, already right) and sensespace-ai
 * ("Hide on site").
 *
 * Projects are addressed by `_key` and must carry the expected `id`; a field
 * that already holds a different value is refused (Studio edit since), the
 * same value = "already set". Patches the published doc and drafts.buildPage
 * if one exists. Colour = the full @sanity/color-input object (sanityColor()),
 * the shape Studio stores. Dry by default; `-- --apply` re-reads right before
 * writing (refuses if anything moved), backs the target project items up to
 * ../exports/sanity-backups/ and patches under ifRevisionId.
 * Undo: Studio → the project → Modal tab → clear the colour / pick "Padded",
 * or unset the two fields per the backup.
 *
 *   npx sanity exec scripts/patch-build-panel-nov24.ts --with-user-token [-- --apply]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { sanityColor } from "../src/lib/sanityAppearanceDefaults";
import { APPLY, BACKUPS, client as cliClient } from "./lib/structure-nov11";

const client = cliClient.withConfig({ perspective: "raw" });

const BUILD = "buildPage";
const ids = [BUILD, `drafts.${BUILD}`];

type Target = { key: string; id: string; color?: string; fit?: "fill" };

const TARGETS: Target[] = [
  { key: "d60fc0809510", id: "mineral-pulse", color: "#342f2f" },
  { key: "44363ee47db5", id: "gradstudio", color: "#c7c7c7" },
  { key: "9b357b42ba9d", id: "pebble", fit: "fill" },
  { key: "f71622e79345", id: "rookieball", fit: "fill" },
  { key: "d864e31b64db", id: "deepsocal-agent", fit: "fill" },
];
/** Must stay as they are (printed for the record, never written). */
const UNTOUCHED = [
  { key: "503a3aad2d82", id: "leoney" },
  { key: "6d86d23d4110", id: "sensespace-ai" },
];

type Color = { hex?: string; alpha?: number } & Record<string, unknown>;
type Project = {
  _key: string;
  id?: string;
  title?: string;
  hidden?: boolean;
  panelColor?: Color | null;
  panelImageFit?: string | null;
} & Record<string, unknown>;
type Doc = { _id: string; _rev: string; projects?: Project[] | null };
type Change = { doc: Doc; set: Record<string, unknown>; items: Project[] };

const show = (p: Project) =>
  `colour ${p.panelColor?.hex ?? "(empty = #133034)"}, size ${p.panelImageFit ?? "(empty = padded)"}`;

async function plan(log: boolean): Promise<Change[]> {
  const say = (s: string) => log && console.log(s);
  const docs = await client.fetch<Doc[]>(`*[_id in $ids]{ _id, _rev, projects }`, { ids });
  if (!docs.some((d) => d._id === BUILD)) throw new Error(`${BUILD} not found`);
  if (!docs.some((d) => d._id !== BUILD)) say(`  drafts.${BUILD}: none`);

  const changes: Change[] = [];
  for (const doc of docs.sort((a, b) => a._id.length - b._id.length)) {
    say(`\n  ${doc._id} (rev ${doc._rev}) — ${doc.projects?.length ?? 0} projects`);
    const byKey = new Map((doc.projects ?? []).map((p) => [p._key, p]));
    const set: Record<string, unknown> = {};
    const items: Project[] = [];

    for (const t of TARGETS) {
      const p = byKey.get(t.key);
      if (!p) throw new Error(`refusing: ${doc._id} has no project _key ${t.key} (${t.id})`);
      if (p.id !== t.id) throw new Error(`refusing: ${doc._id} _key ${t.key} is "${p.id}", expected "${t.id}"`);
      const path = `projects[_key=="${t.key}"]`;
      const after = { ...p };
      let changed = false;

      if (t.color) {
        const now = p.panelColor?.hex?.toLowerCase();
        if (now && now !== t.color) throw new Error(`refusing: ${t.id} colour is already ${now} (Studio edit?), expected empty`);
        if (!now) {
          set[`${path}.panelColor`] = sanityColor(t.color);
          after.panelColor = { hex: t.color };
          changed = true;
        }
        if (p.panelImageFit && p.panelImageFit !== "padded")
          throw new Error(`refusing: ${t.id} size is "${p.panelImageFit}", expected empty / padded`);
      }
      if (t.fit) {
        if (p.panelImageFit && p.panelImageFit !== "padded" && p.panelImageFit !== t.fit)
          throw new Error(`refusing: ${t.id} size is "${p.panelImageFit}"`);
        if (p.panelColor?.hex) throw new Error(`refusing: ${t.id} has a colour ${p.panelColor.hex} (Studio edit?), expected empty`);
        if (p.panelImageFit !== t.fit) {
          set[`${path}.panelImageFit`] = t.fit;
          after.panelImageFit = t.fit;
          changed = true;
        }
      }
      say(`    ${t.id.padEnd(16)} ${show(p)}`);
      say(`    ${"".padEnd(16)} → ${changed ? show(after) : "already set — nothing to do"}`);
      if (changed) items.push(p);
    }

    for (const u of UNTOUCHED) {
      const p = byKey.get(u.key);
      if (!p || p.id !== u.id) throw new Error(`refusing: ${doc._id} _key ${u.key} is not "${u.id}"`);
      say(`    ${u.id.padEnd(16)} ${show(p)}${p.hidden ? ", Hide on site: on" : ""} — untouched`);
    }
    const known = new Set([...TARGETS, ...UNTOUCHED].map((t) => t.key));
    for (const p of doc.projects ?? []) if (!known.has(p._key)) say(`    (other project ${p.id} _key ${p._key} — untouched)`);

    if (Object.keys(set).length) changes.push({ doc, set, items });
  }
  return changes;
}

async function main() {
  console.log(`patch-build-panel-nov24 (${APPLY ? "APPLY" : "dry"})`);
  const first = await plan(true);
  const n = first.reduce((s, c) => s + Object.keys(c.set).length, 0);
  console.log(`\n${n} field(s) to set in ${first.length} document(s)`);
  if (!first.length) return console.log("nothing to do");
  for (const c of first) for (const [k, v] of Object.entries(c.set)) console.log(`  ${c.doc._id}: ${k} = ${JSON.stringify(v)}`);
  if (!APPLY) return console.log(`\ndry run — nothing written (re-run with -- --apply)`);

  // Re-read right before writing; refuse if anything moved since the plan above.
  const changes = await plan(false);
  const sig = (cs: Change[]) => JSON.stringify(cs.map((c) => [c.doc._id, c.doc._rev, c.set]));
  if (sig(changes) !== sig(first)) throw new Error("refusing: the documents changed while planning — run again");

  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `build-panel-nov24-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(
    file,
    JSON.stringify(changes.map((c) => ({ _id: c.doc._id, _rev: c.doc._rev, before: c.items })), null, 1),
  );
  console.log(`\nbackup → ${file}`);

  for (const c of changes) {
    const res = await client.patch(c.doc._id).ifRevisionId(c.doc._rev).set(c.set).commit();
    console.log(`✓ ${c.doc._id} (rev ${c.doc._rev} → ${res._rev}): ${Object.keys(c.set).length} field(s) set`);
  }

  console.log(`\nread back:`);
  await plan(true);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
