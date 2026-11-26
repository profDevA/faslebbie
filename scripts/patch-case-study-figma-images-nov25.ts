/**
 * Case-study QA hand-over (`docs/meetings/2026-11-24-case-study-qa.md`, the
 * [upload] rows) — Xian, Nov 25: "yes, but I think it's better to upload
 * images". Israel's Figma Final Cleanup (4O6ko9fovLnjtUJotdcgmx) exports,
 * swapped in by asset ref only. NOTE: Fas said on Nov 25 the team would do the
 * case-study uploads themselves — tell Fas these were uploaded.
 *
 *  id                 study / band (section _key)                       field              Figma node    file size
 *  acme-hero-mobile   Acme Lending hero 5ae23b26cfd7                    imageMobile        261:41239     1179 × 2160 (393 × 720 @3x)
 *  dva-hero-desktop   Diamond Valuation AI hero d6e88774d06a            image              614:12626     2878 × 1752 (@2x, right 2 px black column trimmed)
 *  dva-hero-mobile    Diamond Valuation AI hero d6e88774d06a            imageMobile        824:43929     1179 × 2419 (393 × 807 @3x, top 2 px blue line trimmed)
 *  ocl-hero-mobile    OC Links hero 3d21e03895fa                        imageMobile        559:39270     1179 × 2160 (393 × 720 @3x; = 506:34038 pixel for pixel)
 *  miner-vr-journey   Life of a Miner VR "VR Journey" 8f09769d0424      posterImage        1180:39181    3024 × 1888 (screen only, no tan plate; last partial row trimmed)
 *  mint-1 … mint-5    FDX Mint "Core Experience Flow" aee2e6342c7d      previewScreens[k]  242:35612 / 35662 / 35763 / 35821 / 35943
 *                                                                        .image              806 × 1641 each (same phone box + shadow; 4x → 3x)
 *
 * Mint: the five phones are re-cut to one canvas (phone 954 × 2067 @4x + the
 * Figma shadow, 60 / 44 / 77 margins; the shadow the band frame clips on
 * screen 1's left and screen 5's right is mirrored from the other side; screens
 * 4 / 5 — 509 vs 510.8 tall in Figma — scaled 0.3 % to match), so all five
 * draw at the same height with aligned captions (QA X9 / FDE #5). Screen 2 is
 * Israel's corrected one ("Create a savings goal"; live repeated "Set up
 * budgets", FDE #6). Each screen is matched by `_key` AND its label. Their
 * "Display width / height" fields (761 × 1641 …) are left as they are (in the
 * mobile row they only switch on the full-frame drawing).
 *
 * Not in this script (Nov 25): Circle `DA_MV_Hero` 51:155386 — the live phone
 * hero is already that frame (`DA_MV_Hero.Jpg.png`, Sep 23, 1572 × 3228);
 * Vuforia Editor posters 194:21695 / 717:56822 — both frames carry a
 * translucent play triangle ("Polygon 16") and an opaque shadow plate, and the
 * bands have no video (CLAUDE.md: no PLAY overlays) — Xian / Israel decide.
 *
 * Each target must still hold the asset it had on Nov 25 (or already the new
 * one), else it refuses (a Studio upload since). Refuses if any target study
 * has a draft. Only the asset reference changes; `crop` is unset if present
 * (the new files have other proportions); hotspot and other keys are kept.
 * Re-reads right before writing (refuses if anything changed since the plan),
 * backs the target sections up to ../exports/sanity-backups/, writes one patch
 * per document in one transaction (`ifRevisionID` on each), then reads back.
 *
 * DRY BY DEFAULT: plans only, uploads nothing (it looks each file up by sha1).
 * `-- --apply` uploads and writes. Uploads reuse an asset with the same sha1
 * and retry a dropped connection; re-run after apply = "already set".
 * Options: `-- --only=acme-hero-mobile,mint-2` (ids above; `mint` = all five),
 * `-- --dir=<folder>` (default ../exports/case-study-figma-2026-11-25/).
 * Undo: pick the old image in Studio, or restore from the backup.
 *
 *   npx sanity exec scripts/patch-case-study-figma-images-nov25.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-case-study-figma-images-nov25.ts --with-user-token -- --apply
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
    join(process.cwd(), "..", "exports", "case-study-figma-2026-11-25"),
);
const ONLY_RAW = process.argv
  .find((a) => a.startsWith("--only="))
  ?.slice("--only=".length)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

type Target = {
  id: string;
  doc: string;
  /** Section `_key` and `_type`. */
  section: string;
  type: string;
  /** Image field on the section, or `previewScreens` for a CE screen. */
  field: "image" | "imageMobile" | "posterImage" | "previewScreens";
  /** CE screen `_key` + its label (both must match). */
  screen?: { key: string; label: string };
  /** Expected section title (optional pin). */
  title?: string;
  file: string;
  size: readonly [number, number];
  /** Asset on Nov 25, before this patch. */
  oldAsset: string;
  what: string;
};

