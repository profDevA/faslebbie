/**
 * Remove the 34 leftover "Unknown field" values found by the Nov 26 read-only
 * scan (compiled Studio schema vs every document). None of them is read by the
 * site code; Studio shows them as "Unknown field" warnings and
 * `npx sanity documents validate` lists them.
 *
 *  - cs-coral-health: hero `appearance` (null, removed from heroSection
 *    2026-08-28), root `fullCaseStudyPdf` (799-byte test PDF) and
 *    `fullCaseStudyLabel` (schema + code removed 2026-10-20, afbd04a).
 *  - cs-vuforia-chalk: root `fullCaseStudyLabel` (copy of its tagline).
 *  - buildPage: the legacy `description` / `howItWorks` / `note` /
 *    `supportedTools` on the 7 `projects[]` items (moved to caseStudyDetail
 *    2026-08-27, be345f6) — 27 values. `caseStudyDetail.howItWorks` is the
 *    current field and is NOT touched.
 *  - cs-snapback-lifestyle: Design Interventions (`ad1837b4457b`,
 *    desktopMotionShowcase) `titleMarginBottom` / `titleMarginBottomDesktop` /
 *    `introMarginBottom`, carried over from motionShowcase.
 *
 * Do NOT use patch-coral-unset-section-orphans.ts or
 * patch-build-strip-legacy-fields.ts for this: their old whitelists would
 * delete current fields.
 *
 * Safety: the 34 paths (array items by `_key`) and their scanned values are
 * pinned below. The run compiles the Studio schema (schemaTypes + the
 * color-input plugin, as in sanity.config.ts) and walks the 4 published
 * documents with the scan's rule (a key not starting with "_" that is not a
 * field of its schema type). It refuses unless the unknown fields it finds are
 * exactly these 34, each still holding its scanned value (same 160-character
 * JSON preview). Published documents only; a draft / release version is
 * reported and left alone. Re-reads right before writing (refuses if a
 * revision moved), writes a full JSON backup of the 4 documents to
 * ../exports/sanity-backups/, then one transaction with one `unset` per
 * document and `ifRevisionID`. Reads back: the 34 paths must be gone and every
 * other field identical (deep compare, `_rev` / `_updatedAt` excluded).
 *
 * Plan only by default (or `-- --dry`); write with `-- --apply`.
 *   npx sanity exec scripts/patch-unset-unknown-fields-nov26.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-unset-unknown-fields-nov26.ts --with-user-token -- --apply
 *
 * Don't re-run without a new scan: after the apply it refuses (the paths are
 * gone). Undo = the values in the backup JSON.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { isDeepStrictEqual } from "node:util";

import { colorInput } from "@sanity/color-input";
import { createSchema } from "sanity";

import { schemaTypes } from "../sanity/schemaTypes";
import { BACKUPS, client as cliClient } from "./lib/structure-nov11";

const client = cliClient.withConfig({ perspective: "raw", useCdn: false });
const APPLY = process.argv.includes("--apply");
const DRY = process.argv.includes("--dry") || !APPLY;

const DOC_IDS = ["cs-coral-health", "cs-vuforia-chalk", "buildPage", "cs-snapback-lifestyle"];

type Expected = { docId: string; path: string; containerType: string; valueClass: string; value: string };

/** The scan's findings (unknown-fields.csv, Nov 26 06:27 UTC): path + 160-char JSON preview. */
const EXPECTED: Expected[] = [
  { docId: "buildPage", path: 'projects[_key=="9b357b42ba9d"].description', containerType: "buildProjectItem", valueClass: "data", value: "\"Prompt Annotations is a Figma plugin that captures your vibe-coding chat transcript and places a structured annotation frame next to your design in the file. I…" },
  { docId: "buildPage", path: 'projects[_key=="9b357b42ba9d"].howItWorks', containerType: "buildProjectItem", valueClass: "data", value: "[\"Finish your session in Cursor, V0, Bolt, Lovable, or Claude.ai.\",\"Paste or upload your transcript into the plugin.\",\"A structured annotation frame appears nex…" },
  { docId: "buildPage", path: 'projects[_key=="9b357b42ba9d"].note', containerType: "buildProjectItem", valueClass: "data", value: "\"An API key for Claude or ChatGPT enables an AI-generated summary of what was built. The plugin works without one.\"" },
  { docId: "buildPage", path: 'projects[_key=="9b357b42ba9d"].supportedTools', containerType: "buildProjectItem", valueClass: "data", value: "[\"Cursor\",\"V0\",\"Bolt\",\"Lovable\",\"Claude.ai\",\"Terminal\"]" },
  { docId: "buildPage", path: 'projects[_key=="44363ee47db5"].description', containerType: "buildProjectItem", valueClass: "data", value: "\"Prompt Annotations is a Figma plugin that captures your vibe-coding chat transcript and places a structured annotation frame next to your design in the file. I…" },
  { docId: "buildPage", path: 'projects[_key=="44363ee47db5"].howItWorks', containerType: "buildProjectItem", valueClass: "data", value: "[\"Finish your session in Cursor, V0, Bolt, Lovable, or Claude.ai.\",\"Paste or upload your transcript into the plugin.\",\"A structured annotation frame appears nex…" },
  { docId: "buildPage", path: 'projects[_key=="44363ee47db5"].note', containerType: "buildProjectItem", valueClass: "data", value: "\"An API key for Claude or ChatGPT enables an AI-generated summary of what was built. The plugin works without one.\"" },
  { docId: "buildPage", path: 'projects[_key=="44363ee47db5"].supportedTools', containerType: "buildProjectItem", valueClass: "data", value: "[\"Cursor\",\"V0\",\"Bolt\",\"Lovable\",\"Claude.ai\",\"Terminal\"]" },
  { docId: "buildPage", path: 'projects[_key=="503a3aad2d82"].description', containerType: "buildProjectItem", valueClass: "data", value: "\"Prompt Annotations is a Figma plugin that captures your vibe-coding chat transcript and places a structured annotation frame next to your design in the file. I…" },
  { docId: "buildPage", path: 'projects[_key=="503a3aad2d82"].howItWorks', containerType: "buildProjectItem", valueClass: "data", value: "[\"Finish your session in Cursor, V0, Bolt, Lovable, or Claude.ai.\",\"Paste or upload your transcript into the plugin.\",\"A structured annotation frame appears nex…" },
  { docId: "buildPage", path: 'projects[_key=="503a3aad2d82"].note', containerType: "buildProjectItem", valueClass: "data", value: "\"An API key for Claude or ChatGPT enables an AI-generated summary of what was built. The plugin works without one.\"" },
  { docId: "buildPage", path: 'projects[_key=="503a3aad2d82"].supportedTools', containerType: "buildProjectItem", valueClass: "data", value: "[\"Cursor\",\"V0\",\"Bolt\",\"Lovable\",\"Claude.ai\",\"Terminal\"]" },
  { docId: "buildPage", path: 'projects[_key=="d864e31b64db"].description', containerType: "buildProjectItem", valueClass: "data", value: "\"Prompt Annotations is a Figma plugin that captures your vibe-coding chat transcript and places a structured annotation frame next to your design in the file. I…" },
  { docId: "buildPage", path: 'projects[_key=="d864e31b64db"].howItWorks', containerType: "buildProjectItem", valueClass: "data", value: "[\"Finish your session in Cursor, V0, Bolt, Lovable, or Claude.ai.\",\"Paste or upload your transcript into the plugin.\",\"A structured annotation frame appears nex…" },
  { docId: "buildPage", path: 'projects[_key=="d864e31b64db"].note', containerType: "buildProjectItem", valueClass: "data", value: "\"An API key for Claude or ChatGPT enables an AI-generated summary of what was built. The plugin works without one.\"" },
  { docId: "buildPage", path: 'projects[_key=="d864e31b64db"].supportedTools', containerType: "buildProjectItem", valueClass: "data", value: "[\"Cursor\",\"V0\",\"Bolt\",\"Lovable\",\"Claude.ai\",\"Terminal\"]" },
  { docId: "buildPage", path: 'projects[_key=="d60fc0809510"].description', containerType: "buildProjectItem", valueClass: "data", value: "\"Prompt Annotations is a Figma plugin that captures your vibe-coding chat transcript and places a structured annotation frame next to your design in the file. I…" },
  { docId: "buildPage", path: 'projects[_key=="d60fc0809510"].howItWorks', containerType: "buildProjectItem", valueClass: "data", value: "[\"Finish your session in Cursor, V0, Bolt, Lovable, or Claude.ai.\",\"Paste or upload your transcript into the plugin.\",\"A structured annotation frame appears nex…" },
  { docId: "buildPage", path: 'projects[_key=="d60fc0809510"].note', containerType: "buildProjectItem", valueClass: "data", value: "\"An API key for Claude or ChatGPT enables an AI-generated summary of what was built. The plugin works without one.\"" },
  { docId: "buildPage", path: 'projects[_key=="d60fc0809510"].supportedTools', containerType: "buildProjectItem", valueClass: "data", value: "[\"Cursor\",\"V0\",\"Bolt\",\"Lovable\",\"Claude.ai\",\"Terminal\"]" },
  { docId: "buildPage", path: 'projects[_key=="f71622e79345"].description', containerType: "buildProjectItem", valueClass: "data", value: "\"Prompt Annotations is a Figma plugin that captures your vibe-coding chat transcript and places a structured annotation frame next to your design in the file. I…" },
  { docId: "buildPage", path: 'projects[_key=="f71622e79345"].howItWorks', containerType: "buildProjectItem", valueClass: "data", value: "[\"Finish your session in Cursor, V0, Bolt, Lovable, or Claude.ai.\",\"Paste or upload your transcript into the plugin.\",\"A structured annotation frame appears nex…" },
  { docId: "buildPage", path: 'projects[_key=="f71622e79345"].note', containerType: "buildProjectItem", valueClass: "data", value: "\"An API key for Claude or ChatGPT enables an AI-generated summary of what was built. The plugin works without one.\"" },
  { docId: "buildPage", path: 'projects[_key=="f71622e79345"].supportedTools', containerType: "buildProjectItem", valueClass: "data", value: "[\"Cursor\",\"V0\",\"Bolt\",\"Lovable\",\"Claude.ai\",\"Terminal\"]" },
  { docId: "buildPage", path: 'projects[_key=="6d86d23d4110"].description', containerType: "buildProjectItem", valueClass: "data", value: "\"SenseSpace AI maps design research methods to AI capabilities so teams can move from raw interview data to structured insight faster.\"" },
  { docId: "buildPage", path: 'projects[_key=="6d86d23d4110"].howItWorks', containerType: "buildProjectItem", valueClass: "data", value: "[\"Upload or paste research transcripts and field notes.\",\"The taxonomy tags methods, themes, and gaps against your study goals.\",\"Export synthesis frames your t…" },
  { docId: "buildPage", path: 'projects[_key=="6d86d23d4110"].supportedTools', containerType: "buildProjectItem", valueClass: "data", value: "[\"Claude\",\"GPT\",\"Figma\"]" },
  { docId: "cs-coral-health", path: "fullCaseStudyLabel", containerType: "caseStudy", valueClass: "data", value: "\"Read the Full Case Study\"" },
  { docId: "cs-coral-health", path: "fullCaseStudyPdf", containerType: "caseStudy", valueClass: "data", value: "{\"_type\":\"file\",\"asset\":{\"_ref\":\"file-da3621e5b1df79d5c8fa33c4804326f3411a1d3b-pdf\",\"_type\":\"reference\"}}" },
  { docId: "cs-coral-health", path: 'sections[_key=="2e86cad1a2bf"].appearance', containerType: "heroSection", valueClass: "null", value: "null" },
  { docId: "cs-snapback-lifestyle", path: 'sections[_key=="ad1837b4457b"].introMarginBottom', containerType: "desktopMotionShowcase", valueClass: "data", value: "40" },
  { docId: "cs-snapback-lifestyle", path: 'sections[_key=="ad1837b4457b"].titleMarginBottom', containerType: "desktopMotionShowcase", valueClass: "data", value: "40" },
  { docId: "cs-snapback-lifestyle", path: 'sections[_key=="ad1837b4457b"].titleMarginBottomDesktop', containerType: "desktopMotionShowcase", valueClass: "data", value: "56" },
  { docId: "cs-vuforia-chalk", path: "fullCaseStudyLabel", containerType: "caseStudy", valueClass: "data", value: "\"One AR platform, two distinct device physics.\"" },
];

