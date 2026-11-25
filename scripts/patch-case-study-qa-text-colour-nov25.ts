/**
 * Case-study QA (Nov 24–25): the Studio text / colour fixes that have a
 * definite target value from a source of truth — Ade's copy docs (GREEN rows,
 * docs/reference/ade-case-studies-2026-11-23/compare/<slug>.md), Fas's QA list
 * in the master doc, or Israel's Figma. Source list:
 * docs/meetings/2026-11-24-case-study-qa.md § "Content hand-over" (the
 * [Studio] items) and § US Census "Sanity changes". Items that wait on a
 * question to Fas / Israel, need an upload, or have no GREEN text are not in
 * here (the dry run prints the skipped list with reasons).
 *
 * FIXES (each is one field; `id` is what `--skip=` takes):
 *  - Reflection heading → "Reflections" (copy doc GREEN): Experian, DVA, FDE,
 *    US Census. Not Coral (the master says "Reflection"; Coral has no GREEN /
 *    RED doc) and not Circle (its doc heading is RED, a different title).
 *  - Core Experience band title "Core Experience Flows" → "Core Experience
 *    Flow": Coral, Experian (Fas's QA in the master, Coral list: "The title,
 *    'Core Experience Flow,' will probably stay consistent. Of course, other
 *    case studies…"; Experian's doc heading says the same, in RED).
 *  - Experian Overview side panel `#5454B1` → `#33356E` and Key Product
 *    Experiences band `#282866` → `#33356E` (Figma `1:20637`, QA E1 / E2).
 *  - Acme My Approach band → `#E3E3DB` at full alpha (Figma; what 13 other
 *    studies store, X8). Stored now: `#99B29D` at 40 % alpha, which renders as
 *    the `#D6E0D8` the QA measured. (Galderma, Miner, Chalk and Editor store the
 *    same 40 % sage; they aren't in the QA yet, so they're left alone.)
 *  - Colours are written at alpha 1.
 *  - Experian Impact: stat "65%" suffix "%" → "%+" and the intro paragraph
 *    (copy doc GREEN #25 / #26).
 *  - US Census Design Process item "Summary of Findings" → "Summary & Findings"
 *    (copy doc GREEN #9).
 *  - Project Highlights "Grid gap (px)" 14 → 18 on every grid-layout highlights
 *    band (Figma: 18 on the Coral / Experian / Acme / Census frames; QA Census
 *    #28). The gap is drawn on the desktop grid only (lg+); phones keep 8 / 6.
 *
 * Safety: every field is addressed by `_key` (section, and item where there is
 * one) and must hold the expected current value, else the run refuses (a
 * Studio edit since the QA read). A field that already holds the target is
 * "already set". Colours are written as full color objects (sanityColor: hex +
 * hsl / hsv / rgb) at alpha 1; an expected colour may carry an alpha
 * ("#99B29D@0.4"). Published documents only: an
 * open draft is reported (with whether its value at each path still equals the
 * old one, i.e. whether publishing that draft would undo the fix) and left
 * alone. Re-reads right before writing (refuses if anything moved), backs the
 * touched sections up to ../exports/sanity-backups/, commits one transaction
 * with `ifRevisionID` on every document, then reads back.
 *
 * Plan only (default, or `-- --dry`); write with `-- --apply`. `-- --skip=a,b`
 * drops fixes by id (highlights ids are `highlights-gap:<slug>:<sectionKey>`,
 * or `highlights-gap` for all of them). Undo: the values in the backup JSON,
 * or retype them in Studio.
 *
 *   npx sanity exec scripts/patch-case-study-qa-text-colour-nov25.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-case-study-qa-text-colour-nov25.ts --with-user-token -- --apply
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { isDeepStrictEqual } from "node:util";

import { BACKUPS, client as cliClient } from "./lib/structure-nov11";
import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

const client = cliClient.withConfig({ perspective: "raw" });
const APPLY = process.argv.includes("--apply");
const DRY = process.argv.includes("--dry") || !APPLY;
const SKIP = new Set(
  (process.argv.find((a) => a.startsWith("--skip="))?.slice("--skip=".length) ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);

type Kind = "string" | "color" | "number" | "pt";
type Fix = {
  id: string;
  slug: string;
  study: string;
  sectionKey: string;
  sectionType: string;
  /** Item inside the section, by `_key` (e.g. a stat or accordion item). */
  item?: { array: string; key: string; check?: Record<string, unknown> };
  /** Dotted field path inside the section (or item). */
  field: string;
  kind: Kind;
  from: unknown;
  to: unknown;
  studio: string;
  source: string;
};

