/**
 * Israel's close-out tracker (Nov 27), the rows Xian can do in Studio.
 * Sources: docs/reference/israel-final-qa-2026-11-27/ (tracker xlsx, "Final QA"
 * doc comments) and Figma "END DESIGN +DEV 2027" (fr2xqA4MUG62WcbVFQ0xG9).
 * Live sheet rows are the Nov 27 12:09 download (they shift as Israel edits).
 *
 * GROUPS (`-- --only=A,C` runs some of them; default = all):
 *  A  Impact, "Check Figma and match the metrics layout" (rows 41 Experian,
 *     51 Acme, 86 OC Links). Israel's comment: "Impact section does not have a
 *     description before the metrics, check figma". Figma 6:11181 / 6:18290 /
 *     6:46048: title "Impact", then the numbers, no text in between. Clears
 *     `statsSection.body` ("Impact / Outcome Description"). NOTE: all three
 *     texts are GREEN (final) in Ade's copy docs; Acme's doc puts its paragraph
 *     AFTER the numbers ("The figures above…"). The backup keeps the text.
 *  B  My Approach / Design Process colours (rows 152 Miner, 199 Galderma;
 *     138 Circle and 161 Memory Tubes already match Figma → "already set").
 *     Colours read from Figma screenshot pixels (desktop 1440 and phone frames
 *     agree): Galderma 6:104215 band #A8A9D1, panel #CDDFE8 (panel text black,
 *     = the site's automatic choice); Miner 6:75546 band #E3E3DB, panel #906952
 *     (panel text white, = automatic). Circle 6:71554 #E3E3DB / #171717, Memory
 *     Tubes 6:89248 #E3E3DB / #007B76 = live. Written at alpha 1.
 *  C  Hero "Remove the heavy black gradient" → `imageHasGradient: true` (the
 *     site then skips its own dark wash) ONLY where the current desktop AND
 *     mobile art already equal Israel's Figma hero: Galderma (row 195; desktop
 *     6:102165 and phone 6:106225 match the Nov 3 uploads pixel for pixel).
 *     The others wait for Israel's new art (printed in the left-out list).
 *  D  DVA Key Product Experiences (row 69): clear the motionShowcase intro
 *     ("A desktop walkthrough would follow…"). Figma 6:22577 has no intro; the
 *     other flow-stack KPEs have none.
 *  E  Vuforia Editor Expert Capture (row 214) and Versioning & Approval
 *     (row 216): Figma 8:27971 (phone 6:154512) / 8:38993 use the Intervention
 *     Grid, like Speech to Text on the same page (`4756d30b216b`). Each live
 *     Core Experience section is replaced in place by an Intervention Grid:
 *     inserted right after the old section (by `_key`), then the old one is
 *     unset. Appearance copied from Speech to Text (#e6ece8 / #171717); cards =
 *     every image of the old popup tab(s), in order, same assets (no upload),
 *     then any preview screen not in a tab; 6 on the page, "View All". The old
 *     body (if any) becomes the grid intro — flagged for Ade (Figma's intro is
 *     placeholder copy).
 *
 * Safety: sections and items addressed by `_key`; every field must hold its
 * expected current value, else the run refuses (a Studio edit since Nov 27).
 * A field already at the target is "already set". Published documents only: an
 * open draft is reported (and whether publishing it would undo a change) and
 * left alone. Re-reads right before writing (refuses if anything moved), backs
 * up the whole `sections` array of every touched document to
 * ../exports/sanity-backups/, commits one transaction (`ifRevisionID` on the
 * first mutation of each document), then reads back.
 *
 * Plan only (default, or `-- --dry`); write with `-- --apply`.
 * `-- --only=A,B,C,D,E` limits the groups; `-- --skip=<id>,<id>` drops fixes.
 *
 *   npx sanity exec scripts/patch-israel-studio-rows-nov27.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-israel-studio-rows-nov27.ts --with-user-token -- --apply --only=A
 */
import { createHash } from "node:crypto";
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
// Field fixes (groups A–D)

type Kind = "color" | "pt" | "bool";
type Fix = {
  group: Exclude<Group, "E">;
  id: string;
  row: string;
  slug: string;
  study: string;
  sectionKey: string;
  sectionType: string;
  /** Dotted field path inside the section. */
  field: string;
  kind: Kind;
  /** Expected current value: colour "#RRGGBB" / "#RRGGBB@0.4"; pt = plain text ("" = empty); bool null = unset or false. */
  from: string | boolean | null;
  /** Target: colour "#RRGGBB"; null = unset the field. */
  to: string | boolean | null;
  studio: string;
  source: string;
};

const EXPERIAN_IMPACT_INTRO =
  "These are Experian Boost's published results. They reflect the whole product and partnership, not the consent flow alone.";