// ---------------------------------------------------------------------------
// Schema walk — the scan's rule (scratch scan.ts, Nov 26).

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyType = any;
type Doc = { _id: string; _rev: string; _type: string } & Record<string, any>;
type Finding = { docId: string; path: string; field: string; containerType: string; valueClass: string; value: string };

function jsonPreview(v: unknown, n = 160) {
  let s: string;
  try {
    s = JSON.stringify(v);
  } catch {
    s = String(v);
  }
  if (s === undefined) s = "undefined";
  return s.length > n ? s.slice(0, n) + "…" : s;
}

function classify(v: unknown): "null" | "empty" | "data" {
  if (v === null || v === undefined) return "null";
  if (typeof v === "string") return v.trim() === "" ? "empty" : "data";
  if (Array.isArray(v)) return v.every((x) => classify(x) !== "data") ? "empty" : "data";
  if (typeof v === "object") {
    const keys = Object.keys(v as object).filter((k) => k !== "_type" && k !== "_key");
    return keys.every((k) => classify((v as any)[k]) !== "data") ? "empty" : "data";
  }
  return "data";
}

const pluginTypes: any[] = ((colorInput() as any)?.schema?.types ?? []) as any[];
const schema: any = createSchema({ name: "default", types: [...pluginTypes, ...schemaTypes] });