const MINT = { w: 806, h: 1641 } as const;
const mint = (n: number, key: string, label: string, node: string, oldAsset: string): Target => ({
  id: `mint-${n}`,
  doc: "cs-financial-data-exchange",
  section: "aee2e6342c7d",
  type: "coreExperience",
  field: "previewScreens",
  screen: { key, label },
  title: "Core Experience Flow",
  file: `financial-data-exchange-mint-ce-${n}-${node}@3x.png`,
  size: [MINT.w, MINT.h],
  oldAsset,
  what: `FDX Mint CE screen ${n} "${label}"`,
});

const TARGETS: Target[] = [
  {
    id: "acme-hero-mobile",
    doc: "cs-acme-lending",
    section: "5ae23b26cfd7",
    type: "heroSection",
    field: "imageMobile",
    file: "acme-lending-hero-mobile-261-41239@3x.png",
    size: [1179, 2160],
    oldAsset: "image-4f3ea9e467a015d7ec8b74000ab67819a735afaf-1179x2421-png",
    what: "Acme Lending hero (mobile)",
  },
  {
    id: "dva-hero-desktop",
    doc: "cs-diamond-valuation-ai",
    section: "d6e88774d06a",
    type: "heroSection",
    field: "image",
    file: "diamond-valuation-ai-hero-desktop-614-12626@2x.png",
    size: [2878, 1752],
    oldAsset: "image-16ee39d3043e4fab289f655267ba6ed2e4d602cd-5760x3504-png",
    what: "Diamond Valuation AI hero (desktop)",
  },
  {
    id: "dva-hero-mobile",
    doc: "cs-diamond-valuation-ai",
    section: "d6e88774d06a",
    type: "heroSection",
    field: "imageMobile",
    file: "diamond-valuation-ai-hero-mobile-824-43929@3x.png",
    size: [1179, 2419],
    oldAsset: "image-db86fe76c286bf9a75d315c874519fb444c54c2d-1179x2421-png",
    what: "Diamond Valuation AI hero (mobile)",
  },
  {
    id: "ocl-hero-mobile",
    doc: "cs-oc-links",
    section: "3d21e03895fa",
    type: "heroSection",
    field: "imageMobile",
    file: "oc-links-hero-mobile-559-39270@3x.png",
    size: [1179, 2160],
    oldAsset: "image-416425ea9db928a0b6553fef7463c5d8899fd33c-1179x2160-png",
    what: "OC Links hero (mobile)",
  },
  {
    id: "miner-vr-journey",
    doc: "cs-life-of-a-miner-vr",
    section: "8f09769d0424",
    type: "desktopMotionShowcase",
    field: "posterImage",
    title: "VR Journey",
    file: "life-of-a-miner-vr-vr-journey-1180-39181@3x.png",
    size: [3024, 1888],
    oldAsset: "image-5bac6ef4f412e438976b0aa6e6c6925267cc8951-2336x1619-png",
    what: "Life of a Miner VR — VR Journey image",
  },
  mint(1, "6e995fc8c1cd", "Access Your Account:", "242-35612", "image-908fe6b79aac38347efce30bced1983de57888cf-761x1641-png"),
  mint(2, "3eeb9edf8583", "Start Account Linking:", "242-35662", "image-4b63e3a65750efe4a2ef1b6fc3bdcea2e0d959ff-806x1641-png"),
  mint(3, "552aee5d63eb", "Choose How to Connect:", "242-35763", "image-c825dd5ce5259a69e07a93c680ebabba2a75d5f7-806x1641-png"),
  mint(4, "da0ebd443155", "Select Your Bank:", "242-35821", "image-8b0ce2942c6e46094fc0d356263c41227d40bf69-807x1635-png"),
  mint(5, "ee683bf48d5b", "Establish a Secure Connection:", "242-35943", "image-b9dea2aa226089f9ad8f2326bffb4dec125d9e30-771x1635-png"),
];