const ACME_IMPACT_BODY =
  "At launch, Finicity projected that VOIE would verify more than 70 percent of borrowers automatically, compared with 15 to 25 percent for older tools, and that digital verification could cut up to 12 to 14 days from origination. Those were product-wide projections. The figures above come from this implementation, and they belong to the product and the partnership as much as to the design. Freddie Mac also added VOIE to its asset and income modeler in limited release.";
const OC_LINKS_IMPACT_INTRO =
  "Measured by the program after my involvement ended. These are internal figures, and they reflect the platform and the teams running it, not design alone.";
const DVA_KPE_INTRO =
  "A desktop walkthrough would follow one rough stone end to end: a miner scans six angles, watches AI analysis resolve into a value, then submits verified provenance to ROOT.";

const IMPACT_STUDIO = "Impact → Impact / Outcome Description";
const IMPACT_SOURCE = "Israel Final QA: \"Impact section does not have a description before the metrics, check figma\"";
const APPROACH_BG = "My Approach / Design Process → Layout & colors → Background color";
const APPROACH_PANEL = "My Approach / Design Process → Accordion background color";

const FIXES: Fix[] = [
  // ---- A: Impact intro ----
  {
    group: "A",
    id: "experian-impact-intro",
    row: "41",
    slug: "experian-boost",
    study: "Experian Boost",
    sectionKey: "c22749be07a0",
    sectionType: "statsSection",
    field: "body",
    kind: "pt",
    from: EXPERIAN_IMPACT_INTRO,
    to: null,
    studio: IMPACT_STUDIO,
    source: `${IMPACT_SOURCE}; Figma 6:11181 (copy doc GREEN #25 — set Nov 25)`,
  },
  {
    group: "A",
    id: "acme-impact-intro",
    row: "51",
    slug: "acme-lending",
    study: "Acme Lending",
    sectionKey: "d96a04995391",
    sectionType: "statsSection",
    field: "body",
    kind: "pt",
    from: ACME_IMPACT_BODY,
    to: null,
    studio: IMPACT_STUDIO,
    source: `${IMPACT_SOURCE}; Figma 6:18290 (copy doc GREEN #17 puts it after the numbers; Q14)`,
  },
  {
    group: "A",
    id: "oc-links-impact-intro",
    row: "86",
    slug: "oc-links",
    study: "OC Links",
    sectionKey: "e3d3de5a0a4b",
    sectionType: "statsSection",
    field: "body",
    kind: "pt",
    from: OC_LINKS_IMPACT_INTRO,
    to: null,
    studio: IMPACT_STUDIO,
    source: `${IMPACT_SOURCE}; Figma 6:46048 (copy doc GREEN #20)`,
  },
  // ---- B: My Approach / Design Process colours ----
  {
    group: "B",
    id: "circle-approach-band",
    row: "138",
    slug: "circle",
    study: "Circle",
    sectionKey: "357c1e4f812f",
    sectionType: "accordionSection",
    field: "appearance.backgroundColor",
    kind: "color",
    from: "#E3E3DB",
    to: "#E3E3DB",
    studio: APPROACH_BG,
    source: "Figma 6:71554 (phone 6:73194) — already the Figma colour",
  },
  {
    group: "B",
    id: "circle-approach-panel",
    row: "138",
    slug: "circle",
    study: "Circle",
    sectionKey: "357c1e4f812f",
    sectionType: "accordionSection",
    field: "accordionBackgroundColor",
    kind: "color",
    from: "#171717",
    to: "#171717",
    studio: APPROACH_PANEL,
    source: "Figma 6:71554 (phone 6:73194) — already the Figma colour",
  },
  {
    group: "B",
    id: "miner-approach-band",
    row: "152",
    slug: "life-of-a-miner-vr",
    study: "Life of a Miner VR",
    sectionKey: "1567000bf2e5",
    sectionType: "accordionSection",
    field: "appearance.backgroundColor",
    kind: "color",
    from: "#99B29D@0.4",
    to: "#E3E3DB",
    studio: APPROACH_BG,
    source: "Figma 6:75546 (phone 6:75810)",
  },
  {
    group: "B",
    id: "miner-approach-panel",
    row: "152",
    slug: "life-of-a-miner-vr",
    study: "Life of a Miner VR",
    sectionKey: "1567000bf2e5",
    sectionType: "accordionSection",
    field: "accordionBackgroundColor",
    kind: "color",
    from: "#FF5005@0.5",
    to: "#906952",
    studio: APPROACH_PANEL,
    source: "Figma 6:75546 (phone 6:75810); panel text white = automatic for this colour",
  },
  {
    group: "B",
    id: "memory-tubes-approach-band",
    row: "161",
    slug: "memory-tubes",
    study: "Memory Tubes",
    sectionKey: "84408c235c05",
    sectionType: "accordionSection",
    field: "appearance.backgroundColor",
    kind: "color",
    from: "#E3E3DB",
    to: "#E3E3DB",
    studio: APPROACH_BG,
    source: "Figma 6:89248 (phone 6:89857) — already the Figma colour",
  },
  {
    group: "B",
    id: "memory-tubes-approach-panel",
    row: "161",
    slug: "memory-tubes",
    study: "Memory Tubes",
    sectionKey: "84408c235c05",
    sectionType: "accordionSection",
    field: "accordionBackgroundColor",
    kind: "color",
    from: "#007B76",
    to: "#007B76",
    studio: APPROACH_PANEL,
    source: "Figma 6:89248 (phone 6:89857) — already the Figma colour",
  },
  {
    group: "B",
    id: "galderma-approach-band",
    row: "199",
    slug: "galderma",
    study: "Galderma",
    sectionKey: "9509be8eda77",
    sectionType: "accordionSection",
    field: "appearance.backgroundColor",
    kind: "color",
    from: "#99B29D@0.4",
    to: "#A8A9D1",
    studio: APPROACH_BG,
    source: "Figma 6:104215 (phone 6:106225)",
  },
  {
    group: "B",
    id: "galderma-approach-panel",
    row: "199",
    slug: "galderma",
    study: "Galderma",
    sectionKey: "9509be8eda77",
    sectionType: "accordionSection",
    field: "accordionBackgroundColor",
    kind: "color",
    from: "#FF5005@0.5",
    to: "#CDDFE8",
    studio: APPROACH_PANEL,
    source: "Figma 6:104215 (phone 6:106225); panel text black = automatic for this colour",
  },
  // ---- C: hero site wash off (art already = Figma) ----
  {
    group: "C",
    id: "galderma-hero-gradient",
    row: "195",
    slug: "galderma",
    study: "Galderma",
    sectionKey: "b57d579b3097",
    sectionType: "heroSection",
    field: "imageHasGradient",
    kind: "bool",
    from: null,
    to: true,
    studio: "Hero → Images already include the dark gradient",
    source: "Figma desktop 6:102165 + phone 6:106225 = the live gal-hero-desktop.png / gal-hero-mobile.png (Nov 3)",
  },
  // ---- D: DVA KPE intro ----
  {
    group: "D",
    id: "dva-kpe-intro",
    row: "69",
    slug: "diamond-valuation-ai",
    study: "Diamond Valuation AI",
    sectionKey: "9f2d1de9871a",
    sectionType: "motionShowcase",
    field: "intro",
    kind: "pt",
    from: DVA_KPE_INTRO,
    to: null,
    studio: "Key Product Experiences → Intro",
    source: "Figma 6:22577 (no intro; other flow-stack KPEs have none)",
  },
];