function unknownFields(doc: Doc): Finding[] {
  const out: Finding[] = [];
  const seg = (parent: string, key: string) => (parent ? `${parent}.${key}` : key);
  function walk(value: any, t: AnyType, p: string) {
    if (value === null || value === undefined || !t) return;
    if (t.jsonType === "object") {
      if (typeof value !== "object" || Array.isArray(value)) return;
      const known = new Map((t.fields ?? []).map((f: any) => [f.name, f]));
      for (const key of Object.keys(value)) {
        if (key.startsWith("_")) continue;
        const f: any = known.get(key);
        if (!f) {
          out.push({
            docId: doc._id,
            path: seg(p, key),
            field: key,
            containerType: value._type ?? `(${t.name})`,
            valueClass: classify(value[key]),
            value: jsonPreview(value[key]),
          });
          continue;
        }
        walk(value[key], f.type, seg(p, key));
      }
      return;
    }
    if (t.jsonType === "array") {
      if (!Array.isArray(value)) return;
      const of: any[] = t.of ?? [];
      value.forEach((item: any, i: number) => {
        const ip = item && typeof item === "object" && item._key ? `${p}[_key=="${item._key}"]` : `${p}[${i}]`;
        if (!item || typeof item !== "object" || Array.isArray(item)) return;
        let mt = item._type ? of.find((o) => o.name === item._type) : undefined;
        if (!item._type) {
          const objMembers = of.filter((o) => o.jsonType === "object");
          if (objMembers.length === 1) mt = objMembers[0];
        } else if (!mt) {
          mt = schema.get(item._type);
        }
        if (mt) walk(item, mt, ip);
      });
    }
  }
  const t = schema.get(doc._type);
  if (!t) throw new Error(`refusing: ${doc._id} has type ${doc._type}, which the compiled schema doesn't know`);
  walk(doc, t, "");
  return out;
}

