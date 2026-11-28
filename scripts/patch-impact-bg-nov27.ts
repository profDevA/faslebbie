/**
 * Impact band (`statsSection`) background colour — Israel's final Figma
 * "END DESIGN +DEV 2027" (fr2xqA4MUG62WcbVFQ0xG9) vs the site (QA Q2: "Should
 * the Impact background be the same light green on every study?" — Fas /
 * Israel).
 *
 * Today (read Nov 27): 13 of 17 Impact bands have no Studio colour, so the band
 * is transparent and shows the page's `bg-white` (#ffffff) at every width
 * (`StatsBlock` passes no default to `sectionStyle`). Set: Coral #e3e3db,
 * Experian #f7eef5, Circle #e6ece8 (+ text #171717). Memory Tubes has no Impact
 * band (and none in its Figma frame 32:13169).
 *
 * Figma (band fill read from screenshot pixels of each band node; all 17
 * Impact bands are the shared template — 35M+ / 13pts / 47% on desktop,
 * 75% / 30 / 47% on phones — so only the colour is study-specific):
 *  - desktop #e6ece8: Coral, Experian, Acme, DVA, Census, OC Navigator,
 *    OC Links (42:25713), AR, Design Assist, Circle (44:38766), Miner,
 *    Forever, Chalk;
 *  - desktop #e3e3db: FDX (6:5210), Vuforia Editor (8:39011);
 *  - desktop #d6e0d8: Galderma (6:104605);
 *  - desktop ?: Snapback — section 6:91862 and frames 6:91887 / 6:93653 are
 *    gone from the file (rebuilt?); figma mode leaves Snapback alone;
 *  - every phone band sampled (15) is #e6ece8 (OC Links 6:47092, Circle
 *    6:73194 and Snapback 6:93653 phone frames no longer exist).
 *
 * MODES (required):
 *  --mode=figma   each study's own Figma DESKTOP colour (one Studio field
 *                 serves desktop and phone; phones are #e6ece8 everywhere, so
 *                 FDX / Editor / Galderma phones then differ from their Figma).
 *  --mode=one     one colour for every Impact band (default #e6ece8;
 *                 `--color=#rrggbb` to change it).
 *
 * Text colour is not touched: the band text inherits black from `.cs-root`
 * (`text-black`); Circle stores #171717. Both read fine on these light fills.
 *
 * Safety: sections addressed by `_key`; every field must hold its pinned
 * current value, else the run refuses (a Studio edit since Nov 27). A field
 * already at the target is "already set". Published documents only: an open
 * draft is reported (and whether publishing it would undo a change) and left
 * alone. Re-reads right before writing (refuses if anything moved), backs up
 * the whole `sections` array of every touched document to
 * ../exports/sanity-backups/, commits one transaction (`ifRevisionID` on each
 * document's patch), then reads back. Colours are full Sanity colour objects
 * (`sanityColor`, alpha 1).
 *
 * Plan only (default, or `-- --dry`); write with `-- --apply`.
 * `-- --only=<id>,<id>` limits the studies (ids below, e.g. coral,experian);
 * `-- --skip=<id>,<id>` drops some.
 *
 *   npx sanity exec scripts/patch-impact-bg-nov27.ts --with-user-token -- --mode=figma --dry
 *   npx sanity exec scripts/patch-impact-bg-nov27.ts --with-user-token -- --mode=one --dry
 *   npx sanity exec scripts/patch-impact-bg-nov27.ts --with-user-token -- --mode=one --color=#e6ece8 --apply
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { isDeepStrictEqual } from "node:util";

import { BACKUPS, client as cliClient } from "./lib/structure-nov11";
import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

const client = cliClient.withConfig({ perspective: "raw" });
const APPLY = process.argv.includes("--apply");
const DRY = process.argv.includes("--dry") || !APPLY;
const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const listArg = (name: string) =>
  new Set(
    (arg(name) ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
const MODE = arg("mode");
if (MODE !== "figma" && MODE !== "one") throw new Error("--mode=figma or --mode=one is required");
const ONE_COLOR = (arg("color") ?? "#e6ece8").toLowerCase();
if (!/^#[0-9a-f]{6}$/.test(ONE_COLOR)) throw new Error(`--color: expected #rrggbb, got ${ONE_COLOR}`);
const ONLY = listArg("only");
const SKIP = listArg("skip");

// ---------------------------------------------------------------------------

type Study = {
  id: string;
  slug: string;
  study: string;
  /** statsSection `_key` (read Nov 27). */
  sectionKey: string;
  /** Pinned current appearance.backgroundColor ("#rrggbb", alpha 1); null = unset. */
  from: string | null;
  /** Figma desktop band fill; null = frame not found. */
  figmaDesktop: string | null;
  figmaPhone: string | null;
  source: string;
};

