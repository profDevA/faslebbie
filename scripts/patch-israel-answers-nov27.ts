/**
 * Israel's answers on the close-out tracker (Nov 27): two new Studio switches
 * on the Core Experience Flow section, turned on for the studies he named.
 * Sources: Israel's sheet rows 27 / 85 / 96 and Figma "END DESIGN +DEV 2027"
 * (fr2xqA4MUG62WcbVFQ0xG9). The switches ship with the app (schema
 * `coreExperience.screenShadow` / `largeCaptions`, both default off); this
 * script only sets them.
 *
 * GROUPS (`-- --only=A,B` runs some of them; default = all):
 *  A  FDX Core Experience Flow (row 27, "Try a subtle shadow on the Core
 *     Experience Flow screens… Apply it to FDX only"): "Screen shadow" on the
 *     first CE band `79924bd7e98f` (Figma 6:4525: soft shadow round each phone;
 *     the band's screens are transparent PNGs, live has no shadow). The second
 *     (Mint) band `aee2e6342c7d` is left off: Figma 6:4807 has the same shadow,
 *     but its uploads already carry it, baked in with an opaque band-colour
 *     background — the switch would draw a rectangle round each PNG.
 *  B  OC Links (row 85) + OC Navigator (row 96) Core Experience Flow ("Try the
 *     tablet captions at 16 px and let them wrap naturally… align the left
 *     edge of each screen with the start of its caption"): "Large captions,
 *     left-aligned with the screen" on their desktopGrid CE bands (Figma OC
 *     Links 6:44652, OC Navigator 6:40085: 16 px / 20 line, two lines).
 *     Census, Acme and Vuforia Editor use the same layout and stay off.
 *
 * Safety: sections addressed by `_key` (and their layout checked); every field
 * must hold its expected current value (unset), else the run refuses (a Studio
 * edit since Nov 27). A field already at the target is "already set".
 * Published documents only: an open draft is reported (and whether publishing
 * it would undo a change) and left alone. Re-reads right before writing
 * (refuses if anything moved), backs up the whole `sections` array of every
 * touched document to ../exports/sanity-backups/, commits one transaction
 * (`ifRevisionID` on each document's patch), then reads back.
 *
 * Plan only (default, or `-- --dry`); write with `-- --apply`.
 * `-- --only=A,B` limits the groups; `-- --skip=<id>,<id>` drops fixes.
 *
 *   npx sanity exec scripts/patch-israel-answers-nov27.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-israel-answers-nov27.ts --with-user-token -- --apply --only=A
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { isDeepStrictEqual } from "node:util";

import { BACKUPS, client as cliClient } from "./lib/structure-nov11";

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
const GROUPS = ["A", "B"] as const;
type Group = (typeof GROUPS)[number];
for (const g of ONLY) if (!GROUPS.includes(g as Group)) throw new Error(`--only: unknown group ${g} (A–B)`);
const wanted = (g: Group) => ONLY.size === 0 || ONLY.has(g);

// ---------------------------------------------------------------------------

type Fix = {
  group: Group;
  id: string;
  row: string;
  slug: string;
  study: string;
  sectionKey: string;
  sectionType: string;
  /** The section's Screen layout must be this (unset = mobileRow, the schema default). */
  layout: "mobileRow" | "desktopGrid";
  field: string;
  /** Expected current value: null = unset (or false). */
  from: boolean | null;
  to: boolean;
  studio: string;
  source: string;
};

const FIXES: Fix[] = [
  // ---- A: FDX screen shadow ----
  {
    group: "A",
    id: "fdx-ce-screen-shadow",
    row: "27",
    slug: "financial-data-exchange",
    study: "FDX",
    sectionKey: "79924bd7e98f",
    sectionType: "coreExperience",
    layout: "mobileRow",
    field: "screenShadow",
    from: null,
    to: true,
    studio: "04 — Core Experience Flow (first band) → Screen shadow",
    source: "Figma 6:4525: drop shadow ≈ 0 3px 9px rgba(0,0,0,.21) round each phone (screenshot pixels)",
  },
  // ---- B: OC captions ----
  {
    group: "B",
    id: "oc-links-ce-large-captions",
    row: "85",
    slug: "oc-links",
    study: "OC Links",
    sectionKey: "f0e8493c4348",
    sectionType: "coreExperience",
    layout: "desktopGrid",
    field: "largeCaptions",
    from: null,
    to: true,
    studio: "04 — Core Experience Flow → Large captions, left-aligned with the screen",
    source: "Figma 6:44652: captions 16 px / 20, two lines, starting at the tablet's left edge",
  },
  {
    group: "B",
    id: "oc-navigator-ce-large-captions",
    row: "96",
    slug: "oc-digital-resource-navigator",
    study: "OC Navigator",
    sectionKey: "f9da2863494d",
    sectionType: "coreExperience",
    layout: "desktopGrid",
    field: "largeCaptions",
    from: null,
    to: true,
    studio: "04 — Core Experience Flow → Large captions, left-aligned with the screen",
    source: "Figma 6:40085: captions 16 px / 20, two lines, starting at the tablet's left edge",
  },
];

/** Left out on purpose (printed for the record). */
const LEFT_OUT: [string, string][] = [
  [
    "FDX Mint CE band `aee2e6342c7d` (row 27)",
    "its five uploads already carry Figma 6:4807's shadow, baked in on an opaque band-colour background; the switch would add a rectangle round each PNG. Transparent re-exports (Israel) → then switch it on in Studio",
  ],
  ["Census / Acme / Vuforia Editor CE (desktopGrid)", "same layout as OC; Israel asked for OC Links + OC Navigator first — switch stays off"],
];