// ---------------------------------------------------------------------------
// Local path removal (for the plan and the byte-for-byte read-back compare).

function parsePath(path: string) {
  return path.split(".").map((s) => {
    const m = s.match(/^(\w+)(?:\[_key=="([^"]+)"\])?$/);
    if (!m) throw new Error(`unsupported path segment "${s}" in ${path}`);
    return { field: m[1], key: m[2] as string | undefined };
  });
}

function removePath(root: any, path: string) {
  const segs = parsePath(path);
  let node = root;
  for (let i = 0; i < segs.length - 1; i++) {
    const { field, key } = segs[i];
    node = node?.[field];
    if (key !== undefined) node = Array.isArray(node) ? node.find((x: any) => x?._key === key) : undefined;
    if (!node || typeof node !== "object") throw new Error(`path not found: ${path}`);
  }
  const last = segs[segs.length - 1];
  if (last.key !== undefined || !Object.prototype.hasOwnProperty.call(node, last.field))
    throw new Error(`path not found: ${path}`);
  delete node[last.field];
}

/** Sorted-key JSON without `_rev` / `_updatedAt`, for an exact compare. */
function canonical(doc: Doc) {
  const sort = (v: any): any =>
    Array.isArray(v)
      ? v.map(sort)
      : v && typeof v === "object"
        ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, sort(v[k])]))
        : v;
  const { _rev, _updatedAt, ...rest } = doc;
  void _rev;
  void _updatedAt;
  return JSON.stringify(sort(rest));
}

