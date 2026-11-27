/**
 * Israel's close-out tracker (Nov 27), second batch of Studio rows.
 * Sources: docs/reference/israel-final-qa-2026-11-27/ (tracker xlsx, "Final QA"
 * doc comments) and Figma "END DESIGN +DEV 2027" (fr2xqA4MUG62WcbVFQ0xG9).
 * Live sheet rows are the Nov 27 12:09 download (they shift as Israel edits).
 * Colours read from Figma screenshot pixels (solid fills, no image).
 *
 * GROUPS (`-- --only=A,C` runs some of them; default = all):
 *  A  OC Links Project Overview (row 84, "Update the background image on the
 *     right"): side panel colour #E8E4DC → #384E73 (Figma desktop 6:44582 —
 *     the panel is one solid navy; the side video is a VP9 webm with alpha, so
 *     the new colour shows round the laptop). NOTE: the phone frame 6:47092
 *     uses a darker #13243C; the site has one colour for both.
 *  B  Galderma Project Overview (row 196, "Update the background from Figma"):
 *     side panel colour #52747E → #A8A9D1 (Figma 6:102974, phone 6:106225 the
 *     same). The video part of the row is an upload (Figma shows it in the
 *     555 × 350 white card = Studio "Video in a white card"; not changed here).
 *  C  Galderma Design Interventions coverflow (row 198; the "Final QA" doc
 *     comment adds "as well as background image"): band colour #171717 →
 *     #000000 (Figma 6:103006 and phone 6:106225: pure black). Sizes and
 *     spacing already match the Figma (code, QA G2 Nov 25); images = Israel.
 *  D  AR Handbook Cross Functional Experiences (row 109, "consistent with
 *     Experian, Coral Health"): the placeholder sits whole in the row's
 *     `label` (now the 13 px uppercase label, like Experian's KPE). Split at
 *     the colon so it renders like Figma 6:50646 / 6:51081 (label + body):
 *     label "Programme Details", caption "Explore eligibility, …". All 9 rows
 *     are placeholder copy — Ade / Fas replace them (label + caption).
 *  E  Overview side panel colour behind the white video cards (Figma "END
 *     DESIGN +DEV 2027" Overview frames, solid fills, read from screenshot
 *     pixels): Design Assist #F4F7FC → #D5CFDD (6:54899), Vuforia Chalk
 *     #52747E → #BDBDBD (9:39523), Vuforia Editor #52747E → #C2C7CE (8:27886),
 *     Life of a Miner #52747E → #906952 (6:75492 and the loose 6:77285). The
 *     card videos themselves are uploads (Sakib / Fas). Miner and Editor were
 *     re-saved 20:03 UTC by nov27 B–E (other sections only) — values re-read.
 *
 * Safety: sections and row items addressed by `_key`; every field must hold
 * its expected current value, else the run refuses (a Studio edit since
 * Nov 27). A field already at the target is "already set". Published documents
 * only: an open draft is reported (and whether publishing it would undo a
 * change) and left alone. Re-reads right before writing (refuses if anything
 * moved), backs up the whole `sections` array of every touched document to
 * ../exports/sanity-backups/, commits one transaction (`ifRevisionID` on each
 * document's patch), then reads back.
 *
 * Plan only (default, or `-- --dry`); write with `-- --apply`.
 * `-- --only=A,B,C,D,E` limits the groups; `-- --skip=<id>,<id>` drops fixes.
 *
 *   npx sanity exec scripts/patch-israel-studio-rows-nov27b.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-israel-studio-rows-nov27b.ts --with-user-token -- --apply --only=A
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { isDeepStrictEqual } from "node:util";

import { BACKUPS, client as cliClient } from "./lib/structure-nov11";
import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

const client = cliClient.withConfig({ perspective: "raw" });
const APPLY = process.argv.includes("--apply");
const DRY = process.argv.includes("--dry") || !APPLY;
const listArg = (name: string) =>
  new Set(
    (process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3) ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
const ONLY = new Set([...listArg("only")].map((s) => s.toUpperCase()));
const SKIP = listArg("skip");
const GROUPS = ["A", "B", "C", "D", "E"] as const;
type Group = (typeof GROUPS)[number];
for (const g of ONLY) if (!GROUPS.includes(g as Group)) throw new Error(`--only: unknown group ${g} (A–E)`);
const wanted = (g: Group) => ONLY.size === 0 || ONLY.has(g);

// ---------------------------------------------------------------------------

type Kind = "color" | "str";
type Fix = {
  group: Group;
  id: string;
  row: string;
  slug: string;
  study: string;
  sectionKey: string;
  sectionType: string;
  /** Item inside a keyed array of the section (e.g. motionShowcase `rows`). */
  item?: { array: string; key: string };
  /** Dotted field path inside the section (or the item). */
  field: string;
  kind: Kind;
  /** Expected current value: colour "#RRGGBB" / "#RRGGBB@0.4"; str ("" or null = empty / unset). */
  from: string | null;
  /** Target: colour "#RRGGBB"; str; null = unset the field. */
  to: string | null;
  studio: string;
  source: string;
};