// Experian Impact intro, copy doc GREEN #25 (Experian_Boost_Case_Study_Final_v3.docx,
// straight apostrophe as in the .docx). Fixed `_key`s so the dry run and the apply
// plan compare equal.
const EXPERIAN_IMPACT_INTRO =
  "These are Experian Boost's published results. They reflect the whole product and partnership, not the consent flow alone.";
const EXPERIAN_IMPACT_BODY = [
  {
    _type: "block",
    _key: "qa25impact01",
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: "qa25impact02", text: EXPERIAN_IMPACT_INTRO, marks: [] }],
  },
];

const FIXES: Fix[] = [
  // ---- Reflections (copy doc GREEN) ----
  {
    id: "experian-reflections",
    slug: "experian-boost",
    study: "Experian Boost",
    sectionKey: "1d5d8864c15a",
    sectionType: "reflectionSection",
    field: "reflectionHeading",
    kind: "string",
    from: "Reflection",
    to: "Reflections",
    studio: "Reflection → Reflection Heading",
    source: "copy doc GREEN (compare/experian-boost.md #28)",
  },
  {
    id: "dva-reflections",
    slug: "diamond-valuation-ai",
    study: "Diamond Valuation AI",
    sectionKey: "e89aa9678b16",
    sectionType: "reflectionSection",
    field: "reflectionHeading",
    kind: "string",
    from: "Reflection",
    to: "Reflections",
    studio: "Reflection → Reflection Heading",
    source: "copy doc GREEN (compare/diamond-valuation-ai.md #23; QA D12)",
  },
  {
    id: "fde-reflections",
    slug: "financial-data-exchange",
    study: "Financial Data Exchange",
    sectionKey: "7af6b72d2c54",
    sectionType: "reflectionSection",
    field: "reflectionHeading",
    kind: "string",
    from: "Reflection",
    to: "Reflections",
    studio: "Reflection → Reflection Heading",
    source: "copy doc GREEN (compare/financial-data-exchange.md #24; QA hand-over FDE 5)",
  },
  {
    id: "census-reflections",
    slug: "2020-us-census-benefit-calculator",
    study: "US Census",
    sectionKey: "3467c99eac09",
    sectionType: "reflectionSection",
    field: "reflectionHeading",
    kind: "string",
    from: "Reflection",
    to: "Reflections",
    studio: "Reflection → Reflection Heading",
    source: "copy doc GREEN (compare/2020-us-census-benefit-calculator.md #17; QA Census #29)",
  },
  // ---- Core Experience band title ----
  {
    id: "coral-ce-title",
    slug: "coral-health",
    study: "Coral Health",
    sectionKey: "4d399122fc83",
    sectionType: "coreExperience",
    field: "sectionTitle",
    kind: "string",
    from: "Core Experience Flows",
    to: "Core Experience Flow",
    studio: "Core Experience → Section Heading",
    source: "Fas's QA in the master doc (Coral list, item 4: \"will probably stay consistent\"); compare/coral-health.md #9",
  },
  {
    id: "experian-ce-title",
    slug: "experian-boost",
    study: "Experian Boost",
    sectionKey: "152f47eb6c29",
    sectionType: "coreExperience",
    field: "sectionTitle",
    kind: "string",
    from: "Core Experience Flows",
    to: "Core Experience Flow",
    studio: "Core Experience → Section Heading",
    source: "Fas's QA (master, Coral list item 4) + Experian doc heading (RED, compare #17)",
  },
  // ---- Colours (Figma) ----
  {
    id: "experian-overview-panel",
    slug: "experian-boost",
    study: "Experian Boost",
    sectionKey: "2670df368bd9",
    sectionType: "overviewSection",
    field: "sideImageBackgroundColor",
    kind: "color",
    from: "#5454B1",
    to: "#33356E",
    studio: "Overview → Side feature image background color",
    source: "Figma 1:20637 (QA E1)",
  },
  {
    id: "experian-kpe-band",
    slug: "experian-boost",
    study: "Experian Boost",
    sectionKey: "65b19252b7f5",
    sectionType: "motionShowcase",
    field: "appearance.backgroundColor",
    kind: "color",
    from: "#282866",
    to: "#33356E",
    studio: "Key Product Experiences → Layout & colors → Background color",
    source: "Figma 1:20637 (QA E2)",
  },
  {
    id: "acme-approach-band",
    slug: "acme-lending",
    study: "Acme Lending",
    sectionKey: "134afb0afeda",
    sectionType: "accordionSection",
    field: "appearance.backgroundColor",
    kind: "color",
    // Stored #99B29D at 40 % alpha = the #D6E0D8 the QA measured on white.
    from: "#99B29D@0.4",
    to: "#E3E3DB",
    studio: "My Approach / Design Process → Layout & colors → Background color",
    source: "Figma (Acme 1:32265; = Census / FDE live) (QA Acme #2, X8)",
  },
  // ---- Experian Impact (copy doc GREEN) ----
  {
    id: "experian-65-suffix",
    slug: "experian-boost",
    study: "Experian Boost",
    sectionKey: "c22749be07a0",
    sectionType: "statsSection",
    item: { array: "items", key: "d1585c80ab5d", check: { value: 65 } },
    field: "suffix",
    kind: "string",
    from: "%",
    to: "%+",
    studio: "Impact → Metric Items → 65 → Value Suffix",
    source: "copy doc GREEN (compare/experian-boost.md #26)",
  },
  {
    id: "experian-impact-intro",
    slug: "experian-boost",
    study: "Experian Boost",
    sectionKey: "c22749be07a0",
    sectionType: "statsSection",
    field: "body",
    kind: "pt",
    from: null,
    to: EXPERIAN_IMPACT_BODY,
    studio: "Impact → Impact / Outcome Description",
    source: "copy doc GREEN (compare/experian-boost.md #25)",
  },
  // ---- US Census Design Process item (copy doc GREEN) ----
  {
    id: "census-summary-findings",
    slug: "2020-us-census-benefit-calculator",
    study: "US Census",
    sectionKey: "792006d6a7c7",
    sectionType: "accordionSection",
    item: { array: "items", key: "9b756baa5a7c" },
    field: "title",
    kind: "string",
    from: "Summary of Findings",
    to: "Summary & Findings",
    studio: "My Approach / Design Process → Items → Summary of Findings → Title",
    source: "copy doc GREEN (compare/2020-us-census-benefit-calculator.md #9; QA Census #30)",
  },
];

