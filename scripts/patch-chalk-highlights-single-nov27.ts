/**
 * Vuforia Chalk · both Project Highlights sections → the single-video layout
 * (Israel's tracker row 127, owner Xian, due Nov 28: "Replace both live 2 × 3
 * grids with the single-video layouts marked in Figma. Keep each section in
 * its current position and let Sakib know when both video slots are ready.")
 *
 * Figma "END DESIGN +DEV 2027" (fr2xqA4MUG62WcbVFQ0xG9), Vuforia Chalk desktop
 * 9:39523, the two bands Israel marked (rectangles 47:11936 / 47:11938):
 *   1. 9:39615 — directly below Research Artifacts
 *   2. 47:11927 — after the first Featured Designs
 * Each: one 1020 × 643 video box with a 13 px white outside stroke (outer
 * 1046 × 669), inner radius ≈ 24, soft shadow below. Sakib's rows 128 / 129
 * combine each grid's clips into one video for that box.
 *
 * What this writes (per section, addressed by `_key`, positions untouched):
 *   layout             "grid" → "single"
 *   singleCardPadding  (unset) → 13        (Figma's white stroke)
 *   singleCardMatteColor (unset) → #ffffff (Figma white; the code default too)
 * `cells` are NOT changed: all six clips stay in the document, in order. The
 * single-video card plays the first item's video (`CaseStudyView.tsx`
 * HighlightVideoCardView), so item 1 is the slot Sakib replaces; items 2–6 stay
 * as the old clips until someone deletes them. Grid-only fields (cell matte,
 * gap) also stay, so setting Layout back to Grid restores the live grid.
 *
 * Why not an empty item for Sakib: `highlightCell` validation makes an item
 * with no video / image an error ("Add a GIF, MP4, URL, or at least one
 * thumbnail image."), which greys out Publish for the whole study, and an
 * empty card would render nothing.
 *
 * Safety: pinned before-state (layout, single fields unset, the six cell keys
 * and their video asset ids, the neighbouring sections); refuses if anything
 * differs. Published document only (an open draft is reported, not touched).
 * Re-reads right before writing, backs up the whole `sections` array plus the
 * two reels' cells to ../exports/sanity-backups/, commits one patch with
 * `ifRevisionID`, then reads back.
 *
 * Undo: Studio → each Project Highlights → Layout "Grid (3×2 cells)" (the
 * cells are still there), or restore the fields from the backup JSON.
 *
 *   npx sanity exec scripts/patch-chalk-highlights-single-nov27.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-chalk-highlights-single-nov27.ts --with-user-token -- --apply
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { isDeepStrictEqual } from "node:util";

import { BACKUPS, client as cliClient } from "./lib/structure-nov11";
import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

const client = cliClient.withConfig({ perspective: "raw" });
const APPLY = process.argv.includes("--apply");
const DRY = process.argv.includes("--dry") || !APPLY;

const SLUG = "vuforia-chalk";
const DOC_ID = "cs-vuforia-chalk";
const PADDING = 13;
const MATTE = "#ffffff";

type Reel = {
  key: string;
  name: string;
  figma: string;
  /** The section right before it (position check). */
  after: { key: string; type: string; title: string };
  /** Pinned cells: _key → video file asset id (in order). */
  cells: [string, string][];
  sakib: string;
};

const REELS: Reel[] = [
  {
    key: "944baeaaff91",
    name: "Project Highlights 1 (below Research Artifacts)",
    figma: "9:39615 (phone 9:42310)",
    after: { key: "0e9d75a7fad0", type: "showcaseGallery", title: "Research Artifacts" },
    cells: [
      ["43de5c37ab47", "file-9c11a59d05d755a2a2c36717faa814e1835c4c7d-mp4"], // 1.mp4 16 MB
      ["5a0137fa70fb", "file-dcbeaf17de20f4c5e86a39791768401e2e58d9c1-mp4"], // 2.mp4 48 MB
      ["c0df459ebeb3", "file-a96efc5594a5f742807e95c7b57b6a4e94b6badf-mp4"], // 3.mp4 12 MB
      ["74f542b73280", "file-959d8e22d45d9f3e6e6a5635eb5570baf67b4501-mp4"], // 4.mp4 12 MB
      ["e5825219361f", "file-5d7032e539c10258cf5eab0f8f5071959fac7317-mp4"], // 5.mp4 82 MB
      ["76c368e03ce9", "file-34be8c8066101a60f79f3f78d93db1c568d17479-mp4"], // 6.mp4 32 MB
    ],
    sakib: "row 128: Join Session keypad + industrial pipes",
  },
  {
    key: "b633ea07aa0a",
    name: "Project Highlights 2 (after the first Featured Designs)",
    figma: "47:11927 (phone 9:42711)",
    after: { key: "8520b82cc5f3", type: "interventionGrid", title: "Featured Designs" },
    cells: [
      ["d7b44996ca77", "file-aab4eb98e46a189c1a43fc746e19de7a08fd7db3-mp4"], // Scene-3-1.mp4 103 MB
      ["1a807cb41722", "file-df249d1b9494b0d8aad4c2bf9fe489013c9bf249-mp4"], // Scene-3-2.mp4 49 MB
      ["cacd54be3f74", "file-917246a8eb60acf1c5bac92709f76101ad75590e-mp4"], // Scene-3-3.mp4 37 MB
      ["011db333cc78", "file-82b6bf42aa987e70a63ae14391a9e0913baca196-mp4"], // Scene-3-4.mp4 97 MB
      ["8e9268b69f25", "file-6fb42ec99f198811358be40995c852e53f40c3a0-mp4"], // Scene-3-5.mp4 22 MB
      ["dfefbcfecfaf", "file-0e85b41bfb69536f588efb3e6bb733d9c326cd53-mp4"], // Scene-3-6.mp4 103 MB
    ],
    sakib: "row 129: Direct Calling + shoe annotation",
  },
];