const AR_PLACEHOLDER = "Programme Details: Explore eligibility, required documents, benefits and application guidance.";
const AR_LABEL = "Programme Details";
const AR_CAPTION = "Explore eligibility, required documents, benefits and application guidance.";
const OVERVIEW_PANEL = "Overview → Side feature image background color";

/** AR Handbook: three Cross Functional bands × phone / tablet / desktop rows. */
const AR_ROWS: { section: string; rows: [string, string][] }[] = [
  { section: "84526dbe6781", rows: [["20167ef546d4", "mobile"], ["71ead1dc09ff", "tablet"], ["7bfe1d7839ba", "desktop"]] },
  { section: "6b838ff83962", rows: [["b38b1c877cc4", "mobile"], ["29164e2d22c5", "tablet"], ["d0c8d7aa6635", "desktop"]] },
  { section: "1bca21db656b", rows: [["ff01cdf5c21c", "mobile"], ["020b9df1d58b", "tablet"], ["6ab6d19d3530", "desktop"]] },
];

const FIXES: Fix[] = [
  // ---- A: OC Links Overview panel ----
  {
    group: "A",
    id: "oc-links-overview-panel",
    row: "84",
    slug: "oc-links",
    study: "OC Links",
    sectionKey: "78ea468be728",
    sectionType: "overviewSection",
    field: "sideImageBackgroundColor",
    kind: "color",
    from: "#E8E4DC",
    to: "#384E73",
    studio: OVERVIEW_PANEL,
    source: "Figma 6:44582 desktop (solid #384E73; phone 6:47092 is #13243C — one field)",
  },
  // ---- B: Galderma Overview panel ----
  {
    group: "B",
    id: "galderma-overview-panel",
    row: "196",
    slug: "galderma",
    study: "Galderma",
    sectionKey: "607094ab741e",
    sectionType: "overviewSection",
    field: "sideImageBackgroundColor",
    kind: "color",
    from: "#52747E",
    to: "#A8A9D1",
    studio: OVERVIEW_PANEL,
    source: "Figma 6:102974 desktop + phone 6:106225 (both #A8A9D1)",
  },
  // ---- C: Galderma Design Interventions band ----
  {
    group: "C",
    id: "galderma-interventions-band",
    row: "198",
    slug: "galderma",
    study: "Galderma",
    sectionKey: "b48ff65b502a",
    sectionType: "showcaseGallery",
    field: "appearance.backgroundColor",
    kind: "color",
    from: "#171717",
    to: "#000000",
    studio: "Design Interventions (coverflow) → Layout & colors → Background color",
    source: "Figma 6:103006 (+ phone 6:106225): pure black; Final QA comment \"…as well as background image\"",
  },
  // ---- D: AR Handbook Cross Functional captions ----
  ...AR_ROWS.flatMap(({ section, rows }, b) =>
    rows.flatMap(([key, device]): Fix[] => [
      {
        group: "D",
        id: `ar-cf${b + 1}-${device}-label`,
        row: "109",
        slug: "the-ar-handbook",
        study: "AR Handbook",
        sectionKey: section,
        sectionType: "motionShowcase",
        item: { array: "rows", key },
        field: "label",
        kind: "str",
        from: AR_PLACEHOLDER,
        to: AR_LABEL,
        studio: `Cross Functional Experiences (band ${b + 1}) → ${device} row → Label`,
        source: "Figma 6:50646 / 6:51081: uppercase label + body under each device (placeholder copy — Ade)",
      },
      {
        group: "D",
        id: `ar-cf${b + 1}-${device}-caption`,
        row: "109",
        slug: "the-ar-handbook",
        study: "AR Handbook",
        sectionKey: section,
        sectionType: "motionShowcase",
        item: { array: "rows", key },
        field: "caption",
        kind: "str",
        from: null,
        to: AR_CAPTION,
        studio: `Cross Functional Experiences (band ${b + 1}) → ${device} row → Caption`,
        source: "the placeholder's text after the colon (Experian / Coral KPE: body-tier caption)",
      },
    ]),
  ),
  // ---- E: Overview panel behind the white video cards ----
  ...(
    [
      ["design-assist-overview-panel", "Design Assist", "design-assist-ai", "1ebafafec97d", "#F4F7FC", "#D5CFDD", "Figma 6:54899 Overview panel"],
      ["vuforia-chalk-overview-panel", "Vuforia Chalk", "vuforia-chalk", "f59f81ecc196", "#52747E", "#BDBDBD", "Figma 9:39523 Overview panel"],
      ["vuforia-editor-overview-panel", "Vuforia Editor", "vuforia-expert-capture", "6dbb20f02a1c", "#52747E", "#C2C7CE", "Figma 8:27886"],
      ["miner-overview-panel", "Life of a Miner", "life-of-a-miner-vr", "6d7f6983842d", "#52747E", "#906952", "Figma 6:75492 (and loose 6:77285)"],
    ] as const
  ).map(
    ([id, study, slug, sectionKey, from, to, source]): Fix => ({
      group: "E",
      id,
      row: "—",
      slug,
      study,
      sectionKey,
      sectionType: "overviewSection",
      field: "sideImageBackgroundColor",
      kind: "color",
      from,
      to,
      studio: OVERVIEW_PANEL,
      source: `${source}: solid panel behind the white 555 × 350 video card`,
    }),
  ),
];