const HIGHLIGHT_GAP_FROM = 14;
const HIGHLIGHT_GAP_TO = 18;

/** Left out on purpose — printed with every run so the list travels with the script. */
const SKIPPED: [string, string][] = [
  ["Coral reflectionHeading → Reflections", "no GREEN source: the master (Coral's only doc, no green / red marks) says \"Reflection\" = live"],
  ["Circle reflectionHeading (live lower-case \"reflections\")", "doc heading is RED and a different title (\"Choosing a Person Is Not Yet Trust\"); no GREEN \"Reflections\""],
  ["Circle Lorem ipsum (KPE carousel bodies a8c6c2bc5f1b, Early prototyping 08d5984410a4)", "replacement text in the doc is RED; Early prototyping waits on Q19 (fill or delete the band)"],
  ["Experian \"See the Impact\" caption (previewScreens c9b7958a9bcf)", "no source has the missing first word"],
  ["Impact backgrounds → #E6ECE8 (Coral, Experian, Acme, FDE, DVA, Census)", "waits on Q2 / Census #25 (#E6ECE8 vs #E3E3DB, which studies)"],
  ["Coral \"Visit Site\"; Experian confidentiality note", "Q10 (keep or remove)"],
  ["Coral Research slide order (showcaseGallery 2e3859d535c4)", "a reorder, not text / colour; Figma's order includes slides not in Studio (upload)"],
  ["Coral Marketing band layout (desktopMotionShowcase 27c4684f40c6)", "Q11, and needs its code half"],
  ["Coral overviewSection f56b8c341dbf.copyPaddingTop", "only after the Census #7 code fix"],
  ["Acme KPE / demo title + caption (desktopMotionShowcase fe7249e5f0c6)", "GREEN, but compare doc: \"may be Ade's working label… final once Fas confirms\"; tied to Q13 (which KPE Figma is current)"],
  ["Acme closing heading / Next Steps", "doc heading RED"],
  ["Acme Impact intro (statsSection d96a04995391.body)", "Q14 (keep / move / drop)"],
  ["FDE 20M+ → 20M (statsSection 79b97c8df4b6 item f9dd48fd8c75)", "GREEN, but compare doc: \"could be Ade trimming; confirm before changing\" (the note still says 53M+)"],
  ["FDE Next Steps heading / copy", "RED"],
  ["FDE \"My Approach and Design Process\" heading", "GREEN, but the doc template's combined heading; compare doc: \"confirm with Fas rather than change\""],
  ["Circle CE gap (coreExperience 9ce2395ae7f8 contentGap)", "Q1 / X7"],
  ["DVA KPE intro / captions (compare #14–18)", "doc text PURPLE (meaning unknown), not GREEN; screens need re-export"],
  ["US Census stat suffixes Families / Priorities / Pre-Census Pilot", "Q9: someone emptied them in Studio on Nov 24 21:35 UTC; \"Pre-Census Pilot\" has no number"],
  ["US Census CE labels Programme → Program", "GREEN on red shading (meaning unknown, SUMMARY Q1)"],
  ["US Census Research intro h3s → KPE band; KPE intro; CE grid / padding", "questions (#19, #23) or code-dependent (#12, #13, #22)"],
  ["Every [upload] item (heroes, motions, CE screens, highlights tiles / mats, research artifacts)", "uploads are the team's (Fas, Nov 25)"],
];