const STUDIES: Study[] = [
  { id: "coral", slug: "coral-health", study: "Coral Health", sectionKey: "dcb43777e88e", from: "#e3e3db", figmaDesktop: "#e6ece8", figmaPhone: "#e6ece8", source: "6:27813 / phone 6:26078" },
  { id: "fdx", slug: "financial-data-exchange", study: "FDX", sectionKey: "79b97c8df4b6", from: null, figmaDesktop: "#e3e3db", figmaPhone: "#e6ece8", source: "6:5210 / phone 6:7232" },
  { id: "experian", slug: "experian-boost", study: "Experian Boost", sectionKey: "c22749be07a0", from: "#f7eef5", figmaDesktop: "#e6ece8", figmaPhone: "#e6ece8", source: "6:11181 / phone 6:13386" },
  { id: "acme", slug: "acme-lending", study: "Acme Lending", sectionKey: "d96a04995391", from: null, figmaDesktop: "#e6ece8", figmaPhone: "#e6ece8", source: "6:18290 / phone 6:20646" },
  { id: "dva", slug: "diamond-valuation-ai", study: "Diamond Valuation", sectionKey: "6678ca221a83", from: null, figmaDesktop: "#e6ece8", figmaPhone: "#e6ece8", source: "6:22768 / phone 6:24520" },
  { id: "census", slug: "2020-us-census-benefit-calculator", study: "US Census", sectionKey: "12144e365a57", from: null, figmaDesktop: "#e6ece8", figmaPhone: "#e6ece8", source: "11:57652 / phone 11:76822" },
  { id: "ocnav", slug: "oc-digital-resource-navigator", study: "OC Navigator", sectionKey: "74a5bbba7656", from: null, figmaDesktop: "#e6ece8", figmaPhone: "#e6ece8", source: "6:40870 / phone 6:42406" },
  { id: "oclinks", slug: "oc-links", study: "OC Links", sectionKey: "e3d3de5a0a4b", from: null, figmaDesktop: "#e6ece8", figmaPhone: null, source: "42:28584 (rebuilt frame 42:25713); phone 6:47092 gone" },
  { id: "ar", slug: "the-ar-handbook", study: "AR Handbook", sectionKey: "e2451f8b346c", from: null, figmaDesktop: "#e6ece8", figmaPhone: "#e6ece8", source: "6:51621 / phone 6:53678" },
  { id: "designassist", slug: "design-assist-ai", study: "Design Assist", sectionKey: "6d2068de29ee", from: null, figmaDesktop: "#e6ece8", figmaPhone: "#e6ece8", source: "6:56235 / phone 6:57995" },
  { id: "circle", slug: "circle", study: "Circle", sectionKey: "96b04346026d", from: "#e6ece8", figmaDesktop: "#e6ece8", figmaPhone: null, source: "44:40089 (rebuilt frame 44:38766); phone 6:73194 gone" },
  { id: "miner", slug: "life-of-a-miner-vr", study: "Life of a Miner", sectionKey: "1e50a4e1ecd9", from: null, figmaDesktop: "#e6ece8", figmaPhone: "#e6ece8", source: "6:75701 (frame 6:75135) / phone 6:76359" },
  { id: "snapback", slug: "snapback-lifestyle", study: "Snapback", sectionKey: "533554d0cfe5", from: null, figmaDesktop: null, figmaPhone: null, source: "section 6:91862, frames 6:91887 / 6:93653 gone from the file" },
  { id: "forever", slug: "forever-a-surfer", study: "Forever a Surfer", sectionKey: "0d9b0af9dc84", from: null, figmaDesktop: "#e6ece8", figmaPhone: "#e6ece8", source: "6:98389 / phone 6:99837" },
  { id: "galderma", slug: "galderma", study: "Galderma", sectionKey: "a36309a0c8e3", from: null, figmaDesktop: "#d6e0d8", figmaPhone: "#e6ece8", source: "6:104605 / phone 6:108436" },
  { id: "editor", slug: "vuforia-expert-capture", study: "Vuforia Editor", sectionKey: "33165559320b", from: null, figmaDesktop: "#e3e3db", figmaPhone: "#e6ece8", source: "8:39011 / phone 6:165434" },
  { id: "chalk", slug: "vuforia-chalk", study: "Vuforia Chalk", sectionKey: "c5b4562b6e7c", from: null, figmaDesktop: "#e6ece8", figmaPhone: "#e6ece8", source: "9:41848 / phone 9:44543" },
];
const IDS = new Set(STUDIES.map((s) => s.id));
for (const x of [...ONLY, ...SKIP]) if (!IDS.has(x)) throw new Error(`--only / --skip: unknown study ${x} (${[...IDS].join(", ")})`);

const FIELD = "appearance.backgroundColor";
const STUDIO = "Impact → Layout & colors → Background color";