/** Rows of this batch that are not Studio values (printed for the record). */
const LEFT_OUT: [string, string][] = [
  ["Galderma Overview video (row 196)", "upload; Figma shows it in the 555 × 350 white card → Studio \"Video in a white card\" on, \"Video fills the panel\" off, once the real video is in"],
  ["Galderma coverflow images (rows 198 / 201)", "Israel's re-exports (5 screens); Figma side slides are 309 (left) / 288 (right) wide vs the site's uniform 315 — ask Israel"],
  ["AR Handbook caption copy (row 109)", "all 9 rows are placeholder — Ade / Fas (label + caption)"],
  ["Vuforia Editor Speech to Text (row 215)", "main band `861ce06e8586`: video upload into \"Desktop animation / video asset\" (+ a device-only still, Figma 8:33343); grid `4756d30b216b` already = Figma 8:33478"],
];

// ---------------------------------------------------------------------------

type Item = { _key: string } & Record<string, unknown>;
type Section = { _key: string; _type: string } & Record<string, unknown>;
type Doc = { _id: string; _rev: string; slug?: string; title?: string; sections?: Section[] | null };
type Change = {
  group: Group;
  id: string;
  row: string;
  docId: string;
  rev: string;
  study: string;
  sectionKey: string;
  /** Path inside the section, for read-back. */
  inner: string;
  path: string;
  label: string;
  before: unknown;
  /** undefined = unset */
  after: unknown;
  show: [string, string];
  draftNote: string;
};
type Plan = {
  changes: Change[];
  already: string[];
  problems: string[];
  revs: Record<string, string>;
  sections: Record<string, Section[]>;
};