// ---------------------------------------------------------------------------

async function readAll() {
  const ids = [...DOC_IDS, ...DOC_IDS.map((id) => `drafts.${id}`)];
  const docs = await client.fetch<Doc[]>(`*[_id in $ids]`, { ids });
  const versions = await client.fetch<{ _id: string; _rev: string }[]>(`*[_id in path("versions.**")]{_id, _rev}`);
  const published = new Map(docs.filter((d) => !d._id.startsWith("drafts.")).map((d) => [d._id, d]));
  const others = [
    ...docs.filter((d) => d._id.startsWith("drafts.")).map((d) => ({ _id: d._id, _rev: d._rev, doc: d as Doc | undefined })),
    ...versions
      .filter((v) => DOC_IDS.some((id) => v._id.endsWith(`.${id}`)))
      .map((v) => ({ _id: v._id, _rev: v._rev, doc: undefined as Doc | undefined })),
  ];
  return { published, others };
}

type Plan = { docs: Map<string, Doc>; paths: Map<string, string[]>; problems: string[] };

function plan(published: Map<string, Doc>): Plan {
  const problems: string[] = [];
  const paths = new Map<string, string[]>();
  for (const id of DOC_IDS) {
    const doc = published.get(id);
    if (!doc) {
      problems.push(`${id}: published document not found`);
      continue;
    }
    const found = unknownFields(doc);
    const exp = EXPECTED.filter((e) => e.docId === id);
    const foundBy = new Map(found.map((f) => [f.path, f]));
    const expBy = new Map(exp.map((e) => [e.path, e]));
    for (const e of exp) {
      const f = foundBy.get(e.path);
      if (!f) {
        problems.push(`${id} ${e.path}: no longer an unknown field (gone, or now in the schema)`);
        continue;
      }
      if (f.containerType !== e.containerType) problems.push(`${id} ${e.path}: container is ${f.containerType}, scanned ${e.containerType}`);
      if (f.valueClass !== e.valueClass || f.value !== e.value)
        problems.push(`${id} ${e.path}: value changed — now ${f.value}, scanned ${e.value}`);
    }
    for (const f of found)
      if (!expBy.has(f.path)) problems.push(`${id} ${f.path}: unknown field not in the approved 34 (${f.value}) — not removed`);
    paths.set(id, exp.map((e) => e.path));
  }
  return { docs: published, paths, problems };
}

