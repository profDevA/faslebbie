/**
 * Israel's Nov 25 Build video (Recording #2882, "just re-upload these images")
 * + Figma Holistic 28fl2XqojJTa3jEblotAaz, page QUICK FIXES: each Build popup
 * gets its own left-panel art and a sharper output visual.
 *
 * Build Page → Projects → <project> → Modal tab, per project:
 *  - "Popup image (left panel)" (`popupImage`, new field, Nov 25 code — the
 *    popup draws it full-bleed; empty = the card image as before) ← Israel's
 *    549 × 684 panel art exported @4x (2196 × 2736), the frame above each
 *    popup frame on QUICK FIXES.
 *  - "Output visual" (`outputVisual`) ← the 384.6 × 318.5 output visual
 *    (the frame below each popup frame) @4x, trimmed to 1538 × 1274 (Figma's
 *    export has a half-covered darker last column / row). Only the asset
 *    reference changes; crop / hotspot are unset if present; other keys kept.
 *  The card image ("Card cover + hero", the .img grid) is not touched.
 *
 *  Project (Figma popup)            panel art    output visual
 *  Pebble (5250:11440)              5252:59011   5252:28812
 *  Gradstudio (5250:3826)           5252:63062   5250:5795
 *  Leoney (5250:3521)               5252:59330   5252:19989
 *  DeepSoCal Agent (5250:9089)      5252:63180   5250:10023
 *  Mineral Pulse (5250:10750)       5252:63302   5250:11273
 *  Rookieball (5252:58901)          5252:63163   5250:7682   ← PLACEHOLDER
 *    (red in Figma; Israel: "you can upload this one… just to see where it is
 *    sitting", he replaces it later — swap his final files in Studio then; a
 *    re-run of this script refuses once the fields hold the placeholders.)
 *
 * Projects are found by `_key` in `buildPage.projects` and must still carry
 * their expected `id` + `title` and not be hidden. `popupImage` must be empty
 * (or already the new asset) and `outputVisual` must still be the asset it was
 * on Nov 25 (or already the new one), else it refuses (a Studio upload since).
 * A draft of the Build page makes it refuse (publishing that draft later would
 * undo this). Re-reads right before writing (refuses if anything changed since
 * the plan), backs the target project items up to
 * ../exports/sanity-backups/, writes everything in one transaction
 * (`ifRevisionID` on the first patch), then reads back.
 *
 * DRY BY DEFAULT: plans only, uploads nothing (it looks each file up by sha1
 * to say whether an upload would happen). `-- --apply` uploads and writes.
 * Uploads reuse an asset with the same sha1 and retry a dropped connection;
 * re-run after apply = "already set". Options: `-- --only=pebble,leoney`
 * (project ids; e.g. leave Rookieball out), `-- --dir=<folder>` (default
 * ../exports/build-popup-art-2026-11-25/, copies of the Nov 25 scratchpad
 * exports). Undo: clear "Popup image (left panel)" / pick the old output
 * visual in Studio, or restore from the backup.
 *
 * Without the Nov 25 code (`popupImage` in the query + BuildProjectModal), the
 * popup ignores `popupImage`; the output visuals change on the live site
 * within the 60 s revalidate either way.
 *
 *   npx sanity exec scripts/patch-build-popup-images-nov25.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-build-popup-images-nov25.ts --with-user-token -- --apply
 */