const ONLY = ONLY_RAW?.flatMap((id) => (id === "mint" ? TARGETS.filter((t) => t.id.startsWith("mint-")).map((t) => t.id) : [id]));
if (ONLY) {
  const unknown = ONLY.filter((id) => !TARGETS.some((t) => t.id === id));
  if (unknown.length) throw new Error(`--only: unknown id(s) ${unknown.join(", ")} (known: ${TARGETS.map((t) => t.id).join(", ")}, mint)`);
}
const targets = ONLY ? TARGETS.filter((t) => ONLY.includes(t.id)) : TARGETS;

type Image = { _type?: string; asset?: { _ref?: string }; crop?: unknown; hotspot?: unknown } & Record<string, unknown>;
type Screen = { _key: string; label?: string; image?: Image | null } & Record<string, unknown>;
type Section = { _key: string; _type: string; sectionTitle?: string; previewScreens?: Screen[] } & Record<string, unknown>;
type Doc = { _id: string; _rev: string; sections?: Section[] };
type FileInfo = { file: string; abs: string; w: number; h: number; bytes: number; sha1: string; existing: string | null };
type Step = { t: Target; path: string; cur: Image | null; set: boolean; unsetCrop: boolean; section: Section };
type Plan = { revs: Map<string, string>; steps: Step[] };

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

const docIds = [...new Set(targets.map((t) => t.doc))];

async function readDocs(): Promise<Map<string, Doc>> {
  const docs = await client.fetch<Doc[]>(`*[_id in $ids]{ _id, _rev, sections }`, {
    ids: [...docIds, ...docIds.map((id) => `drafts.${id}`)],
  });
  const drafts = docs.filter((d) => d._id.startsWith("drafts."));
  if (drafts.length)
    throw new Error(
      `refusing: unpublished Studio edits in ${drafts.map((d) => d._id).join(", ")} — publish or discard them first, else publishing them later would undo this patch`,
    );
  const map = new Map(docs.map((d) => [d._id, d]));
  for (const id of docIds) if (!map.has(id)) throw new Error(`refusing: ${id} not found`);
  return map;
}

const kb = (n: number) => `${Math.round(n / 1024)} KB`;
const ref = (img: Image | null | undefined) => img?.asset?._ref;