async function main() {
  console.log(`mode: ${DRY ? "dry run (plan only)" : "APPLY"}`);
  if (EXPECTED.length !== 34) throw new Error(`internal: expected list has ${EXPECTED.length} paths, not 34`);

  const first = await readAll();
  const p = plan(first.published);

  console.log(`\nplan — unset ${EXPECTED.length} paths in ${DOC_IDS.length} published documents:`);
  for (const id of DOC_IDS) {
    const doc = first.published.get(id);
    console.log(`\n  ${id} (rev ${doc?._rev ?? "—"}) — ${p.paths.get(id)?.length ?? 0} path(s)`);
    for (const path of p.paths.get(id) ?? []) {
      const e = EXPECTED.find((x) => x.docId === id && x.path === path)!;
      console.log(`    - ${path} = ${e.value.length > 90 ? e.value.slice(0, 90) + "…" : e.value}`);
    }
  }

  // Build page: the current caseStudyDetail.howItWorks stays.
  const build = first.published.get("buildPage");
  if (build) {
    const kept = (build.projects ?? []).map(
      (it: any) => `${it.id ?? it._key}: caseStudyDetail.howItWorks ${Array.isArray(it.caseStudyDetail?.howItWorks) ? it.caseStudyDetail.howItWorks.length : "—"} step(s)`,
    );
    console.log(`\n  kept (not touched) on buildPage: ${kept.join("; ")}`);
  }

  if (first.others.length)
    console.log(`\ndrafts / versions found (left alone — publishing one would bring its fields back):\n${first.others.map((o) => `  ${o._id} rev ${o._rev}${o.doc ? ` — its unknown fields: ${unknownFields(o.doc).length}` : ""}`).join("\n")}`);
  else console.log(`\ndrafts / versions of these 4 documents: none`);

  // Local dry apply: removing the paths must leave 0 unknown fields and touch nothing else.
  for (const id of DOC_IDS) {
    const doc = first.published.get(id);
    if (!doc) continue;
    const after = structuredClone(doc);
    for (const path of p.paths.get(id) ?? []) {
      try {
        removePath(after, path);
      } catch (err) {
        p.problems.push(`${id}: ${(err as Error).message}`);
      }
    }
    const left = unknownFields(after);
    if (left.length) p.problems.push(`${id}: ${left.length} unknown field(s) would remain: ${left.map((f) => f.path).join(", ")}`);
  }

  if (p.problems.length) {
    console.log(`\nREFUSING — the documents differ from the scan:\n${p.problems.map((x) => `  - ${x}`).join("\n")}`);
    process.exitCode = 1;
    return;
  }
  const total = [...p.paths.values()].reduce((n, a) => n + a.length, 0);
  console.log(`\nverified: ${total} paths, each still an unknown field holding its scanned value; no other unknown fields in these documents.`);

  if (DRY) return console.log(`\ndry run — nothing written (re-run with -- --apply to write)`);

  // Re-read right before writing; refuse if a revision moved since the plan.
  const again = await readAll();
  const p2 = plan(again.published);
  if (p2.problems.length) throw new Error(`refusing on re-read:\n${p2.problems.join("\n")}`);
  for (const id of DOC_IDS)
    if (again.published.get(id)!._rev !== first.published.get(id)!._rev)
      throw new Error(`refusing: ${id} changed while planning (rev ${first.published.get(id)!._rev} → ${again.published.get(id)!._rev}) — run again`);

  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `unknown-fields-nov26-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(
    file,
    JSON.stringify(
      {
        note: "Full published documents before patch-unset-unknown-fields-nov26.ts unset the 34 paths below.",
        paths: Object.fromEntries(p2.paths),
        documents: DOC_IDS.map((id) => again.published.get(id)),
        draftsOrVersions: again.others.map((o) => o.doc ?? { _id: o._id, _rev: o._rev }),
      },
      null,
      1,
    ),
  );
  console.log(`\nbackup → ${file}`);

  const muts = DOC_IDS.map((id) => ({
    patch: { id, ifRevisionID: again.published.get(id)!._rev, unset: p2.paths.get(id)! },
  }));
  const res = await client.mutate(muts as never, { visibility: "sync" });
  console.log(
    `✓ committed: unset ${total} paths in ${muts.length} documents, one transaction ${(res as { transactionId?: string }).transactionId ?? ""} at ${new Date().toISOString()}`,
  );

  // Read back.
  const after = await readAll();
  let ok = true;
  console.log(`\nread back:`);
  for (const id of DOC_IDS) {
    const before = structuredClone(again.published.get(id)!);
    for (const path of p2.paths.get(id)!) removePath(before, path);
    const now = after.published.get(id);
    if (!now) {
      ok = false;
      console.log(`  WRONG ${id}: missing after write`);
      continue;
    }
    const left = unknownFields(now);
    const gone = p2.paths.get(id)!.every((path) => !left.some((f) => f.path === path));
    const same = canonical(now) === canonical(before) && isDeepStrictEqual(JSON.parse(canonical(now)), JSON.parse(canonical(before)));
    ok &&= gone && same && left.length === 0;
    console.log(
      `  ${gone && same && !left.length ? "OK   " : "WRONG"} ${id}: rev ${again.published.get(id)!._rev} → ${now._rev}; ${p2.paths.get(id)!.length} path(s) gone: ${gone}; unknown fields left: ${left.length}; every other field identical: ${same}`,
    );
  }
  if (after.others.length) console.log(`  drafts / versions untouched: ${after.others.map((o) => o._id).join(", ")}`);
  if (!ok) throw new Error("read-back check failed — see above; restore from the backup");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
