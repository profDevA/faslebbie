/**
 * Visual audit Nov 27 (A: Coral / Experian / Acme / FDX / Census / DVA) —
 * three Studio values, checked against Figma "END DESIGN +DEV 2027"
 * (fr2xqA4MUG62WcbVFQ0xG9).
 *
 * GROUPS (`-- --only=A,C` runs some of them; default = all):
 *  A  FDX · Core Experience Flow #1 (`coreExperience 79924bd7e98f`): preview
 *     screens 1 and 2 have each other's image. "Understand the Process" sits
 *     under the SSN screen and "Review Data Permissions" under "How it works";
 *     Figma desktop 6:4525 and phone 6:6529 put "How it works" first (label
 *     "Understand the Process") and the SSN screen second (label "Review
 *     Data …"). Swaps the two `image` objects only — labels, descriptions,
 *     keys and order stay. `imageWidth` / `imageHeight` stay: both screens
 *     have them, so they only switch the tile to full-frame (no aspect box).
 *     The View All popup (5 composite boards) already runs How it works → SSN.
 *  B  US Census · Key Product Experiences (`motionShowcase 2a384e390c79`):
 *     `intro` is one empty bold H3 (block 98f81b9ec0bf) that opens the intro
 *     wrapper (+40 px above the first phone; Figma 11:57229 has no intro).
 *     Unsets `intro` (its only block) — an `intro: []` would still open the
 *     `s.intro && …` wrapper without the code guard.
 *  C  Diamond Valuation AI · Overview (`overviewSection 1a48d65cf8d3`): side
 *     panel colour #999999 → #A4856E (Figma desktop 6:22089 inside 6:21822:
 *     solid #a4856e on 75 % of the panel, every corner; phone 6:23808 band the
 *     same #a4856e).
 *  D  Snapback · Hero (`heroSection f40d732cf033`): Israel's Final QA "Remove
 *     the heavy black gradient". `imageHasGradient` unset → true ("Images
 *     already include the dark gradient"): the site skips its #171717 wash
 *     (bottom ~130 px solid at 1440). Both exports already darken at the
 *     bottom; previewed on 3001 Nov 27: white caption on the art at median
 *     ~4.9:1 (1440) / 4.6–4.9:1 (375), as in Figma.
 *
 * Safety: sections and items addressed by `_key`; every field must hold its
 * expected current value, else the run refuses. A field already at the
 * target is "already set". Published documents only: an open draft is
 * reported and left alone. Re-reads right before writing (refuses if anything
 * moved), backs up the whole `sections` array of every touched document to
 * ../exports/sanity-backups/, commits one transaction (`ifRevisionID` on each
 * document's patch), then reads back.
 *
 * Plan only (default, or `-- --dry`); write with `-- --apply`.
 * `-- --only=A,B,C,D` limits the groups; `-- --skip=<id>,<id>` drops fixes.
 *
 *   npx sanity exec scripts/patch-audit-nov27-a.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-audit-nov27-a.ts --with-user-token -- --apply --only=A
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
const GROUPS = ["A", "B", "C", "D"] as const;
type Group = (typeof GROUPS)[number];
for (const g of ONLY) if (!GROUPS.includes(g as Group)) throw new Error(`--only: unknown group ${g} (A–D)`);
const wanted = (g: Group) => ONLY.size === 0 || ONLY.has(g);

// ---------------------------------------------------------------------------

/**
 * color: "#RRGGBB" → full sanityColor object.
 * image: asset `_ref` → the image object found at `swapWith` (same section).
 * blankIntro: `from` = the only block's `_key` (must be whitespace-only) → unset the field.
 * bool: "true" / "false" / "unset" (= field absent) → boolean.
 */
type Kind = "color" | "image" | "blankIntro" | "bool";
type Fix = {
  group: Group;
  id: string;
  slug: string;
  study: string;
  sectionKey: string;
  sectionType: string;
  /** Item inside a keyed array of the section (e.g. coreExperience `previewScreens`). */
  item?: { array: string; key: string; label?: string };
  /** Dotted field path inside the section (or the item). */
  field: string;
  kind: Kind;
  from: string;
  /** null = unset the field. */
  to: string | null;
  /** image: the item whose image (asset `to`) is copied here. */
  swapWith?: string;
  studio: string;
  source: string;
};

const FDX_SCREENS = "previewScreens";
const FDX_SSN = "image-c4827eb167aa578636de5adc510ac4750058bed9-956x2072-png";
const FDX_HOW = "image-143467879ace6efde62aa624cd781c1275b2fd11-960x2072-png";