// ---------------------------------------------------------------------------
// Section replacements (group E)

type Replace = {
  id: string;
  row: string;
  slug: string;
  study: string;
  oldKey: string;
  oldType: string;
  oldTitle: string;
  /** Pinned state of the old section: popup-tab item count, preview count, body text. */
  expect: { tabItems: number; previewScreens: number; body: string };
  templateKey: string;
  templateTitle: string;
  newTitle: string;
  source: string;
};

const EXPERT_CAPTURE_BODY = [
  "Help authors organize captured content into a procedure they can refine, rather than treating the recording as a finished instruction.",
  "Motion Demonstration",
  "From captured material to a structured procedure in Editor.",
  "Core Experience Flow",
  "The flow connects capture with authoring, giving authors a structure in which to organize and refine the material before publishing.",
].join("\n");

const REPLACES: Replace[] = [
  {
    id: "editor-expert-capture-grid",
    row: "214",
    slug: "vuforia-expert-capture",
    study: "Vuforia Editor",
    oldKey: "cbaf82b3ccfe",
    oldType: "coreExperience",
    oldTitle: "Expert Capture Flow",
    expect: { tabItems: 10, previewScreens: 6, body: EXPERT_CAPTURE_BODY },
    templateKey: "4756d30b216b",
    templateTitle: "Speech to Text",
    newTitle: "Expert Capture Flow",
    source: "Figma 8:27971 (phone 6:154512): Intervention Grid, like Speech to Text 4756d30b216b",
  },
  {
    id: "editor-versioning-grid",
    row: "216",
    slug: "vuforia-expert-capture",
    study: "Vuforia Editor",
    oldKey: "09a243082ea1",
    oldType: "coreExperience",
    oldTitle: "Versioning & Approval",
    expect: { tabItems: 31, previewScreens: 6, body: "" },
    templateKey: "4756d30b216b",
    templateTitle: "Speech to Text",
    newTitle: "Versioning & Approval",
    source: "Figma 8:38993: Intervention Grid, like Speech to Text 4756d30b216b",
  },
];
const GRID_VISIBLE = 6;
const GRID_LABEL = "View All";