function locate(t: Target, doc: Doc): { section: Section; img: Image | null; path: string } {
  const section = (doc.sections ?? []).find((s) => s._key === t.section);
  if (!section) throw new Error(`refusing: ${t.doc} has no section _key ${t.section} (${t.what})`);
  if (section._type !== t.type) throw new Error(`refusing: ${t.doc} ${t.section} is ${section._type}, expected ${t.type}`);
  if (t.title && section.sectionTitle !== t.title)
    throw new Error(`refusing: ${t.doc} ${t.section} title is ${JSON.stringify(section.sectionTitle)}, expected "${t.title}"`);
  const at = `sections[_key=="${t.section}"]`;
  if (t.field !== "previewScreens") return { section, img: (section[t.field] as Image | null) ?? null, path: `${at}.${t.field}` };
  const sc = (section.previewScreens ?? []).find((s) => s._key === t.screen!.key);
  if (!sc) throw new Error(`refusing: ${t.doc} ${t.section} has no screen _key ${t.screen!.key} (${t.screen!.label})`);
  if (sc.label !== t.screen!.label)
    throw new Error(`refusing: screen ${t.screen!.key} label is ${JSON.stringify(sc.label)}, expected "${t.screen!.label}" (Studio edit?)`);
  return { section, img: sc.image ?? null, path: `${at}.previewScreens[_key=="${t.screen!.key}"].image` };
}

async function plan(files: Map<string, FileInfo>, assets: Map<string, string>, log: boolean): Promise<Plan> {
  const say = (s: string) => log && console.log(s);
  const docs = await readDocs();
  for (const id of docIds) say(`  ${id} rev ${docs.get(id)!._rev}`);
  const steps: Step[] = [];
  for (const t of targets) {
    const { section, img, path } = locate(t, docs.get(t.doc)!);
    const f = files.get(t.id)!;
    const next = assets.get(t.id) ?? f.existing;
    const cur = ref(img);
    if (cur !== t.oldAsset && !(next && cur === next))
      throw new Error(`refusing: ${t.what} is ${cur ?? "(empty)"}, expected ${t.oldAsset} (Studio upload since?)`);
    const set = cur === t.oldAsset;
    const unsetCrop = set && !!img && "crop" in img;
    steps.push({ t, path, cur: img, set, unsetCrop, section });
    const kept = Object.keys(img ?? {}).filter((k) => !["_type", "asset", "crop"].includes(k));
    say(`\n  [${t.id}] ${t.what}  (${t.doc}, ${path})`);
    say(
      `    ${cur ?? "(empty)"} → ${
        set ? `${t.file} (${f.w} × ${f.h}, ${kb(f.bytes)}; ${f.existing ? `already in Sanity as ${f.existing}` : "new upload"})` : "already set — nothing to do"
      }${unsetCrop ? "; unset crop" : ""}${kept.length ? `; kept: ${kept.join(", ")}` : ""}`,
    );
  }
  return { revs: new Map(docIds.map((id) => [id, docs.get(id)!._rev])), steps };
}

// ---- write -----------------------------------------------------------------

type Mutation = { patch: Record<string, unknown> };

function mutations(p: Plan, assets: Map<string, string>): Mutation[] {
  const out: Mutation[] = [];
  for (const id of docIds) {
    const set: Record<string, unknown> = {};
    const unset: string[] = [];
    for (const s of p.steps.filter((x) => x.t.doc === id && x.set)) {
      const asset = { _type: "reference", _ref: assets.get(s.t.id)! };
      if (s.cur) set[`${s.path}.asset`] = asset;
      else set[s.path] = { _type: "image", asset };
      if (s.unsetCrop) unset.push(`${s.path}.crop`);
    }
    if (!Object.keys(set).length) continue;
    out.push({ patch: { id, ifRevisionID: p.revs.get(id), set, ...(unset.length ? { unset } : {}) } });
  }
  return out;
}