// ---------------------------------------------------------------------------

type Item = { _key: string; _type?: string } & Record<string, unknown>;
type Section = { _key: string; _type: string } & Record<string, unknown>;
type Doc = { _id: string; _rev: string; slug?: string; title?: string; sections?: Section[] | null };
type Change = {
  id: string;
  docId: string;
  rev: string;
  study: string;
  sectionKey: string;
  path: string;
  label: string;
  before: unknown;
  after: unknown;
  show: [string, string];
  source: string;
  draftNote: string;
};
type Plan = {
  changes: Change[];
  already: string[];
  drafts: string[];
  problems: string[];
  revs: Record<string, string>;
  sections: Record<string, Section[]>;
};

const color = (v: unknown) => (v && typeof v === "object" ? ((v as { hex?: string }).hex ?? null) : null);
const alphaOf = (v: unknown) => {
  const a = v && typeof v === "object" ? (v as { alpha?: number }).alpha : undefined;
  return typeof a === "number" ? a : 1;
};
const ptText = (v: unknown) =>
  Array.isArray(v)
    ? v
        .map((b) => ((b as { children?: { text?: string }[] }).children ?? []).map((c) => c.text ?? "").join(""))
        .join("\n")
    : "";
const isEmpty = (v: unknown) => v == null || (Array.isArray(v) && v.length === 0) || v === "";