/** Left out on purpose — printed with every run so the list travels with the script. */
const LEFT_OUT: [string, string][] = [
  ["C · DVA hero (row 63)", "waiting for Israel's new art: Figma 6:21824 / phone 6:23675 is a different composition (smaller phones, own dark bottom) from the Nov 26 uploads"],
  ["C · OC Navigator hero (row 92)", "waiting: Figma desktop 6:39880 is 1440 × 1004 (live art 1450 × 898) and the phone hero 6:41730 is a different layout"],
  ["C · AR Handbook hero (row 105)", "desktop art = Figma 6:49961, but the phone hero (6:52554, devices larger, dark floor) ≠ live ar-hero-mobile.png (393 × 807); the flag covers both — wait for the phone export"],
  ["C · Vuforia Chalk hero (row 124)", "waiting: Figma 9:39524 phones sit larger / lower than live; no mobile hero in Studio at all; Figma phone 9:42068 is a new stacked layout"],
  ["C · Life of a Miner hero (row 151)", "phone art = Figma 6:75811 exactly; desktop art = the loose frame 6:76736, NOT the 1440 page's hero 6:75137 (woman / photos moved, lighter bottom) — ask Israel which is current"],
  ["C · Forever a Surfer hero (row 175)", "nothing to do: imageHasGradient is already on and the art = Figma 6:98283 / phone (Figma frame 922 tall vs art 876)"],
  ["C · Vuforia Editor hero (row 211)", "phone art = Figma exactly; desktop = Figma 8:27479 except the laptop screen UI (Israel refreshed it) — safe to turn on (dark navy bottom) once Israel confirms or exports the new screen"],
  ["B · Vuforia Chalk My Approach (row 127)", "layout change: centered → split + side body + #BDBDBD panel on #E3E3DB (Figma 9:39595); Figma's side text is Coral's placeholder copy, Ade's doc has no My Approach text"],
  ["B · Vuforia Editor My Approach text (row 212)", "Figma 8:27921 side text is Coral's placeholder copy (\"…patients and providers…\"); Ade's compare doc Q2: maybe the doc's Research & Prototyping text — not final. Colours already = Figma (#99B29D α0.4 renders #D6E0D8; panel #BDBDBD)"],
];

// ---------------------------------------------------------------------------

type Item = { _key: string; _type?: string } & Record<string, unknown>;
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
  path: string;
  label: string;
  before: unknown;
  /** undefined = unset */
  after: unknown;
  show: [string, string];
  draftNote: string;
};
type Swap = {
  id: string;
  row: string;
  docId: string;
  rev: string;
  study: string;
  oldKey: string;
  oldIndex: number;
  oldSummary: string[];
  newSection: Section;
  draftNote: string;
};
type Plan = {
  changes: Change[];
  swaps: Swap[];
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
const ptText = (v: unknown) =>
  Array.isArray(v)
    ? v.map((b) => ((b as { children?: { text?: string }[] }).children ?? []).map((c) => c.text ?? "").join("")).join("\n")
    : "";
const isEmpty = (v: unknown) => v == null || (Array.isArray(v) && v.length === 0) || v === "";
const clip = (s: string, n = 90) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

function get(obj: unknown, dotted: string): unknown {
  return dotted.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), obj);
}

function show(kind: Kind, v: unknown): string {
  if (kind === "color") return v ? `${color(v)}${alphaOf(v) !== 1 ? ` α${alphaOf(v)}` : ""}` : "(empty)";
  if (kind === "pt") return isEmpty(v) ? "(empty)" : JSON.stringify(clip(ptText(v)));
  return v === undefined || v === null ? "(unset)" : JSON.stringify(v);
}

const parseColor = (spec: string) => {
  const [hex, a] = spec.split("@");
  return { hex, alpha: a === undefined ? 1 : Number(a) };
};

function matches(kind: Kind, v: unknown, want: unknown): boolean {
  if (kind === "color") {
    if (typeof want !== "string") return v == null && want == null;
    const w = parseColor(want);
    return (color(v) ?? "").toLowerCase() === w.hex.toLowerCase() && Math.abs(alphaOf(v) - w.alpha) < 0.005;
  }
  if (kind === "pt") return want === null || want === "" ? isEmpty(v) : ptText(v) === want;
  if (want === null) return v == null || v === false;
  return v === want;
}

function locate(doc: Doc, key: string, type: string) {
  const secs = (doc.sections ?? []).filter((s) => s._key === key);
  if (secs.length !== 1) return { err: `${secs.length} sections with _key ${key}` } as const;
  if (secs[0]._type !== type) return { err: `section ${key} is ${secs[0]._type}, expected ${type}` } as const;
  return { sec: secs[0], index: (doc.sections ?? []).indexOf(secs[0]) } as const;
}

function fixDraftNote(draft: Doc | undefined, fix: Fix): string {
  if (!draft) return "";
  const loc = locate(draft, fix.sectionKey, fix.sectionType);
  if ("err" in loc) return `draft: ${loc.err}`;
  const v = get(loc.sec, fix.field);
  if (matches(fix.kind, v, fix.to)) return "draft already has the new value";
  if (matches(fix.kind, v, fix.from)) return "DRAFT STILL HAS THE OLD VALUE — publishing that draft would undo this fix";
  return `draft has ${show(fix.kind, v)}`;
}