import { createReadStream, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";

import { BACKUPS, client as cliClient } from "./lib/structure-nov11";

const client = cliClient.withConfig({ perspective: "raw" });
const APPLY = process.argv.includes("--apply");
const DIR = resolve(
  process.argv.find((a) => a.startsWith("--dir="))?.slice("--dir=".length) ??
    join(process.cwd(), "..", "exports", "build-popup-art-2026-11-25"),
);
const ONLY = process.argv
  .find((a) => a.startsWith("--only="))
  ?.slice("--only=".length)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const DOC_ID = "buildPage";

const ART_SIZE = [2196, 2736] as const; // 549 × 684 @4x
const OUT_SIZE = [1538, 1274] as const; // 384.6 × 318.5 @4x, last column / row trimmed

type Target = {
  key: string;
  id: string;
  title: string;
  art: string;
  out: string;
  /** `outputVisual` asset on Nov 25 (before this patch). */
  oldOut: string;
  placeholder?: boolean;
};

/** Array order on Nov 25 (Figma 5250:13756 order). SenseSpace AI (hidden) is not touched. */
const TARGETS: Target[] = [
  {
    key: "9b357b42ba9d",
    id: "pebble",
    title: "Pebble",
    art: "pebble-panel-art-5252-59011@4x.png",
    out: "pebble-output-visual-5252-28812@4x-trim.png",
    oldOut: "image-0640258937a3982088dda011922298006782bd2f-770x638-png",
  },
  {
    key: "44363ee47db5",
    id: "gradstudio",
    title: "Gradstudio",
    art: "gradstudio-panel-art-5252-63062@4x.png",
    out: "gradstudio-output-visual-5250-5795@4x-trim.png",
    oldOut: "image-2cf6765b8be6e2c8f38c1523cf8aeab3e171d008-1154x956-png",
  },
  {
    key: "503a3aad2d82",
    id: "leoney",
    title: "Leoney",
    art: "leoney-panel-art-5252-59330@4x.png",
    out: "leoney-output-visual-5252-19989@4x-trim.png",
    oldOut: "image-0f4a65ac77a9e573273f778e3c2767ec555f10e9-770x638-png",
  },
  {
    key: "d864e31b64db",
    id: "deepsocal-agent",
    title: "DeepSoCal Agent",
    art: "deepsocal-agent-panel-art-5252-63180@4x.png",
    out: "deepsocal-agent-output-visual-5250-10023@4x-trim.png",
    oldOut: "image-ab5b9befb161214ebf8c0d5a765f43f4ef53644c-770x638-png",
  },
  {
    key: "d60fc0809510",
    id: "mineral-pulse",
    title: "Mineral Pulse",
    art: "mineral-pulse-panel-art-5252-63302@4x.png",
    out: "mineral-pulse-output-visual-5250-11273@4x-trim.png",
    oldOut: "image-b5b44cdeaeb59cfc97bf4e66dcb213eb267e2db7-770x638-png",
  },
  {
    key: "f71622e79345",
    id: "rookieball",
    title: "Rookieball",
    art: "rookieball-panel-art-5252-63163@4x-PLACEHOLDER.png",
    out: "rookieball-output-visual-5250-7682@4x-trim-PLACEHOLDER.png",
    oldOut: "image-fb54c02eb8b4de3c60cd73ed9a181205c8a520f2-1154x956-png",
    placeholder: true,
  },
];

type Image = { _type?: string; asset?: { _ref?: string }; crop?: unknown; hotspot?: unknown } & Record<string, unknown>;
type Item = { _key: string; id?: string; title?: string; hidden?: boolean; popupImage?: Image | null; outputVisual?: Image | null } & Record<string, unknown>;
type Doc = { _id: string; _rev: string; projects?: Item[] };
type FileInfo = { file: string; abs: string; w: number; h: number; bytes: number; sha1: string; existing: string | null };
type Step = {
  t: Target;
  before: Item;
  art: FileInfo;
  out: FileInfo;
  setArt: boolean;
  setOut: boolean;
  unsetOut: string[];
};
type Plan = { rev: string; steps: Step[] };

const targets = ONLY ? TARGETS.filter((t) => ONLY.includes(t.id)) : TARGETS;
if (ONLY) {
  const unknown = ONLY.filter((id) => !TARGETS.some((t) => t.id === id));
  if (unknown.length) throw new Error(`--only: unknown project id(s) ${unknown.join(", ")}`);
}

// ---- files -----------------------------------------------------------------

function readFile(file: string, [W, H]: readonly [number, number]): Omit<FileInfo, "existing"> {
  const abs = join(DIR, file);
  if (!existsSync(abs)) throw new Error(`missing file: ${abs}`);
  const buf = readFileSync(abs);
  const isPng = buf.subarray(1, 4).toString("ascii") === "PNG";
  const w = isPng ? buf.readUInt32BE(16) : 0;
  const h = isPng ? buf.readUInt32BE(20) : 0;
  if (!isPng || w !== W || h !== H)
    throw new Error(`refusing: ${abs} is ${isPng ? `${w} × ${h}` : "not a PNG"}, expected ${W} × ${H} PNG`);
  return { file, abs, w, h, bytes: statSync(abs).size, sha1: createHash("sha1").update(buf).digest("hex") };
}

async function findAsset(sha1: string) {
  return client.fetch<string | null>(`*[_type == "sanity.imageAsset" && sha1hash == $sha1][0]._id`, { sha1 });
}

async function fileInfo(file: string, size: readonly [number, number]): Promise<FileInfo> {
  const f = readFile(file, size);
  return { ...f, existing: await findAsset(f.sha1) };
}

const TRANSIENT = /ECONNRESET|ETIMEDOUT|EPIPE|ECONNABORTED|EAI_AGAIN|socket hang up|HTTP 408|Request Timeout/i;

async function upload(f: FileInfo): Promise<string> {
  const existing = await findAsset(f.sha1);
  if (existing) {
    console.log(`  = ${f.file} → ${existing} (already in Sanity, no upload)`);
    return existing;
  }
  for (let i = 1; ; i++) {
    try {
      const asset = await client.assets.upload("image", createReadStream(f.abs), { filename: f.file });
      console.log(`  ↑ ${f.file} → ${asset._id}`);
      return asset._id;
    } catch (err) {
      const msg = err instanceof Error ? `${(err as NodeJS.ErrnoException).code ?? ""} ${err.message}` : String(err);
      if (i >= 6 || !TRANSIENT.test(msg)) throw err;
      console.log(`  ↻ ${f.file}: ${msg.trim().slice(0, 120)} — retry ${i}/5`);
      await new Promise((r) => setTimeout(r, 3000 * i));
    }
  }
}

// ---- plan ------------------------------------------------------------------

async function readDoc(): Promise<{ doc: Doc; draft: Doc | null }> {
  const docs = await client.fetch<Doc[]>(`*[_id in $ids]{ _id, _rev, projects }`, {
    ids: [DOC_ID, `drafts.${DOC_ID}`],
  });
  const doc = docs.find((d) => d._id === DOC_ID);
  if (!doc) throw new Error(`${DOC_ID} not found`);
  return { doc, draft: docs.find((d) => d._id === `drafts.${DOC_ID}`) ?? null };
}

const kb = (n: number) => `${Math.round(n / 1024)} KB`;
const ref = (img: Image | null | undefined) => img?.asset?._ref;

async function plan(files: Map<string, FileInfo>, assets: Map<string, string>, log: boolean): Promise<Plan> {
  const say = (s: string) => log && console.log(s);
  const { doc, draft } = await readDoc();
  say(`  ${DOC_ID} rev ${doc._rev}; draft: ${draft ? `YES (drafts.${DOC_ID} rev ${draft._rev})` : "none"}`);
  if (draft)
    throw new Error(
      `refusing: drafts.${DOC_ID} exists (unpublished Studio edits) — publish or discard it in Studio first, else publishing it later would undo this patch`,
    );
  const items = doc.projects ?? [];
  const steps: Step[] = [];
  for (const t of targets) {
    const it = items.find((p) => p._key === t.key);
    if (!it) throw new Error(`refusing: Build Page → Projects has no _key ${t.key} (${t.title})`);
    if (it.id !== t.id || it.title !== t.title)
      throw new Error(`refusing: _key ${t.key} is id ${JSON.stringify(it.id)} / title ${JSON.stringify(it.title)}, expected "${t.id}" / "${t.title}" (Studio edit?)`);
    if (it.hidden) throw new Error(`refusing: ${t.title} is hidden on the site now (Studio edit?)`);

    const art = files.get(t.art)!;
    const out = files.get(t.out)!;
    const newArt = assets.get(t.art) ?? art.existing;
    const newOut = assets.get(t.out) ?? out.existing;

    const curArt = ref(it.popupImage);
    if (curArt && curArt !== newArt)
      throw new Error(`refusing: ${t.title} "Popup image (left panel)" is already ${curArt} (Studio upload?), expected empty`);
    const curOut = ref(it.outputVisual);
    if (curOut !== t.oldOut && !(newOut && curOut === newOut))
      throw new Error(`refusing: ${t.title} "Output visual" is ${curOut ?? "(empty)"}, expected ${t.oldOut} (Studio upload since?)`);
    const unsetOut = ["crop", "hotspot"].filter((k) => it.outputVisual && k in it.outputVisual);
    const step: Step = { t, before: it, art, out, setArt: !curArt, setOut: curOut === t.oldOut, unsetOut };
    steps.push(step);

    const tag = t.placeholder ? "  ⚠ PLACEHOLDER (red in Figma — Israel replaces it later; swap his final files in Studio)" : "";
    say(`\n  ${t.title} (_key ${t.key}, id ${t.id})${tag}`);
    say(
      `    Popup image (left panel)  popupImage    ${curArt ?? "(empty)"} → ${
        step.setArt ? `${t.art} (${art.w} × ${art.h}, ${kb(art.bytes)}; ${art.existing ? `already in Sanity as ${art.existing}` : "new upload"})` : "already set — nothing to do"
      }`,
    );
    const extra = Object.keys(it.outputVisual ?? {}).filter((k) => !["_type", "asset", "crop", "hotspot"].includes(k));
    say(
      `    Output visual             outputVisual  ${curOut ?? "(empty)"} → ${
        step.setOut ? `${t.out} (${out.w} × ${out.h}, ${kb(out.bytes)}; ${out.existing ? `already in Sanity as ${out.existing}` : "new upload"})` : "already set — nothing to do"
      }${unsetOut.length ? `; unset ${unsetOut.join(", ")}` : ""}${extra.length ? `; kept: ${extra.join(", ")}` : ""}`,
    );
  }
  return { rev: doc._rev, steps };
}

// ---- write -----------------------------------------------------------------

type Mutation = { patch: Record<string, unknown> };

function mutations(p: Plan, assets: Map<string, string>): Mutation[] {
  const out: Mutation[] = [];
  for (const s of p.steps) {
    const at = `projects[_key=="${s.t.key}"]`;
    const set: Record<string, unknown> = {};
    if (s.setArt) set[`${at}.popupImage`] = { _type: "image", asset: { _type: "reference", _ref: assets.get(s.t.art)! } };
    if (s.setOut) set[`${at}.outputVisual.asset`] = { _type: "reference", _ref: assets.get(s.t.out)! };
    if (Object.keys(set).length) out.push({ patch: { id: DOC_ID, set } });
    if (s.setOut && s.unsetOut.length) out.push({ patch: { id: DOC_ID, unset: s.unsetOut.map((k) => `${at}.outputVisual.${k}`) } });
  }
  if (out.length) out[0].patch = { ...out[0].patch, ifRevisionID: p.rev };
  return out;
}

async function main() {
  console.log(`patch-build-popup-images-nov25 (${APPLY ? "APPLY" : "DRY — nothing uploaded or written; add -- --apply to write"})`);
  console.log(`  files: ${DIR}`);
  if (ONLY) console.log(`  --only: ${targets.map((t) => t.id).join(", ")}`);

  const files = new Map<string, FileInfo>();
  for (const t of targets) {
    files.set(t.art, await fileInfo(t.art, ART_SIZE));
    files.set(t.out, await fileInfo(t.out, OUT_SIZE));
  }

  const first = await plan(files, new Map(), true);
  const nArt = first.steps.filter((s) => s.setArt).length;
  const nOut = first.steps.filter((s) => s.setOut).length;
  const ups = first.steps.flatMap((s) => [s.setArt && !s.art.existing, s.setOut && !s.out.existing]).filter(Boolean).length;
  const ph = first.steps.filter((s) => s.t.placeholder && (s.setArt || s.setOut)).map((s) => s.t.title);
  console.log(
    `\n${nArt} popup image(s) + ${nOut} output visual(s) to set; ${ups} file(s) to upload${ph.length ? `; placeholders: ${ph.join(", ")}` : ""}`,
  );
  if (!nArt && !nOut) return console.log("nothing to do");
  if (!APPLY)
    return console.log(
      `\ndry run — nothing uploaded or written. To apply:\n  npx sanity exec scripts/patch-build-popup-images-nov25.ts --with-user-token -- --apply${ONLY ? ` --only=${ONLY.join(",")}` : ""}`,
    );

  const assets = new Map<string, string>();
  console.log(`\nuploads:`);
  for (const s of first.steps) {
    if (s.setArt) assets.set(s.t.art, await upload(s.art));
    if (s.setOut) assets.set(s.t.out, await upload(s.out));
  }

  // Re-read right before writing; refuse if anything changed since the plan above.
  const p = await plan(files, assets, false);
  const sig = (x: Plan) => JSON.stringify([x.rev, x.steps.map((s) => [s.before, s.setArt, s.setOut, s.unsetOut])]);
  if (sig(p) !== sig(first)) throw new Error("refusing: the Build page changed while planning / uploading — run again");

  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `build-popup-images-nov25-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(
    file,
    JSON.stringify({ _id: DOC_ID, rev: p.rev, path: "projects", before: p.steps.map((s) => s.before) }, null, 1),
  );
  console.log(`\nbackup → ${file}`);

  const muts = mutations(p, assets);
  const res = await client.mutate(muts as never, { visibility: "sync" });
  console.log(
    `✓ committed ${muts.length} patch(es) in one transaction ${(res as { transactionId?: string }).transactionId ?? ""} at ${new Date().toISOString()}`,
  );

  // Read back: new refs in place, every other key of each item unchanged.
  console.log(`\nread back:`);
  const { doc } = await readDoc();
  let ok = true;
  for (const s of p.steps) {
    const now = (doc.projects ?? []).find((it) => it._key === s.t.key);
    const artOk = !s.setArt || ref(now?.popupImage) === assets.get(s.t.art);
    const outOk = !s.setOut || (ref(now?.outputVisual) === assets.get(s.t.out) && !now?.outputVisual?.crop && !now?.outputVisual?.hotspot);
    const strip = (it: Item | undefined) => {
      const { popupImage: _a, outputVisual: _b, ...rest } = it ?? ({} as Item);
      void _a;
      void _b;
      return rest;
    };
    const restOk = isDeepStrictEqual(strip(now), strip(s.before));
    ok &&= artOk && outOk && restOk;
    console.log(
      `  ${s.t.title}: popupImage ${ref(now?.popupImage)} ${artOk ? "OK" : "WRONG"}; outputVisual ${ref(now?.outputVisual)} ${outOk ? "OK" : "WRONG"}; other fields ${restOk ? "unchanged" : "CHANGED"}${s.t.placeholder ? " (placeholder)" : ""}`,
    );
  }
  console.log(`  ${DOC_ID} rev ${doc._rev}`);
  if (!ok) throw new Error("read-back check failed — see above; restore from the backup");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