const FIXES: Fix[] = [
  // ---- A: FDX Core Experience Flow #1, screens 1 ↔ 2 ----
  {
    group: "A",
    id: "fdx-ce1-screen1-image",
    slug: "financial-data-exchange",
    study: "FDX",
    sectionKey: "79924bd7e98f",
    sectionType: "coreExperience",
    item: { array: FDX_SCREENS, key: "2b6b1db21a58", label: "Understand the Process:" },
    field: "image",
    kind: "image",
    from: FDX_SSN,
    to: FDX_HOW,
    swapWith: "bef7ac5416c3",
    studio: 'Core Experience Flow → Preview screens → "Understand the Process:" → Screen image',
    source: 'Figma 6:4525 (desktop) / 6:6529 (phone): "How it works" screen over "Understand the Process"',
  },
  {
    group: "A",
    id: "fdx-ce1-screen2-image",
    slug: "financial-data-exchange",
    study: "FDX",
    sectionKey: "79924bd7e98f",
    sectionType: "coreExperience",
    item: { array: FDX_SCREENS, key: "bef7ac5416c3", label: "Review Data Permissions:" },
    field: "image",
    kind: "image",
    from: FDX_HOW,
    to: FDX_SSN,
    swapWith: "2b6b1db21a58",
    studio: 'Core Experience Flow → Preview screens → "Review Data Permissions:" → Screen image',
    source: 'Figma 6:4525 / 6:6529: SSN screen ("In order to provide…") over "Review Data Access"',
  },
  // ---- B: Census KPE empty intro ----
  {
    group: "B",
    id: "census-kpe-empty-intro",
    slug: "2020-us-census-benefit-calculator",
    study: "US Census",
    sectionKey: "2a384e390c79",
    sectionType: "motionShowcase",
    field: "intro",
    kind: "blankIntro",
    from: "98f81b9ec0bf",
    to: null,
    studio: "Key Product Experiences → Intro (one empty bold H3)",
    source: "Figma 11:57229: title → first phone, no intro (audit sbs/census-d-06: +40 px)",
  },
  // ---- C: DVA Overview panel ----
  {
    group: "C",
    id: "dva-overview-panel",
    slug: "diamond-valuation-ai",
    study: "DVA",
    sectionKey: "1a48d65cf8d3",
    sectionType: "overviewSection",
    field: "sideImageBackgroundColor",
    kind: "color",
    from: "#999999",
    to: "#A4856E",
    studio: "Overview → Side feature image background color",
    source: "Figma 6:22089 (desktop, in 6:21822) + phone 6:23808 band: solid #a4856e",
  },
  // ---- D: Snapback hero wash ----
  {
    group: "D",
    id: "snapback-hero-no-wash",
    slug: "snapback-lifestyle",
    study: "Snapback",
    sectionKey: "f40d732cf033",
    sectionType: "heroSection",
    field: "imageHasGradient",
    kind: "bool",
    from: "unset",
    to: "true",
    studio: 'Hero → "Images already include the dark gradient" (on)',
    source: "Israel Final QA \"Remove the heavy black gradient\"; Figma hero shows the art to the bottom edge",
  },
];

// ---------------------------------------------------------------------------

type Item = { _key: string } & Record<string, unknown>;
type Section = { _key: string; _type: string } & Record<string, unknown>;
type Doc = { _id: string; _rev: string; slug?: string; title?: string; sections?: Section[] | null };
type Change = {
  group: Group;
  id: string;
  docId: string;
  rev: string;
  study: string;
  sectionKey: string;
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
const assetRef = (v: unknown) =>
  v && typeof v === "object" ? ((v as { asset?: { _ref?: string } }).asset?._ref ?? null) : null;
const isBlankBlock = (b: unknown) => {
  if (!b || typeof b !== "object") return false;
  const x = b as { _type?: unknown; children?: unknown };
  return (
    x._type === "block" &&
    Array.isArray(x.children) &&
    x.children.every((c) => c?._type === "span" && !String(c?.text ?? "").trim())
  );
};

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
  if (kind === "image") return assetRef(v) ?? "(no image)";
  if (kind === "bool") return v === undefined || v === null ? "(unset)" : String(v);
  if (v === undefined || v === null) return "(unset)";
  if (Array.isArray(v))
    return `[${v
      .map((b) => `${(b as Item)._key} ${String((b as { style?: string }).style ?? "")}${isBlankBlock(b) ? " (blank)" : ` "${JSON.stringify(b).slice(0, 40)}…"`}`)
      .join(", ")}]`;
  return JSON.stringify(v).slice(0, 80);
}