/** Deterministic key for the new grid, so the dry run and the apply plan compare equal. */
const newKeyFor = (oldKey: string) => createHash("sha1").update(`israel-nov27:${oldKey}`).digest("hex").slice(0, 12);

type ImageValue = { _type?: string; asset?: { _ref?: string } } & Record<string, unknown>;
const refOf = (img: unknown) => (img as ImageValue | undefined)?.asset?._ref;

/** Cards from the old Core Experience: popup tab items in order, then preview screens not in a tab. */
function cardsFrom(sec: Section): { items: Item[]; err?: string } {
  const items: Item[] = [];
  const seenRefs = new Set<string>();
  const add = (src: Item, from: string) => {
    const ref = refOf(src.image);
    if (!ref) return `${from} ${src._key} has no image asset`;
    if (seenRefs.has(ref)) return undefined;
    seenRefs.add(ref);
    const img = src.image as ImageValue;
    const image: Record<string, unknown> = { _type: "image", asset: { _type: "reference", _ref: ref } };
    if (img.crop) image.crop = img.crop;
    if (img.hotspot) image.hotspot = img.hotspot;
    const card: Item = { _key: src._key, _type: "showcaseItem", image };
    if (typeof src.caption === "string" && src.caption.trim()) card.caption = src.caption;
    items.push(card);
    return undefined;
  };
  for (const tab of (sec.popupTabs as Item[] | undefined) ?? [])
    for (const it of (tab.items as Item[] | undefined) ?? []) {
      const e = add(it, `popupTabs[${tab._key}] item`);
      if (e) return { items, err: e };
    }
  for (const it of (sec.previewScreens as Item[] | undefined) ?? []) {
    const e = add(it, "previewScreens item");
    if (e) return { items, err: e };
  }
  const keys = items.map((i) => i._key);
  if (new Set(keys).size !== keys.length) return { items, err: "duplicate card _keys" };
  return { items };
}

async function readDocs(): Promise<Doc[]> {
  return client.fetch<Doc[]>(`*[_type == "caseStudy"]{ _id, _rev, title, "slug": slug.current, sections }`);
}