function get(obj: unknown, dotted: string): unknown {
  return dotted.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), obj);
}

/** Display form of a field value. */
function show(kind: Kind, v: unknown): string {
  if (kind === "color") return v ? `${color(v)}${alphaOf(v) !== 1 ? ` α${alphaOf(v)}` : ""}` : "(empty)";
  if (kind === "pt") return isEmpty(v) ? "(empty)" : JSON.stringify(ptText(v));
  return v === undefined || v === null ? "(empty)" : JSON.stringify(v);
}

/** Colour spec "#RRGGBB" (alpha 1) or "#RRGGBB@0.4". */
const parseColor = (spec: string) => {
  const [hex, a] = spec.split("@");
  return { hex, alpha: a === undefined ? 1 : Number(a) };
};

function matches(kind: Kind, v: unknown, want: unknown): boolean {
  if (kind === "color") {
    if (typeof want !== "string") return false;
    const w = parseColor(want);
    return (color(v) ?? "").toLowerCase() === w.hex.toLowerCase() && Math.abs(alphaOf(v) - w.alpha) < 0.005;
  }
  if (kind === "pt") return want === null ? isEmpty(v) : ptText(v) === ptText(want);
  return v === want;
}

function locate(doc: Doc, fix: Pick<Fix, "sectionKey" | "sectionType" | "item">) {
  const secs = (doc.sections ?? []).filter((s) => s._key === fix.sectionKey);
  if (secs.length !== 1) return { err: `${secs.length} sections with _key ${fix.sectionKey}` } as const;
  const sec = secs[0];
  if (sec._type !== fix.sectionType) return { err: `section ${fix.sectionKey} is ${sec._type}, expected ${fix.sectionType}` } as const;
  const base = `sections[_key=="${fix.sectionKey}"]`;
  if (!fix.item) return { sec, target: sec as Record<string, unknown>, base } as const;
  const arr = (sec[fix.item.array] as Item[] | undefined) ?? [];
  const hits = arr.filter((it) => it?._key === fix.item!.key);
  if (hits.length !== 1) return { err: `${hits.length} ${fix.item.array} items with _key ${fix.item.key} in ${fix.sectionKey}` } as const;
  for (const [k, v] of Object.entries(fix.item.check ?? {}))
    if (hits[0][k] !== v) return { err: `item ${fix.item.key}.${k} is ${JSON.stringify(hits[0][k])}, expected ${JSON.stringify(v)}` } as const;
  return { sec, target: hits[0] as Record<string, unknown>, base: `${base}.${fix.item.array}[_key=="${fix.item.key}"]` } as const;
}

function draftNote(draft: Doc | undefined, fix: Fix): string {
  if (!draft) return "";
  const loc = locate(draft, fix);
  if ("err" in loc) return `draft: ${loc.err}`;
  const v = get(loc.target, fix.field);
  if (matches(fix.kind, v, fix.to)) return "draft already has the new value";
  if (matches(fix.kind, v, fix.from)) return "DRAFT STILL HAS THE OLD VALUE — publishing that draft would undo this fix";
  return `draft has ${show(fix.kind, v)}`;
}