// ---------------------------------------------------------------------------

type Cell = { _key: string; _type?: string; videoFile?: { asset?: { _ref?: string } } } & Record<string, unknown>;
type Section = { _key: string; _type: string; sectionTitle?: string; cells?: Cell[] } & Record<string, unknown>;
type Doc = { _id: string; _rev: string; slug?: string; sections?: Section[] | null };
type Change = { reel: Reel; path: string; field: string; before: unknown; after: unknown; show: [string, string] };
type Plan = { rev: string; changes: Change[]; already: string[]; problems: string[]; sections: Section[] };

const hex = (v: unknown) => (v && typeof v === "object" ? ((v as { hex?: string }).hex ?? null) : null);
const showVal = (v: unknown) =>
  v == null ? "(unset)" : typeof v === "object" ? `${hex(v) ?? JSON.stringify(v).slice(0, 40)}` : JSON.stringify(v);

async function readDocs(): Promise<Doc[]> {
  return client.fetch<Doc[]>(`*[_id in [$id, "drafts." + $id]]{ _id, _rev, "slug": slug.current, sections }`, { id: DOC_ID });
}

async function plan(log: boolean): Promise<Plan> {
  const say = (s: string) => log && console.log(s);
  const docs = await readDocs();
  const doc = docs.find((d) => d._id === DOC_ID);
  const draft = docs.find((d) => d._id === `drafts.${DOC_ID}`);
  if (!doc) throw new Error(`refusing: no published ${DOC_ID}`);
  if (doc.slug !== SLUG) throw new Error(`refusing: ${DOC_ID} slug is ${doc.slug}, expected ${SLUG}`);
  const sections = doc.sections ?? [];
  say(`\n${DOC_ID} rev ${doc._rev} · ${sections.length} sections${draft ? ` · DRAFT drafts.${DOC_ID} rev ${draft._rev} (left alone)` : " · no draft"}`);

  const changes: Change[] = [];
  const already: string[] = [];
  const problems: string[] = [];

  for (const reel of REELS) {
    say(`\n  [${reel.key}] ${reel.name} · Figma ${reel.figma} · Sakib ${reel.sakib}`);
    const idx = sections.findIndex((s) => s._key === reel.key);
    const n = sections.filter((s) => s._key === reel.key).length;
    if (n !== 1) {
      problems.push(`[${reel.key}] ${n} sections with this _key`);
      continue;
    }
    const sec = sections[idx];
    const prev = sections[idx - 1];
    say(`    position: sections[${idx}] ${sec._type} "${sec.sectionTitle ?? ""}" — after [${idx - 1}] ${prev?._type} "${prev?.sectionTitle ?? ""}" (${prev?._key})`);
    if (sec._type !== "highlightReel") problems.push(`[${reel.key}] is ${sec._type}, expected highlightReel`);
    if (!prev || prev._key !== reel.after.key || prev._type !== reel.after.type || prev.sectionTitle !== reel.after.title)
      problems.push(`[${reel.key}] the section before it is ${prev?._key} ${prev?._type} "${prev?.sectionTitle ?? ""}", expected ${reel.after.key} ${reel.after.type} "${reel.after.title}"`);

    // Cells: pinned keys + video assets, in order; never written.
    const cells = sec.cells ?? [];
    const got = cells.map((c) => [c._key, c.videoFile?.asset?._ref ?? "(no video)"]);
    say(`    cells (kept as they are, ${cells.length}):`);
    cells.forEach((c, i) =>
      say(`      ${i + 1}. ${c._key} ${c.videoFile?.asset?._ref ?? "(no video)"}${c.caption ? ` "${String(c.caption)}"` : ""}${i === 0 ? "   ← the slot Sakib replaces" : ""}`),
    );
    if (!isDeepStrictEqual(got, reel.cells)) problems.push(`[${reel.key}] cells differ from the pinned six (Studio edit since Nov 27? an upload by Sakib?)`);

    const targets: [string, unknown, (v: unknown) => boolean, (v: unknown) => boolean][] = [
      ["layout", "single", (v) => v === "grid", (v) => v === "single"],
      ["singleCardPadding", PADDING, (v) => v == null, (v) => v === PADDING],
      ["singleCardMatteColor", sanityColor(MATTE), (v) => v == null, (v) => (hex(v) ?? "").toLowerCase() === MATTE],
    ];
    for (const [field, to, isFrom, isTo] of targets) {
      const cur = sec[field];
      if (isTo(cur)) {
        say(`    ${field}: already ${showVal(cur)}`);
        already.push(`${reel.key}.${field}`);
        continue;
      }
      if (!isFrom(cur)) {
        problems.push(`[${reel.key}] ${field} is ${showVal(cur)}, expected ${field === "layout" ? '"grid"' : "(unset)"}`);
        continue;
      }
      const path = `sections[_key=="${reel.key}"].${field}`;
      changes.push({ reel, path, field, before: cur ?? null, after: to, show: [showVal(cur), showVal(to)] });
      say(`    ${field}: ${showVal(cur)} → ${showVal(to)}`);
    }
    if (draft) {
      const ds = (draft.sections ?? []).find((s) => s._key === reel.key);
      say(`    draft: layout ${showVal(ds?.layout)}${ds?.layout === "grid" ? " — PUBLISHING THAT DRAFT WOULD UNDO THIS" : ""}`);
    }
  }
  return { rev: doc._rev, changes, already, problems, sections };
}