async function main() {
  console.log(`patch-case-study-figma-images-nov25 (${APPLY ? "APPLY" : "DRY — nothing uploaded or written; add -- --apply to write"})`);
  console.log(`  files: ${DIR}`);
  if (ONLY) console.log(`  --only: ${targets.map((t) => t.id).join(", ")}`);

  const files = new Map<string, FileInfo>();
  for (const t of targets) {
    const f = readFile(t.file, t.size);
    files.set(t.id, { ...f, existing: await findAsset(f.sha1) });
  }

  const first = await plan(files, new Map(), true);
  const todo = first.steps.filter((s) => s.set);
  const ups = todo.filter((s) => !files.get(s.t.id)!.existing).length;
  console.log(`\n${todo.length} image field(s) to set in ${new Set(todo.map((s) => s.t.doc)).size} document(s); ${ups} file(s) to upload`);
  if (!todo.length) return console.log("nothing to do");
  if (!APPLY)
    return console.log(
      `\ndry run — nothing uploaded or written. To apply:\n  npx sanity exec scripts/patch-case-study-figma-images-nov25.ts --with-user-token -- --apply${ONLY_RAW ? ` --only=${ONLY_RAW.join(",")}` : ""}`,
    );

  const assets = new Map<string, string>();
  console.log(`\nuploads:`);
  for (const s of todo) assets.set(s.t.id, await upload(files.get(s.t.id)!));

  // Re-read right before writing; refuse if anything changed since the plan above.
  const p = await plan(files, assets, false);
  const sig = (x: Plan) => JSON.stringify([[...x.revs], x.steps.map((s) => [s.t.id, s.cur, s.set, s.unsetCrop])]);
  if (sig(p) !== sig(first)) throw new Error("refusing: a target document changed while planning / uploading — run again");

  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `case-study-figma-images-nov25-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  const before = docIds.map((id) => ({
    _id: id,
    rev: p.revs.get(id),
    sections: [...new Map(p.steps.filter((s) => s.t.doc === id).map((s) => [s.section._key, s.section])).values()],
    fields: p.steps.filter((s) => s.t.doc === id).map((s) => ({ id: s.t.id, path: s.path, before: s.cur })),
  }));
  writeFileSync(file, JSON.stringify(before, null, 1));
  console.log(`\nbackup → ${file}`);

  const muts = mutations(p, assets);
  const res = await client.mutate(muts as never, { visibility: "sync" });
  console.log(
    `✓ committed ${muts.length} patch(es) in one transaction ${(res as { transactionId?: string }).transactionId ?? ""} at ${new Date().toISOString()}`,
  );

  // Read back: new refs in place, every other key of each touched section unchanged.
  console.log(`\nread back:`);
  const docs = await readDocs();
  let ok = true;
  const strip = (sec: Section | undefined, t: Target[]) => {
    const copy = JSON.parse(JSON.stringify(sec ?? {})) as Section;
    for (const x of t) {
      const img =
        x.field === "previewScreens"
          ? copy.previewScreens?.find((s) => s._key === x.screen!.key)?.image
          : (copy[x.field] as Image | undefined);
      if (img) {
        delete img.asset;
        delete img.crop;
      }
    }
    return copy;
  };
  for (const s of p.steps) {
    const { img } = locate(s.t, docs.get(s.t.doc)!);
    const good = ref(img) === (assets.get(s.t.id) ?? ref(s.cur)) && !(img && "crop" in img && s.set);
    ok &&= good;
    console.log(`  [${s.t.id}] ${ref(img)} ${good ? "OK" : "WRONG"}`);
  }
  for (const id of docIds) {
    const ts = p.steps.filter((s) => s.t.doc === id).map((s) => s.t);
    for (const key of new Set(ts.map((t) => t.section))) {
      const was = p.steps.find((s) => s.t.doc === id && s.t.section === key)!.section;
      const now = docs.get(id)!.sections?.find((s) => s._key === key);
      const same = isDeepStrictEqual(strip(now, ts.filter((t) => t.section === key)), strip(was, ts.filter((t) => t.section === key)));
      ok &&= same;
      console.log(`  ${id} ${key}: other fields ${same ? "unchanged" : "CHANGED"}; rev ${docs.get(id)!._rev}`);
    }
  }
  if (!ok) throw new Error("read-back check failed — see above; restore from the backup");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