async function readDocs(): Promise<Doc[]> {
  return client.fetch<Doc[]>(
    `*[_type == "caseStudy"]{ _id, _rev, title, "slug": slug.current, sections }`,
  );
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

  const drafts = published
    .filter((d) => draftsById.has(d._id))
    .map((d) => `${d.slug} (${d._id}) — draft drafts.${d._id} rev ${draftsById.get(d._id)!._rev}`);
  say(`\nPublished case studies: ${published.length}; with an open draft: ${drafts.length}`);
  for (const d of drafts) say(`  draft: ${d}`);

  const changes: Change[] = [];
  const already: string[] = [];
  const problems: string[] = [];
  const revs: Record<string, string> = {};
  const touched = new Map<string, Set<string>>();

  const add = (doc: Doc, c: Omit<Change, "docId" | "rev">) => {
    revs[doc._id] = doc._rev;
    if (!touched.has(doc._id)) touched.set(doc._id, new Set());
    touched.get(doc._id)!.add(c.sectionKey);
    changes.push({ ...c, docId: doc._id, rev: doc._rev });
  };

  say(`\n— Fixed list (${FIXES.length} fields)`);
  for (const fix of FIXES) {
    if (SKIP.has(fix.id)) {
      say(`\n  [${fix.id}] SKIPPED by --skip`);
      continue;
    }
    const doc = bySlug.get(fix.slug);
    if (!doc) {
      problems.push(`[${fix.id}] no published case study with slug ${fix.slug}`);
      say(`\n  [${fix.id}] REFUSED: no published case study with slug ${fix.slug}`);
      continue;
    }
    const loc = locate(doc, fix);
    if ("err" in loc) {
      problems.push(`[${fix.id}] ${doc._id}: ${loc.err}`);
      say(`\n  [${fix.id}] REFUSED: ${doc._id}: ${loc.err}`);
      continue;
    }
    const cur = get(loc.target, fix.field);
    const path = `${loc.base}.${fix.field}`;
    const secTitle = (loc.sec.sectionTitle as string | undefined) ?? (loc.sec.reflectionHeading as string | undefined) ?? "";
    say(`\n  [${fix.id}] ${fix.study} · ${doc._id} rev ${doc._rev}`);
    say(`    ${fix.sectionType} ${fix.sectionKey} "${secTitle}"${fix.item ? ` → ${fix.item.array}[${fix.item.key}]` : ""} · ${fix.field}`);
    say(`    Studio: ${fix.studio}`);
    say(`    source: ${fix.source}`);
    if (matches(fix.kind, cur, fix.to)) {
      say(`    already set: ${show(fix.kind, cur)} — nothing to do`);
      already.push(fix.id);
      continue;
    }
    if (!matches(fix.kind, cur, fix.from)) {
      const msg = `${path} is ${show(fix.kind, cur)}, expected ${fix.kind === "pt" ? "(empty)" : show(fix.kind === "color" ? "string" : fix.kind, fix.from)} (Studio edit since the QA?)`;
      problems.push(`[${fix.id}] ${doc._id}: ${msg}`);
      say(`    REFUSED: ${msg}`);
      continue;
    }
    const after =
      // Lower-case hex, as the Studio colour picker stores it.
      fix.kind === "color" ? sanityColor(parseColor(String(fix.to)).hex.toLowerCase(), parseColor(String(fix.to)).alpha) : fix.to;
    const note = draftNote(draftsById.get(doc._id), fix);
    add(doc, {
      id: fix.id,
      study: fix.study,
      sectionKey: fix.sectionKey,
      path,
      label: `${fix.sectionType} ${fix.sectionKey}${fix.item ? `.${fix.item.array}[${fix.item.key}]` : ""}.${fix.field}`,
      before: cur ?? null,
      after,
      show: [show(fix.kind, cur), show(fix.kind, after)],
      source: fix.source,
      draftNote: note,
    });
    say(`    ${show(fix.kind, cur)} → ${show(fix.kind, after)}`);
    if (note) say(`    ${note}`);
  }

  // ---- Highlights grid gap on every grid-layout highlights band ----
  say(`\n— Project Highlights "Grid gap (px)" ${HIGHLIGHT_GAP_FROM} → ${HIGHLIGHT_GAP_TO} (grid layout only; source: Figma, QA Census #28 / Q12)`);
  if (SKIP.has("highlights-gap")) say(`  SKIPPED by --skip=highlights-gap`);
  else {
    const sorted = [...published].sort((a, b) => String(a.slug).localeCompare(String(b.slug)));
    for (const doc of sorted) {
      for (const sec of doc.sections ?? []) {
        if (sec._type !== "highlightReel") continue;
        const id = `highlights-gap:${doc.slug}:${sec._key}`;
        const layout = (sec.layout as string | undefined) ?? "grid";
        const gap = sec.gridGap;
        const cells = Array.isArray(sec.cells) ? sec.cells.length : 0;
        const head = `  ${doc.slug} · highlightReel ${sec._key} "${sec.sectionTitle ?? ""}" (${layout}, ${cells} cell(s))`;
        if (layout !== "grid") {
          say(`${head}: not a grid — gap unused, left alone`);
          continue;
        }
        if (SKIP.has(id)) {
          say(`${head}: SKIPPED by --skip`);
          continue;
        }
        if (gap === HIGHLIGHT_GAP_TO) {
          say(`${head}: already ${HIGHLIGHT_GAP_TO}`);
          already.push(id);
          continue;
        }
        if (gap !== HIGHLIGHT_GAP_FROM) {
          say(`${head}: gridGap ${JSON.stringify(gap ?? null)} (not ${HIGHLIGHT_GAP_FROM}) — left alone, report it`);
          continue;
        }
        const fix = { sectionKey: sec._key, sectionType: "highlightReel", field: "gridGap", kind: "number" as Kind, from: HIGHLIGHT_GAP_FROM, to: HIGHLIGHT_GAP_TO };
        const note = draftNote(draftsById.get(doc._id), { ...fix, id, slug: doc.slug!, study: doc.slug!, studio: "", source: "" });
        add(doc, {
          id,
          study: String(doc.title ?? doc.slug),
          sectionKey: sec._key,
          path: `sections[_key=="${sec._key}"].gridGap`,
          label: `highlightReel ${sec._key}.gridGap`,
          before: gap,
          after: HIGHLIGHT_GAP_TO,
          show: [String(gap), String(HIGHLIGHT_GAP_TO)],
          source: "Figma (Coral 25:24281 / Census 261:47859 / Experian / Acme: gap 18)",
          draftNote: note,
        });
        say(`${head} · ${doc._id} rev ${doc._rev}: ${gap} → ${HIGHLIGHT_GAP_TO}${note ? ` — ${note}` : ""}`);
      }
    }
  }

  // Info only: the CE titles and reflection headings on every study, so the
  // consistency claims above can be checked at a glance.
  say(`\n— Info: Core Experience titles / Reflection headings on all published studies (after this patch)`);
  const patched = new Map(changes.map((c) => [`${c.docId}|${c.path}`, c.after]));
  for (const doc of [...published].sort((a, b) => String(a.slug).localeCompare(String(b.slug)))) {
    const ce = (doc.sections ?? [])
      .filter((s) => s._type === "coreExperience")
      .map((s) => String(patched.get(`${doc._id}|sections[_key=="${s._key}"].sectionTitle`) ?? s.sectionTitle ?? "(none)"));
    const refl = (doc.sections ?? [])
      .filter((s) => s._type === "reflectionSection")
      .map((s) => String(patched.get(`${doc._id}|sections[_key=="${s._key}"].reflectionHeading`) ?? s.reflectionHeading ?? "(empty)"));
    say(`  ${String(doc.slug).padEnd(36)} CE: ${ce.length ? ce.join(" | ") : "—"} · Reflection: ${refl.length ? refl.join(" | ") : "—"}`);
  }
  say(`\n— Info: My Approach / Design Process band background (accordionSection appearance.backgroundColor) on all published studies, before this patch`);
  for (const doc of [...published].sort((a, b) => String(a.slug).localeCompare(String(b.slug)))) {
    const acc = (doc.sections ?? [])
      .filter((s) => s._type === "accordionSection")
      .map((s) => `${s._key} ${show("color", get(s, "appearance.backgroundColor"))}`);
    if (acc.length) say(`  ${String(doc.slug).padEnd(36)} ${acc.join(" | ")}`);
  }

  const sections: Record<string, Section[]> = {};
  for (const [docId, keys] of touched) {
    const doc = published.find((d) => d._id === docId)!;
    sections[docId] = (doc.sections ?? []).filter((s) => keys.has(s._key));
  }
  return { changes, already, drafts, problems, revs, sections };
}