function matches(kind: Kind, v: unknown, want: string | null): boolean {
  if (want === null) return v === undefined || v === null;
  if (kind === "color") return (color(v) ?? "").toLowerCase() === want.toLowerCase() && Math.abs(alphaOf(v) - 1) < 0.005;
  if (kind === "image") return assetRef(v) === want;
  if (kind === "bool") return want === "unset" ? v === undefined || v === null : v === (want === "true");
  // blankIntro: exactly one block with this key, and it is whitespace-only
  return Array.isArray(v) && v.length === 1 && (v[0] as Item)?._key === want && isBlankBlock(v[0]);
}

const innerPath = (fix: Fix) => (fix.item ? `${fix.item.array}[_key=="${fix.item.key}"].${fix.field}` : fix.field);

function locate(doc: Doc, fix: Fix) {
  const secs = (doc.sections ?? []).filter((s) => s._key === fix.sectionKey);
  if (secs.length !== 1) return { err: `${secs.length} sections with _key ${fix.sectionKey}` } as const;
  if (secs[0]._type !== fix.sectionType) return { err: `section ${fix.sectionKey} is ${secs[0]._type}, expected ${fix.sectionType}` } as const;
  if (fix.item) {
    const arr = secs[0][fix.item.array];
    const hits = Array.isArray(arr) ? (arr as Item[]).filter((x) => x._key === fix.item!.key) : [];
    if (hits.length !== 1) return { err: `${hits.length} ${fix.item.array} items with _key ${fix.item.key} in ${fix.sectionKey}` } as const;
    if (fix.item.label !== undefined && hits[0].label !== fix.item.label)
      return { err: `${fix.item.array}[${fix.item.key}] label is ${JSON.stringify(hits[0].label)}, expected ${JSON.stringify(fix.item.label)}` } as const;
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
      say(`\n  [${fix.id}] ${fix.study}`);
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
        refuse(fix.id, `${path} is ${show(fix.kind, cur)}, expected ${fix.kind === "blankIntro" ? `one blank block ${fix.from}` : fix.from} (Studio edit since Nov 27?)`);
        continue;
      }
      let after: unknown;
      if (fix.to === null) after = undefined;
      else if (fix.kind === "color") after = sanityColor(fix.to.toLowerCase(), 1);
      else if (fix.kind === "bool") after = fix.to === "true";
      else if (fix.kind === "image") {
        // The partner item must still hold the target asset (both sides of the swap pinned).
        const other = get(loc.sec, `${fix.item!.array}[_key=="${fix.swapWith}"].${fix.field}`);
        if (assetRef(other) !== fix.to) {
          refuse(fix.id, `swap partner ${fix.item!.array}[${fix.swapWith}] holds ${assetRef(other) ?? "(no image)"}, expected ${fix.to}`);
          continue;
        }
        after = structuredClone(other);
      }
      const note = draftNote(draftsById.get(doc._id), fix);
      revs[doc._id] = doc._rev;
      touched.add(doc._id);
      changes.push({
        group,
        id: fix.id,
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

  // A swap is all-or-nothing: never write one side of it.
  const swapIds = FIXES.filter((f) => f.kind === "image" && wanted(f.group) && !SKIP.has(f.id)).map((f) => f.id);
  const swapPlanned = swapIds.filter((id) => changes.some((c) => c.id === id));
  if (swapPlanned.length && swapPlanned.length !== swapIds.length) {
    problems.push(`[fdx swap] only ${swapPlanned.join(", ")} would be written — both sides or neither`);
    say(`\n  REFUSED: FDX swap would be half-written (${swapPlanned.join(", ")})`);
  }

  const sections: Record<string, Section[]> = {};
  for (const id of touched) sections[id] = published.find((d) => d._id === id)!.sections ?? [];
  return { changes, already, problems, revs, sections };
}

async function main() {
  console.log(
    `patch-audit-nov27-a (${DRY ? "DRY — nothing written" : "APPLY"}) · groups ${ONLY.size ? [...ONLY].join(",") : GROUPS.join(",")}${SKIP.size ? ` · skip: ${[...SKIP].join(", ")}` : ""}`,
  );
  const first = await plan(true);

  const docs = new Set(first.changes.map((c) => c.docId));
  console.log(`\n— Summary: ${first.changes.length} field(s) in ${docs.size} document(s); already set: ${first.already.length}`);
  console.log(`  ${"group".padEnd(5)} ${"study".padEnd(10)} ${"field".padEnd(58)} before → after`);
  for (const c of first.changes)
    console.log(`  ${c.group.padEnd(5)} ${c.study.padEnd(10)} ${c.label.padEnd(58)} ${c.show[0]} → ${c.show[1]}${c.draftNote ? `  [${c.draftNote}]` : ""}`);
  if (first.already.length) console.log(`  already set: ${first.already.join(", ")}`);

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
  if (p.problems.length) throw new Error(`refusing: ${p.problems.length} item(s) not as expected on re-read`);

  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `audit-nov27-a-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
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