// ---------------------------------------------------------------------------

type Section = { _key: string; _type: string } & Record<string, unknown>;
type Doc = { _id: string; _rev: string; slug?: string; title?: string; sections?: Section[] | null };
type Change = {
  id: string;
  docId: string;
  rev: string;
  study: string;
  sectionKey: string;
  path: string;
  before: unknown;
  after: unknown;
  show: [string, string];
  draftNote: string;
};
type Plan = {
  changes: Change[];
  already: string[];
  left: string[];
  problems: string[];
  revs: Record<string, string>;
  sections: Record<string, Section[]>;
};

const hexOf = (v: unknown) => (v && typeof v === "object" ? ((v as { hex?: string }).hex ?? null) : null);
const alphaOf = (v: unknown) => {
  const a = v && typeof v === "object" ? (v as { alpha?: number }).alpha : undefined;
  return typeof a === "number" ? a : 1;
};
const show = (v: unknown) => (v ? `${hexOf(v)}${alphaOf(v) !== 1 ? ` α${alphaOf(v)}` : ""}` : "(unset → page white)");
const matches = (v: unknown, want: string | null) =>
  want === null ? v == null : (hexOf(v) ?? "").toLowerCase() === want.toLowerCase() && Math.abs(alphaOf(v) - 1) < 0.005;

function get(obj: unknown, dotted: string): unknown {
  return dotted.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), obj);
}

function target(s: Study): { to: string | null; why: string } {
  if (MODE === "one") return { to: ONE_COLOR, why: `one colour for all (${ONE_COLOR})` };
  if (!s.figmaDesktop) return { to: null, why: `no Figma colour (${s.source})` };
  return { to: s.figmaDesktop, why: `Figma desktop ${s.figmaDesktop} (${s.source})` };
}

function locate(doc: Doc, s: Study) {
  const secs = (doc.sections ?? []).filter((x) => x._key === s.sectionKey);
  if (secs.length !== 1) return { err: `${secs.length} sections with _key ${s.sectionKey}` } as const;
  if (secs[0]._type !== "statsSection") return { err: `section ${s.sectionKey} is ${secs[0]._type}, expected statsSection` } as const;
  return { sec: secs[0] } as const;
}

function draftNote(draft: Doc | undefined, s: Study, to: string): string {
  if (!draft) return "";
  const loc = locate(draft, s);
  if ("err" in loc) return `draft: ${loc.err}`;
  const v = get(loc.sec, FIELD);
  if (matches(v, to)) return "draft already has the new value";
  if (matches(v, s.from)) return "DRAFT STILL HAS THE OLD VALUE — publishing that draft would undo this fix";
  return `draft has ${show(v)}`;
}

async function readDocs(): Promise<Doc[]> {
  return client.fetch<Doc[]>(`*[_type == "caseStudy"]{ _id, _rev, title, "slug": slug.current, sections }`);
}