async function main() {
  console.log(`patch-case-study-qa-text-colour-nov25 (${DRY ? "DRY — nothing written" : "APPLY"})${SKIP.size ? ` · skip: ${[...SKIP].join(", ")}` : ""}`);
  const first = await plan(true);

  console.log(`\n— Summary: ${first.changes.length} field(s) would change in ${Object.keys(first.revs).length} document(s); already set: ${first.already.length}`);
  for (const c of first.changes)
    console.log(`  ${c.study.padEnd(26)} ${c.label.padEnd(64)} ${c.show[0]} → ${c.show[1]}${c.draftNote ? `  [${c.draftNote}]` : ""}`);

  console.log(`\n— Left out on purpose (${SKIPPED.length})`);
  for (const [what, why] of SKIPPED) console.log(`  - ${what}: ${why}`);

  if (first.problems.length) {
    console.log(`\n— REFUSED (${first.problems.length}): current value is not the expected one. Nothing is written until each is resolved or dropped with --skip=<id>`);
    for (const m of first.problems) console.log(`  - ${m}`);
    if (!DRY) throw new Error(`refusing: ${first.problems.length} field(s) not as expected (see above)`);
  }

  if (!first.changes.length) return console.log("\nnothing to do");
  if (DRY) return console.log(`\ndry run — nothing written (re-run with -- --apply to write)`);

  // Re-read right before writing; refuse if anything moved since the plan above.
  const p = await plan(false);
  const sig = (x: Plan) => JSON.stringify([x.revs, x.changes.map((c) => [c.docId, c.rev, c.path, c.before, c.after])]);
  if (sig(p) !== sig(first)) throw new Error("refusing: the documents changed while planning — run again");

  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `case-study-qa-text-colour-nov25-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
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
  console.log(`\nbackup → ${file}`);

  const byDoc = new Map<string, Change[]>();
  for (const c of p.changes) byDoc.set(c.docId, [...(byDoc.get(c.docId) ?? []), c]);
  const muts = [...byDoc].map(([id, cs]) => ({
    patch: { id, ifRevisionID: cs[0].rev, set: Object.fromEntries(cs.map((c) => [c.path, c.after])) },
  }));
  const res = await client.mutate(muts as never, { visibility: "sync" });
  console.log(`✓ committed ${p.changes.length} field(s) in ${muts.length} document(s), one transaction ${(res as { transactionId?: string }).transactionId ?? ""} at ${new Date().toISOString()}`);

  // Read back.
  console.log(`\nread back:`);
  const docs = new Map((await readDocs()).map((d) => [d._id, d]));
  let ok = true;
  for (const c of p.changes) {
    const doc = docs.get(c.docId)!;
    const sec = (doc.sections ?? []).find((s) => s._key === c.sectionKey);
    const rel = c.path.slice(`sections[_key=="${c.sectionKey}"].`.length);
    const m = rel.match(/^(\w+)\[_key=="(\w+)"\]\.(.+)$/);
    const target = m ? ((sec?.[m[1]] as Item[] | undefined) ?? []).find((it) => it._key === m[2]) : sec;
    const now = get(target, m ? m[3] : rel);
    const good = isDeepStrictEqual(now, c.after);
    ok &&= good;
    console.log(`  ${good ? "OK   " : "WRONG"} ${c.docId} ${c.label}: ${JSON.stringify(now).slice(0, 120)}`);
  }
  for (const id of byDoc.keys()) console.log(`  ${id} rev ${docs.get(id)!._rev}${docs.get(`drafts.${id}`) ? ` (draft drafts.${id} untouched)` : ""}`);
  if (!ok) throw new Error("read-back check failed — see above; restore from the backup");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