async function main() {
  console.log(`patch-chalk-highlights-single-nov27 (${DRY ? "DRY — nothing written" : "APPLY"})`);
  const first = await plan(true);

  console.log(`\n— Summary: ${first.changes.length} field(s) in 1 document; already set: ${first.already.length}; cells written: 0`);
  for (const c of first.changes) console.log(`  ${c.reel.key} ${c.field.padEnd(22)} ${c.show[0]} → ${c.show[1]}`);

  if (first.problems.length) {
    console.log(`\n— REFUSED (${first.problems.length}): nothing is written until each is resolved`);
    for (const m of first.problems) console.log(`  - ${m}`);
    if (!DRY) throw new Error(`refusing: ${first.problems.length} item(s) not as expected (see above)`);
  }
  if (!first.changes.length) return console.log("\nnothing to do");
  if (DRY) return console.log(`\ndry run — nothing written (re-run with -- --apply to write; production)`);

  // Re-read right before writing; refuse if anything moved since the plan above.
  const p = await plan(false);
  const sig = (x: Plan) => JSON.stringify([x.rev, x.problems, x.changes.map((c) => [c.path, c.before, c.after])]);
  if (sig(p) !== sig(first)) throw new Error("refusing: the document changed while planning — run again");

  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `chalk-highlights-single-nov27-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(
    file,
    JSON.stringify(
      {
        _id: DOC_ID,
        _rev: p.rev,
        changes: p.changes.map((c) => ({ path: c.path, before: c.before ?? "(unset)", after: c.after })),
        cells: Object.fromEntries(REELS.map((r) => [r.key, p.sections.find((s) => s._key === r.key)?.cells ?? null])),
        sectionsBefore: p.sections,
      },
      null,
      1,
    ),
  );
  console.log(`\nbackup (whole sections array + both reels' cells) → ${file}`);

  const set = Object.fromEntries(p.changes.map((c) => [c.path, c.after]));
  const res = await client.mutate([{ patch: { id: DOC_ID, ifRevisionID: p.rev, set } }] as never, { visibility: "sync" });
  console.log(`✓ committed ${p.changes.length} field(s), transaction ${(res as { transactionId?: string }).transactionId ?? ""} at ${new Date().toISOString()}`);

  // Read back.
  const now = (await readDocs()).find((d) => d._id === DOC_ID)!;
  let ok = true;
  console.log(`\nread back (rev ${now._rev}):`);
  for (const c of p.changes) {
    const v = (now.sections ?? []).find((s) => s._key === c.reel.key)?.[c.field];
    const good = isDeepStrictEqual(v, c.after);
    ok &&= good;
    console.log(`  ${good ? "OK   " : "WRONG"} ${c.reel.key}.${c.field}: ${showVal(v)}`);
  }
  for (const r of REELS) {
    const sec = (now.sections ?? []).find((s) => s._key === r.key);
    const same = isDeepStrictEqual(
      (sec?.cells ?? []).map((c) => [c._key, c.videoFile?.asset?._ref ?? "(no video)"]),
      r.cells,
    );
    ok &&= same;
    console.log(`  ${same ? "OK   " : "WRONG"} ${r.key} cells unchanged (${sec?.cells?.length ?? 0})`);
  }
  if (!ok) throw new Error("read-back check failed — see above; restore from the backup");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