const color = (v: unknown) => (v && typeof v === "object" ? ((v as { hex?: string }).hex ?? null) : null);
const alphaOf = (v: unknown) => {
  const a = v && typeof v === "object" ? (v as { alpha?: number }).alpha : undefined;
  return typeof a === "number" ? a : 1;
};
const isEmpty = (v: unknown) => v == null || v === "";
const clip = (s: string, n = 70) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

/** Dotted path; a `[_key=="…"]` segment picks an array item. */
function get(obj: unknown, dotted: string): unknown {
  return dotted.split(".").reduce<unknown>((o, k) => {
    if (!o || typeof o !== "object") return undefined;
    const m = k.match(/^(\w+)\[_key=="([^"]+)"\]$/);
    if (m) {
      const arr = (o as Record<string, unknown>)[m[1]];
      return Array.isArray(arr) ? (arr as Item[]).find((x) => x._key === m[2]) : undefined;
    }
    return (o as Record<string, unknown>)[k];
  }, obj);
}

function show(kind: Kind, v: unknown): string {
  if (kind === "color") return v ? `${color(v)}${alphaOf(v) !== 1 ? ` α${alphaOf(v)}` : ""}` : "(empty)";
  return isEmpty(v) ? "(unset)" : JSON.stringify(clip(String(v)));
}

const parseColor = (spec: string) => {
  const [hex, a] = spec.split("@");
  return { hex, alpha: a === undefined ? 1 : Number(a) };
};

function matches(kind: Kind, v: unknown, want: string | null): boolean {
  if (kind === "color") {
    if (want === null) return v == null;
    const w = parseColor(want);
    return (color(v) ?? "").toLowerCase() === w.hex.toLowerCase() && Math.abs(alphaOf(v) - w.alpha) < 0.005;
  }
  return want === null || want === "" ? isEmpty(v) : v === want;
}

const innerPath = (fix: Fix) => (fix.item ? `${fix.item.array}[_key=="${fix.item.key}"].${fix.field}` : fix.field);

function locate(doc: Doc, fix: Fix) {
  const secs = (doc.sections ?? []).filter((s) => s._key === fix.sectionKey);
  if (secs.length !== 1) return { err: `${secs.length} sections with _key ${fix.sectionKey}` } as const;
  if (secs[0]._type !== fix.sectionType) return { err: `section ${fix.sectionKey} is ${secs[0]._type}, expected ${fix.sectionType}` } as const;
  if (fix.item) {
    const arr = secs[0][fix.item.array];
    const n = Array.isArray(arr) ? (arr as Item[]).filter((x) => x._key === fix.item!.key).length : 0;
    if (n !== 1) return { err: `${n} ${fix.item.array} items with _key ${fix.item.key} in ${fix.sectionKey}` } as const;
  }
  return { sec: secs[0] } as const;
}

function draftNote(draft: Doc | undefined, fix: Fix): string {
  if (!draft) return "";
  const loc = locate(draft, fix);
  if ("err" in loc) return `draft: ${loc.err}`;
  const v = get(loc.sec, innerPath(fix));
  if (matches(fix.kind, v, fix.to)) return "draft already has the new value";
  if (matches(fix.kind, v, fix.from)) return "DRAFT STILL HAS THE OLD VALUE — publishing that draft would undo this fix";
  return `draft has ${show(fix.kind, v)}`;
}

async function readDocs(): Promise<Doc[]> {
  return client.fetch<Doc[]>(`*[_type == "caseStudy"]{ _id, _rev, title, "slug": slug.current, sections }`);
}