async function plan(log: boolean): Promise<Plan> {
  const say = (s: string) => log && console.log(s);
  const all = await readDocs();
  const published = all.filter((d) => !d._id.startsWith("drafts.") && !d._id.startsWith("versions."));
  const draftsById = new Map(all.filter((d) => d._id.startsWith("drafts.")).map((d) => [d._id.slice("drafts.".length), d]));
  const versions = all.filter((d) => d._id.startsWith("versions."));
  const bySlug = new Map<string, Doc>();
  for (const d of published) {
    if (!d.slug) continue;
    if (bySlug.has(d.slug)) throw new Error(`refusing: two published case studies with slug ${d.slug}`);
    bySlug.set(d.slug, d);
  }
  const studySlugs = new Set([...FIXES.map((f) => f.slug), ...REPLACES.map((r) => r.slug)]);
  const drafts = published.filter((d) => d.slug && studySlugs.has(d.slug) && draftsById.has(d._id));
  say(`\nPublished case studies: ${published.length}; drafts among the studies in this script: ${drafts.length}${versions.length ? `; release versions: ${versions.length}` : ""}`);
  for (const d of drafts) say(`  draft: ${d.slug} — drafts.${d._id} rev ${draftsById.get(d._id)!._rev}`);

  const changes: Change[] = [];
  const swaps: Swap[] = [];
  const already: string[] = [];
  const problems: string[] = [];
  const revs: Record<string, string> = {};
  const touched = new Set<string>();
  const refuse = (id: string, msg: string) => {
    problems.push(`[${id}] ${msg}`);
    say(`    REFUSED: ${msg}`);
  };

  for (const group of GROUPS.filter((g) => g !== "E")) {
    const fixes = FIXES.filter((f) => f.group === group);
    say(`\n— Group ${group}${wanted(group) ? "" : " (not selected by --only)"}`);
    if (!wanted(group)) continue;
    for (const fix of fixes) {
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
      const loc = locate(doc, fix.sectionKey, fix.sectionType);
      if ("err" in loc) {
        refuse(fix.id, `${doc._id}: ${loc.err}`);
        continue;
      }
      const cur = get(loc.sec, fix.field);
      const path = `sections[_key=="${fix.sectionKey}"].${fix.field}`;
      say(`    ${doc._id} rev ${doc._rev} · ${fix.sectionType} ${fix.sectionKey} "${String(loc.sec.sectionTitle ?? "")}" · ${fix.field}`);
      say(`    Studio: ${fix.studio}`);
      say(`    source: ${fix.source}`);
      if (matches(fix.kind, cur, fix.to)) {
        say(`    already set: ${show(fix.kind, cur)} — nothing to do`);
        already.push(fix.id);
        continue;
      }
      if (!matches(fix.kind, cur, fix.from)) {
        const want =
          fix.kind === "pt" ? JSON.stringify(clip(String(fix.from ?? ""))) : fix.kind === "color" ? String(fix.from) : show("bool", fix.from);
        refuse(fix.id, `${path} is ${show(fix.kind, cur)}, expected ${want} (Studio edit since Nov 27?)`);
        continue;
      }
      const after =
        fix.to === null
          ? undefined
          : fix.kind === "color"
            ? sanityColor(parseColor(String(fix.to)).hex.toLowerCase(), parseColor(String(fix.to)).alpha)
            : fix.to;
      const note = fixDraftNote(draftsById.get(doc._id), fix);
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
        path,
        label: `${fix.sectionType} ${fix.sectionKey}.${fix.field}`,
        before: cur ?? null,
        after,
        show: [show(fix.kind, cur), after === undefined ? "(unset)" : show(fix.kind, after)],
        draftNote: note,
      });
      say(`    ${show(fix.kind, cur)} → ${after === undefined ? "(unset)" : show(fix.kind, after)}`);
      if (note) say(`    ${note}`);
    }
  }

  say(`\n— Group E${wanted("E") ? "" : " (not selected by --only)"}`);
  if (wanted("E")) {
    for (const r of REPLACES) {
      say(`\n  [${r.id}] ${r.study} · row ${r.row}`);
      say(`    source: ${r.source}`);
      if (SKIP.has(r.id)) {
        say(`    SKIPPED by --skip`);
        continue;
      }
      const doc = bySlug.get(r.slug);
      if (!doc) {
        refuse(r.id, `no published case study with slug ${r.slug}`);
        continue;
      }
      const newKey = newKeyFor(r.oldKey);
      const secs = doc.sections ?? [];
      const hasOld = secs.some((s) => s._key === r.oldKey);
      const done = secs.find((s) => s._key === newKey);
      if (!hasOld && done?._type === "interventionGrid") {
        say(`    already set: ${doc._id} has interventionGrid ${newKey} "${String(done.sectionTitle ?? "")}" and no ${r.oldKey} — nothing to do`);
        already.push(r.id);
        continue;
      }
      if (done) {
        refuse(r.id, `${doc._id} already has a section with the new _key ${newKey} while ${r.oldKey} still exists`);
        continue;
      }
      const old = locate(doc, r.oldKey, r.oldType);
      if ("err" in old) {
        refuse(r.id, `${doc._id}: ${old.err}`);
        continue;
      }
      const tpl = locate(doc, r.templateKey, "interventionGrid");
      if ("err" in tpl) {
        refuse(r.id, `${doc._id} template: ${tpl.err}`);
        continue;
      }
      if (tpl.sec.sectionTitle !== r.templateTitle) {
        refuse(r.id, `template ${r.templateKey} title is ${JSON.stringify(tpl.sec.sectionTitle)}, expected ${JSON.stringify(r.templateTitle)}`);
        continue;
      }
      const sec = old.sec;
      const tabs = (sec.popupTabs as Item[] | undefined) ?? [];
      const tabItems = tabs.reduce((n, t) => n + ((t.items as unknown[] | undefined)?.length ?? 0), 0);
      const previews = (sec.previewScreens as unknown[] | undefined)?.length ?? 0;
      const body = ptText(sec.body);
      const pinned: string[] = [];
      if (sec.sectionTitle !== r.oldTitle) pinned.push(`title ${JSON.stringify(sec.sectionTitle)} (expected ${JSON.stringify(r.oldTitle)})`);
      if (tabItems !== r.expect.tabItems) pinned.push(`${tabItems} popup tab items (expected ${r.expect.tabItems})`);
      if (previews !== r.expect.previewScreens) pinned.push(`${previews} preview screens (expected ${r.expect.previewScreens})`);
      if (body !== r.expect.body) pinned.push(`body ${JSON.stringify(clip(body))} (expected ${JSON.stringify(clip(r.expect.body))})`);
      if (pinned.length) {
        refuse(r.id, `${doc._id} ${r.oldKey} changed since Nov 27: ${pinned.join("; ")}`);
        continue;
      }
      const cards = cardsFrom(sec);
      if (cards.err) {
        refuse(r.id, `${doc._id} ${r.oldKey}: ${cards.err}`);
        continue;
      }
      const allKeys = new Set(secs.map((s) => s._key));
      if (allKeys.has(newKey)) {
        refuse(r.id, `new _key ${newKey} collides with an existing section`);
        continue;
      }
      const newSection: Section = {
        _key: newKey,
        _type: "interventionGrid",
        sectionTitle: r.newTitle,
        ...(isEmpty(sec.body) ? {} : { introBody: structuredClone(sec.body) }),
        items: cards.items,
        initialVisibleCount: GRID_VISIBLE,
        readMoreLabel: GRID_LABEL,
        appearance: structuredClone(tpl.sec.appearance),
      };
      const oldSummary = [
        `${r.oldType} ${r.oldKey} "${String(sec.sectionTitle)}" at sections[${old.index}] (of ${secs.length})`,
        `layoutVariant ${String(sec.layoutVariant)}, previewColumns ${String(sec.previewColumns)}, viewMoreLabel ${JSON.stringify(sec.viewMoreLabel)}, popupItemsBeforeViewMore ${String(sec.popupItemsBeforeViewMore)}`,
        `appearance bg ${show("color", get(sec, "appearance.backgroundColor"))} text ${show("color", get(sec, "appearance.textColor"))}; previewAppearance tile ${show("color", get(sec, "previewAppearance.tileBackgroundColor"))}`,
        `previewScreens ${previews}; popupTabs ${tabs.map((t) => `"${String(t.label)}" ${(t.items as unknown[] | undefined)?.length ?? 0} items`).join(", ")}`,
        `body: ${body ? JSON.stringify(body) : "(empty)"}`,
        `template: interventionGrid ${r.templateKey} "${r.templateTitle}" appearance bg ${show("color", get(tpl.sec, "appearance.backgroundColor"))} text ${show("color", get(tpl.sec, "appearance.textColor"))}`,
      ];
      const draft = draftsById.get(doc._id);
      const draftNote = draft
        ? (draft.sections ?? []).some((s) => s._key === r.oldKey)
          ? "DRAFT STILL HAS THE OLD SECTION — publishing that draft would undo this"
          : "draft has no old section"
        : "";
      revs[doc._id] = doc._rev;
      touched.add(doc._id);
      swaps.push({ id: r.id, row: r.row, docId: doc._id, rev: doc._rev, study: r.study, oldKey: r.oldKey, oldIndex: old.index, oldSummary, newSection, draftNote });
      say(`    ${doc._id} rev ${doc._rev}`);
      say(`    OLD (removed after the insert):`);
      for (const l of oldSummary) say(`      ${l}`);
      say(`    NEW (inserted right after ${r.oldKey}, so it takes sections[${old.index}]):`);
      say(printSection(newSection, "      "));
      if (newSection.introBody) say(`    ⚑ intro = the old body, verbatim (incl. two h3 sub-heads) — for Ade to trim / replace (Figma's intro is placeholder copy)`);
      if (draftNote) say(`    ${draftNote}`);
    }
  }

  const sections: Record<string, Section[]> = {};
  for (const id of touched) sections[id] = published.find((d) => d._id === id)!.sections ?? [];
  return { changes, swaps, already, problems, revs, sections };
}