// ---------------------------------------------------------------------------

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
  field: string;
  path: string;
  label: string;
  before: unknown;
  after: boolean;
  draftNote: string;
};
type Plan = {
  changes: Change[];
  already: string[];
  problems: string[];
  revs: Record<string, string>;
  sections: Record<string, Section[]>;
};

const show = (v: unknown) => (v === undefined || v === null ? "(unset)" : JSON.stringify(v));
const matches = (v: unknown, want: boolean | null) => (want === null ? v == null || v === false : v === want);

function locate(doc: Doc, fix: Fix) {
  const secs = (doc.sections ?? []).filter((s) => s._key === fix.sectionKey);
  if (secs.length !== 1) return { err: `${secs.length} sections with _key ${fix.sectionKey}` } as const;
  if (secs[0]._type !== fix.sectionType) return { err: `section ${fix.sectionKey} is ${secs[0]._type}, expected ${fix.sectionType}` } as const;
  const layout = (secs[0].layoutVariant as string | undefined) ?? "mobileRow";
  if (layout !== fix.layout) return { err: `section ${fix.sectionKey} layout is ${layout}, expected ${fix.layout}` } as const;
  return { sec: secs[0] } as const;
}

function draftNote(draft: Doc | undefined, fix: Fix): string {
  if (!draft) return "";
  const loc = locate(draft, fix);
  if ("err" in loc) return `draft: ${loc.err}`;
  const v = loc.sec[fix.field];
  if (matches(v, fix.to)) return "draft already has the new value";
  if (matches(v, fix.from)) return "DRAFT STILL HAS THE OLD VALUE — publishing that draft would undo this fix";
  return `draft has ${show(v)}`;
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
      const cur = loc.sec[fix.field];
      const path = `sections[_key=="${fix.sectionKey}"].${fix.field}`;
      say(`    ${doc._id} rev ${doc._rev} · ${fix.sectionType} ${fix.sectionKey} "${String(loc.sec.sectionTitle ?? "")}" (${fix.layout}) · ${fix.field}`);
      say(`    Studio: ${fix.studio}`);
      say(`    source: ${fix.source}`);
      if (matches(cur, fix.to)) {
        say(`    already set: ${show(cur)} — nothing to do`);
        already.push(fix.id);
        continue;
      }
      if (!matches(cur, fix.from)) {
        refuse(fix.id, `${path} is ${show(cur)}, expected ${show(fix.from)} (Studio edit since Nov 27?)`);
        continue;
      }
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
        field: fix.field,
        path,
        label: `${fix.sectionKey}.${fix.field}`,
        before: cur ?? null,
        after: fix.to,
        draftNote: note,
      });
      say(`    ${show(cur)} → ${show(fix.to)}`);
      if (note) say(`    ${note}`);
    }
  }

  const sections: Record<string, Section[]> = {};
  for (const id of touched) sections[id] = published.find((d) => d._id === id)!.sections ?? [];
  return { changes, already, problems, revs, sections };
}

async function main() {
  console.log(
    `patch-israel-answers-nov27 (${DRY ? "DRY — nothing written" : "APPLY"}) · groups ${ONLY.size ? [...ONLY].join(",") : GROUPS.join(",")}${SKIP.size ? ` · skip: ${[...SKIP].join(", ")}` : ""}`,
  );
  const first = await plan(true);

  const docs = new Set(first.changes.map((c) => c.docId));
  console.log(`\n— Summary: ${first.changes.length} field(s) in ${docs.size} document(s); already set: ${first.already.length}`);
  console.log(`  ${"group".padEnd(5)} ${"study".padEnd(13)} ${"row".padEnd(4)} ${"field".padEnd(28)} before → after`);
  for (const c of first.changes)
    console.log(`  ${c.group.padEnd(5)} ${c.study.padEnd(13)} ${c.row.padEnd(4)} ${c.label.padEnd(28)} ${show(c.before)} → ${show(c.after)}${c.draftNote ? `  [${c.draftNote}]` : ""}`);
  if (first.already.length) console.log(`  already set: ${first.already.join(", ")}`);

  console.log(`\n— Left out (${LEFT_OUT.length})`);
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
  const file = join(BACKUPS, `israel-answers-nov27-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(
    file,
    JSON.stringify(
      {
        revs: p.revs,
        changes: p.changes.map((c) => ({ id: c.id, _id: c.docId, _rev: c.rev, path: c.path, before: c.before, after: c.after })),
        sectionsBefore: p.sections,
      },
      null,
      1,
    ),
  );
  console.log(`\nbackup (whole sections arrays) → ${file}`);

  // One transaction, one patch per document (set, with ifRevisionID).
  const muts = [...docs].map((id) => {
    const set = Object.fromEntries(p.changes.filter((c) => c.docId === id).map((c) => [c.path, c.after]));
    return { patch: { id, ifRevisionID: p.revs[id], set } };
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
    const v = sec?.[c.field];
    const good = isDeepStrictEqual(v, c.after);
    ok &&= good;
    console.log(`  ${good ? "OK   " : "WRONG"} ${c.docId} ${c.label}: ${show(v)}`);
  }
  for (const id of docs) console.log(`  ${id} rev ${now.get(id)!._rev}${now.get(`drafts.${id}`) ? ` (draft drafts.${id} untouched)` : ""}`);
  if (!ok) throw new Error("read-back check failed — see above; restore from the backup");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