async function plan(log: boolean): Promise<Plan> {
  const say = (s: string) => log && console.log(s);
  const all = await readDocs();
  const published = all.filter((d) => !d._id.startsWith("drafts.") && !d._id.startsWith("versions."));
  const draftsById = new Map(all.filter((d) => d._id.startsWith("drafts.")).map((d) => [d._id.slice("drafts.".length), d]));
  const bySlug = new Map<string, Doc>();
  for (const d of published) {
    if (!d.slug) continue;
    if (bySlug.has(d.slug)) throw new Error(`refusing: two published case studies with slug ${d.slug}`);
    bySlug.set(d.slug, d);
  }
  const studySlugs = new Set(FIXES.map((f) => f.slug));
  const drafts = published.filter((d) => d.slug && studySlugs.has(d.slug) && draftsById.has(d._id));
  say(`\nPublished case studies: ${published.length}; drafts among the studies in this script: ${drafts.length}`);
  for (const d of drafts) say(`  draft: ${d.slug} — drafts.${d._id} rev ${draftsById.get(d._id)!._rev}`);

  const changes: Change[] = [];
  const already: string[] = [];
  const problems: string[] = [];
  const revs: Record<string, string> = {};
  const touched = new Set<string>();
  const refuse = (id: string, msg: string) => {
    problems.push(`[${id}] ${msg}`);
    say(`    REFUSED: ${msg}`);
  };

  for (const group of GROUPS) {
    say(`\n— Group ${group}${wanted(group) ? "" : " (not selected by --only)"}`);
    if (!wanted(group)) continue;
    for (const fix of FIXES.filter((f) => f.group === group)) {
      say(`\n  [${fix.id}] ${fix.study} · row ${fix.row}`);
      if (SKIP.has(fix.id)) {
        say(`    SKIPPED by --skip`);
        continue;
      }
      const doc = bySlug.get(fix.slug);
      if (!doc) {
        refuse(fix.id, `no published case study with slug ${fix.slug}`);
        continue;
      }
      const loc = locate(doc, fix);
      if ("err" in loc) {
        refuse(fix.id, `${doc._id}: ${loc.err}`);
        continue;
      }
      const inner = innerPath(fix);
      const cur = get(loc.sec, inner);
      const path = `sections[_key=="${fix.sectionKey}"].${inner}`;
      say(`    ${doc._id} rev ${doc._rev} · ${fix.sectionType} ${fix.sectionKey} "${String(loc.sec.sectionTitle ?? "")}" · ${inner}`);
      say(`    Studio: ${fix.studio}`);
      say(`    source: ${fix.source}`);
      if (matches(fix.kind, cur, fix.to)) {
        say(`    already set: ${show(fix.kind, cur)} — nothing to do`);
        already.push(fix.id);
        continue;
      }
      if (!matches(fix.kind, cur, fix.from)) {
        refuse(fix.id, `${path} is ${show(fix.kind, cur)}, expected ${fix.kind === "color" ? String(fix.from) : show("str", fix.from)} (Studio edit since Nov 27?)`);
        continue;
      }
      const after =
        fix.to === null
          ? undefined
          : fix.kind === "color"
            ? sanityColor(parseColor(fix.to).hex.toLowerCase(), parseColor(fix.to).alpha)
            : fix.to;
      const note = draftNote(draftsById.get(doc._id), fix);
      revs[doc._id] = doc._rev;
      touched.add(doc._id);
      changes.push({
        group,
        id: fix.id,
        row: fix.row,
        docId: doc._id,
        rev: doc._rev,
        study: fix.study,
        sectionKey: fix.sectionKey,
        inner,
        path,
        label: `${fix.sectionKey}${fix.item ? ` ${fix.item.array}[${fix.item.key}]` : ""}.${fix.field}`,
        before: cur ?? null,
        after,
        show: [show(fix.kind, cur), after === undefined ? "(unset)" : show(fix.kind, after)],
        draftNote: note,
      });
      say(`    ${show(fix.kind, cur)} → ${after === undefined ? "(unset)" : show(fix.kind, after)}`);
      if (note) say(`    ${note}`);
    }
  }

  const sections: Record<string, Section[]> = {};
  for (const id of touched) sections[id] = published.find((d) => d._id === id)!.sections ?? [];
  return { changes, already, problems, revs, sections };
}