async function plan(log: boolean): Promise<Plan> {
  const say = (m: string) => log && console.log(m);
  const all = await readDocs();
  const published = all.filter((d) => !d._id.startsWith("drafts.") && !d._id.startsWith("versions."));
  const draftsById = new Map(all.filter((d) => d._id.startsWith("drafts.")).map((d) => [d._id.slice("drafts.".length), d]));
  const bySlug = new Map<string, Doc>();
  for (const d of published) {
    if (!d.slug) continue;
    if (bySlug.has(d.slug)) throw new Error(`refusing: two published case studies with slug ${d.slug}`);
    bySlug.set(d.slug, d);
  }
  say(`\nPublished case studies: ${published.length}; drafts among them: ${published.filter((d) => draftsById.has(d._id)).length}`);
  const unlisted = published.filter((d) => d.slug && !STUDIES.some((s) => s.slug === d.slug));
  for (const d of unlisted) {
    const n = (d.sections ?? []).filter((x) => x._type === "statsSection").length;
    say(`  not in this script: ${d.slug} (${n} Impact band${n === 1 ? "" : "s"})`);
  }

  const changes: Change[] = [];
  const already: string[] = [];
  const left: string[] = [];
  const problems: string[] = [];
  const revs: Record<string, string> = {};
  const touched = new Set<string>();
  const refuse = (id: string, msg: string) => {
    problems.push(`[${id}] ${msg}`);
    say(`    REFUSED: ${msg}`);
  };

  for (const s of STUDIES) {
    if (ONLY.size && !ONLY.has(s.id)) continue;
    say(`\n  [${s.id}] ${s.study} · statsSection ${s.sectionKey}`);
    if (SKIP.has(s.id)) {
      say(`    SKIPPED by --skip`);
      continue;
    }
    const doc = bySlug.get(s.slug);
    if (!doc) {
      refuse(s.id, `no published case study with slug ${s.slug}`);
      continue;
    }
    const loc = locate(doc, s);
    if ("err" in loc) {
      refuse(s.id, `${doc._id}: ${loc.err}`);
      continue;
    }
    const cur = get(loc.sec, FIELD);
    const text = get(loc.sec, "appearance.textColor");
    const { to, why } = target(s);
    say(`    ${doc._id} rev ${doc._rev} · "${String(loc.sec.sectionTitle ?? "")}" · Studio: ${STUDIO}`);
    say(`    Figma desktop ${s.figmaDesktop ?? "?"} · phone ${s.figmaPhone ?? "?"} · ${s.source}`);
    say(`    text colour: ${text ? show(text) : "(unset → inherits black)"}`);
    if (to === null) {
      say(`    LEFT ALONE: ${why}; now ${show(cur)}`);
      left.push(s.id);
      continue;
    }
    if (matches(cur, to)) {
      say(`    already set: ${show(cur)} — nothing to do`);
      already.push(s.id);
      continue;
    }
    if (!matches(cur, s.from)) {
      refuse(s.id, `sections[_key=="${s.sectionKey}"].${FIELD} is ${show(cur)}, expected ${s.from ?? "(unset)"} (Studio edit since Nov 27?)`);
      continue;
    }
    const after = sanityColor(to, 1);
    const note = draftNote(draftsById.get(doc._id), s, to);
    revs[doc._id] = doc._rev;
    touched.add(doc._id);
    changes.push({
      id: s.id,
      docId: doc._id,
      rev: doc._rev,
      study: s.study,
      sectionKey: s.sectionKey,
      path: `sections[_key=="${s.sectionKey}"].${FIELD}`,
      before: cur ?? null,
      after,
      show: [show(cur), show(after)],
      draftNote: note,
    });
    say(`    ${show(cur)} → ${show(after)}  (${why})`);
    if (note) say(`    ${note}`);
  }

  const sections: Record<string, Section[]> = {};
  for (const id of touched) sections[id] = published.find((d) => d._id === id)!.sections ?? [];
  return { changes, already, left, problems, revs, sections };
}

async function main() {
  console.log(
    `patch-impact-bg-nov27 (${DRY ? "DRY — nothing written" : "APPLY"}) · mode ${MODE}${MODE === "one" ? ` ${ONE_COLOR}` : ""}${ONLY.size ? ` · only: ${[...ONLY].join(", ")}` : ""}${SKIP.size ? ` · skip: ${[...SKIP].join(", ")}` : ""}`,
  );
  const first = await plan(true);

  const docs = new Set(first.changes.map((c) => c.docId));
  console.log(`\n— Summary (mode ${MODE}): ${first.changes.length} field(s) in ${docs.size} document(s); already set: ${first.already.length}; left alone: ${first.left.length}`);
  console.log(`  ${"study".padEnd(18)} ${"section".padEnd(13)} before → after`);
  for (const c of first.changes)
    console.log(`  ${c.study.padEnd(18)} ${c.sectionKey.padEnd(13)} ${c.show[0]} → ${c.show[1]}${c.draftNote ? `  [${c.draftNote}]` : ""}`);
  if (first.already.length) console.log(`  already set: ${first.already.join(", ")}`);
  if (first.left.length) console.log(`  left alone (no Figma colour): ${first.left.join(", ")}`);

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
  const file = join(BACKUPS, `impact-bg-nov27-${MODE}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(
    file,
    JSON.stringify(
      {
        mode: MODE,
        revs: p.revs,
        changes: p.changes.map((c) => ({ id: c.id, _id: c.docId, _rev: c.rev, path: c.path, before: c.before ?? "(unset)", after: c.after })),
        sectionsBefore: p.sections,
      },
      null,
      1,
    ),
  );
  console.log(`\nbackup (whole sections arrays) → ${file}`);

  // One transaction, one patch per document (with ifRevisionID).
  const muts = [...docs].map((id) => {
    const cs = p.changes.filter((c) => c.docId === id);
    return { patch: { id, ifRevisionID: p.revs[id], set: Object.fromEntries(cs.map((c) => [c.path, c.after])) } };
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
    const sec = (now.get(c.docId)?.sections ?? []).find((x) => x._key === c.sectionKey);
    const v = get(sec, FIELD);
    const good = isDeepStrictEqual(v, c.after);
    ok &&= good;
    console.log(`  ${good ? "OK   " : "WRONG"} ${c.docId} ${c.sectionKey}.${FIELD}: ${v === undefined ? "(unset)" : show(v)}`);
  }
  for (const id of docs) console.log(`  ${id} rev ${now.get(id)!._rev}${now.get(`drafts.${id}`) ? ` (draft drafts.${id} untouched)` : ""}`);
  if (!ok) throw new Error("read-back check failed — see above; restore from the backup");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