/** Section JSON with each card on one line. */
function printSection(s: Section, indent: string): string {
  const { items, ...rest } = s as Section & { items?: Item[] };
  const head = JSON.stringify(rest, (k, v) => (k === "hsl" || k === "hsv" || k === "rgb" ? undefined : v), 1)
    .split("\n")
    .map((l) => indent + l);
  head[head.length - 2] += ",";
  head.splice(head.length - 1, 0,`${indent} "items": [  // ${items?.length ?? 0} cards`, ...(items ?? []).map((it) => `${indent}   ${JSON.stringify(it)},`), `${indent} ]`);
  return head.join("\n");
}

async function main() {
  console.log(
    `patch-israel-studio-rows-nov27 (${DRY ? "DRY — nothing written" : "APPLY"}) · groups ${ONLY.size ? [...ONLY].join(",") : "A,B,C,D,E"}${SKIP.size ? ` · skip: ${[...SKIP].join(", ")}` : ""}`,
  );
  const first = await plan(true);

  const docs = new Set([...first.changes.map((c) => c.docId), ...first.swaps.map((s) => s.docId)]);
  console.log(`\n— Summary: ${first.changes.length} field(s) + ${first.swaps.length} section swap(s) in ${docs.size} document(s); already set: ${first.already.length}`);
  console.log(`  ${"group".padEnd(5)} ${"study".padEnd(22)} ${"row".padEnd(4)} ${"field".padEnd(58)} before → after`);
  for (const c of first.changes)
    console.log(`  ${c.group.padEnd(5)} ${c.study.padEnd(22)} ${c.row.padEnd(4)} ${c.label.padEnd(58)} ${c.show[0]} → ${c.show[1]}${c.draftNote ? `  [${c.draftNote}]` : ""}`);
  for (const s of first.swaps)
    console.log(
      `  ${"E".padEnd(5)} ${s.study.padEnd(22)} ${s.row.padEnd(4)} ${`sections[${s.oldIndex}] ${s.oldKey}`.padEnd(58)} coreExperience → interventionGrid ${s.newSection._key} "${String(s.newSection.sectionTitle)}" (${(s.newSection.items as unknown[]).length} cards)${s.draftNote ? `  [${s.draftNote}]` : ""}`,
    );
  if (first.already.length) console.log(`  already set: ${first.already.join(", ")}`);

  console.log(`\n— Left out on purpose (${LEFT_OUT.length})`);
  for (const [what, why] of LEFT_OUT) console.log(`  - ${what}: ${why}`);

  if (first.problems.length) {
    console.log(`\n— REFUSED (${first.problems.length}): nothing is written until each is resolved or dropped with --skip=<id> / --only`);
    for (const m of first.problems) console.log(`  - ${m}`);
    if (!DRY) throw new Error(`refusing: ${first.problems.length} item(s) not as expected (see above)`);
  }

  if (!first.changes.length && !first.swaps.length) return console.log("\nnothing to do");
  if (DRY) return console.log(`\ndry run — nothing written (re-run with -- --apply to write; production)`);

  // Re-read right before writing; refuse if anything moved since the plan above.
  const p = await plan(false);
  const sig = (x: Plan) =>
    JSON.stringify([x.revs, x.changes.map((c) => [c.docId, c.rev, c.path, c.before, c.after]), x.swaps.map((s) => [s.docId, s.rev, s.oldKey, s.newSection])]);
  if (sig(p) !== sig(first)) throw new Error("refusing: the documents changed while planning — run again");

  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `israel-studio-rows-nov27-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(
    file,
    JSON.stringify(
      {
        revs: p.revs,
        changes: p.changes.map((c) => ({ id: c.id, _id: c.docId, _rev: c.rev, path: c.path, before: c.before, after: c.after ?? "(unset)" })),
        swaps: p.swaps.map((s) => ({ id: s.id, _id: s.docId, _rev: s.rev, oldKey: s.oldKey, oldIndex: s.oldIndex, newSection: s.newSection })),
        sectionsBefore: p.sections,
      },
      null,
      1,
    ),
  );
  console.log(`\nbackup (whole sections arrays) → ${file}`);

  // One transaction. Per document: field set / unset (first, with ifRevisionID),
  // then for each swap an insert after the old key and an unset of the old key
  // (separate patches: within one patch Sanity applies unset before insert).
  type Mut = { patch: Record<string, unknown> };
  const muts: Mut[] = [];
  for (const id of docs) {
    const rev = p.revs[id];
    let guarded = false;
    const guard = () => (guarded ? {} : ((guarded = true), { ifRevisionID: rev }));
    const cs = p.changes.filter((c) => c.docId === id);
    const set = Object.fromEntries(cs.filter((c) => c.after !== undefined).map((c) => [c.path, c.after]));
    const unset = cs.filter((c) => c.after === undefined).map((c) => c.path);
    if (cs.length)
      muts.push({ patch: { id, ...guard(), ...(Object.keys(set).length ? { set } : {}), ...(unset.length ? { unset } : {}) } });
    for (const s of p.swaps.filter((x) => x.docId === id)) {
      muts.push({ patch: { id, ...guard(), insert: { after: `sections[_key=="${s.oldKey}"]`, items: [s.newSection] } } });
      muts.push({ patch: { id, unset: [`sections[_key=="${s.oldKey}"]`] } });
    }
  }
  const res = await client.mutate(muts as never, { visibility: "sync" });
  console.log(
    `✓ committed ${p.changes.length} field(s) + ${p.swaps.length} swap(s) in ${docs.size} document(s), one transaction ${(res as { transactionId?: string }).transactionId ?? ""} at ${new Date().toISOString()}`,
  );

  // Read back.
  console.log(`\nread back:`);
  const now = new Map((await readDocs()).map((d) => [d._id, d]));
  let ok = true;
  for (const c of p.changes) {
    const sec = (now.get(c.docId)?.sections ?? []).find((s) => s._key === c.sectionKey);
    const v = get(sec, c.path.slice(`sections[_key=="${c.sectionKey}"].`.length));
    const good = c.after === undefined ? v === undefined : isDeepStrictEqual(v, c.after);
    ok &&= good;
    console.log(`  ${good ? "OK   " : "WRONG"} ${c.docId} ${c.label}: ${v === undefined ? "(unset)" : JSON.stringify(v).slice(0, 100)}`);
  }
  for (const s of p.swaps) {
    const secs = now.get(s.docId)?.sections ?? [];
    const idx = secs.findIndex((x) => x._key === s.newSection._key);
    const good = idx === s.oldIndex && !secs.some((x) => x._key === s.oldKey) && isDeepStrictEqual(secs[idx], s.newSection);
    ok &&= good;
    console.log(`  ${good ? "OK   " : "WRONG"} ${s.docId} sections[${idx}] = ${secs[idx]?._type} ${s.newSection._key}; ${s.oldKey} ${secs.some((x) => x._key === s.oldKey) ? "STILL THERE" : "gone"}`);
  }
  for (const id of docs) console.log(`  ${id} rev ${now.get(id)!._rev}${now.get(`drafts.${id}`) ? ` (draft drafts.${id} untouched)` : ""}`);
  if (!ok) throw new Error("read-back check failed — see above; restore from the backup");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