async function main() {
  console.log(
    `patch-israel-studio-rows-nov27b (${DRY ? "DRY — nothing written" : "APPLY"}) · groups ${ONLY.size ? [...ONLY].join(",") : GROUPS.join(",")}${SKIP.size ? ` · skip: ${[...SKIP].join(", ")}` : ""}`,
  );
  const first = await plan(true);

  const docs = new Set(first.changes.map((c) => c.docId));
  console.log(`\n— Summary: ${first.changes.length} field(s) in ${docs.size} document(s); already set: ${first.already.length}`);
  console.log(`  ${"group".padEnd(5)} ${"study".padEnd(16)} ${"row".padEnd(4)} ${"field".padEnd(52)} before → after`);
  for (const c of first.changes)
    console.log(`  ${c.group.padEnd(5)} ${c.study.padEnd(16)} ${c.row.padEnd(4)} ${c.label.padEnd(52)} ${c.show[0]} → ${c.show[1]}${c.draftNote ? `  [${c.draftNote}]` : ""}`);
  if (first.already.length) console.log(`  already set: ${first.already.join(", ")}`);

  console.log(`\n— Not Studio values (${LEFT_OUT.length})`);
  for (const [what, why] of LEFT_OUT) console.log(`  - ${what}: ${why}`);

  if (first.problems.length) {
    console.log(`\n— REFUSED (${first.problems.length}): nothing is written until each is resolved or dropped with --skip=<id> / --only`);
    for (const m of first.problems) console.log(`  - ${m}`);
    if (!DRY) throw new Error(`refusing: ${first.problems.length} item(s) not as expected (see above)`);
  }

  if (!first.changes.length) return console.log("\nnothing to do");
  if (DRY) return console.log(`\ndry run — nothing written (re-run with -- --apply to write; production)`);

  // Re-read right before writing; refuse if anything moved since the plan above.
  const p = await plan(false);
  const sig = (x: Plan) => JSON.stringify([x.revs, x.changes.map((c) => [c.docId, c.rev, c.path, c.before, c.after])]);
  if (sig(p) !== sig(first)) throw new Error("refusing: the documents changed while planning — run again");

  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `israel-studio-rows-nov27b-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(
    file,
    JSON.stringify(
      {
        revs: p.revs,
        changes: p.changes.map((c) => ({ id: c.id, _id: c.docId, _rev: c.rev, path: c.path, before: c.before, after: c.after ?? "(unset)" })),
        sectionsBefore: p.sections,
      },
      null,
      1,
    ),
  );
  console.log(`\nbackup (whole sections arrays) → ${file}`);

  // One transaction, one patch per document (set / unset, with ifRevisionID).
  const muts = [...docs].map((id) => {
    const cs = p.changes.filter((c) => c.docId === id);
    const set = Object.fromEntries(cs.filter((c) => c.after !== undefined).map((c) => [c.path, c.after]));
    const unset = cs.filter((c) => c.after === undefined).map((c) => c.path);
    return { patch: { id, ifRevisionID: p.revs[id], ...(Object.keys(set).length ? { set } : {}), ...(unset.length ? { unset } : {}) } };
  });
  const res = await client.mutate(muts as never, { visibility: "sync" });
  console.log(
    `✓ committed ${p.changes.length} field(s) in ${docs.size} document(s), one transaction ${(res as { transactionId?: string }).transactionId ?? ""} at ${new Date().toISOString()}`,
  );

  // Read back.
  console.log(`\nread back:`);
  const now = new Map((await readDocs()).map((d) => [d._id, d]));
  let ok = true;
  for (const c of p.changes) {
    const sec = (now.get(c.docId)?.sections ?? []).find((s) => s._key === c.sectionKey);
    const v = get(sec, c.inner);
    const good = c.after === undefined ? v === undefined : isDeepStrictEqual(v, c.after);
    ok &&= good;
    console.log(`  ${good ? "OK   " : "WRONG"} ${c.docId} ${c.label}: ${v === undefined ? "(unset)" : JSON.stringify(v).slice(0, 100)}`);
  }
  for (const id of docs) console.log(`  ${id} rev ${now.get(id)!._rev}${now.get(`drafts.${id}`) ? ` (draft drafts.${id} untouched)` : ""}`);
  if (!ok) throw new Error("read-back check failed — see above; restore from the backup");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
