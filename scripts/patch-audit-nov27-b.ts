/**
 * Visual audit Nov 27 (B): per-band Studio values only — no shared defaults.
 * Figma "END DESIGN +DEV 2027" (fr2xqA4MUG62WcbVFQ0xG9), read Nov 27.
 *
 * GROUPS (`-- --only=A,C` runs some of them; default = all):
 *  A  AR Handbook · Project Highlights `a4e2a4f7e078` (Israel row 112 "2 × 3
 *     grid: Done", live still one card): Figma 6:51634 = 3 × 2 grid, 1226
 *     wide, tiles 397 × 265, 18 gap, no caption under the tiles (the text is in
 *     the tile art), tile matte #BACCBD on the #658181 band.
 *     Layout single → grid, Grid gap 18 (every other grid study), Grid cell
 *     matte #BACCBD (Vuforia Chalk's value), captions off (no other grid study
 *     has them), and the persona board removed (not one of Figma's six).
 *     The four stills left are already in Figma order (tiles 1, 2, 3, 5).
 *     MISSING (uploads, not here): Figma tiles 4 (6:51733 "Object Detection in
 *     View App") and 6 (6:52111 "RealWear Demo / Vuforia View app") = Sakib's
 *     videos (green boxes); and the four stills are the old single-card art
 *     (full-bleed photo + caption bar), not Figma's tile art — exports of
 *     6:51825 / 6:51925 / 6:51639 / 6:52020 (397 × 267, matte included).
 *  B  Design Interventions / Early prototyping plates (Figma 1055 × 659 at
 *     x 192; OC Links 1017 × 678 at x 215 — live 873 / 762): Studio
 *     "Container max width (px)" on each band. AR 6:50296 / 6:50443 /
 *     6:50840 / 6:51254; Circle 44:39939 (rebuilt Nov 27); OC Links 42:28547
 *     (rebuilt Nov 27). Circle's "Max width" `full` ignores the container
 *     width (it grows with the window: 873 @1440, 1152 @1920) → `wide`.
 *  C  Coral Health · Marketing Website `27c4684f40c6` (Figma 6:27642): laptop
 *     1046 × 654 at x 196 (live 1176 × 720 at x 132) → container 1046.
 *     Optional C2 "Band layout" → "Large device, caption below": caption at
 *     x 770, 616 wide @1440 (Figma 794 / ~592; live 927 / 445), but it also
 *     moves the laptop down 52 px (pt 108 vs 56) — see the preview notes.
 *  D  Forever Phase 1 Strategy `54a29fe1eb90` + Design Interventions
 *     `87823bd589a8` (Figma 6:98342 / 6:98368: 1043 × 651 at x 199, caption
 *     below at x 721 / 777, 616 / 560 wide) and Snapback Design Interventions
 *     `ad1837b4457b` (Figma 6:92473: 1008 × 629 at x 216, caption below at
 *     x 786, 608 wide); live 873 × 532, caption at the right. Container max
 *     width 1043 / 1008 + Band layout "Large device, caption below" (the
 *     layout Editor Demo and Miner VR use: caption x 770, 616 wide @1440).
 *     The sliders keep their arrows / pager and Snapback's one-frame size.
 *
 * Safety: sections and array items addressed by `_key`; every field must hold
 * its expected current value, else the run refuses (a Studio edit since
 * Nov 27). A field already at the target is "already set". Published documents
 * only: an open draft is reported (and whether publishing it would undo a
 * change) and left alone. Re-reads right before writing (refuses if anything
 * moved), backs up the whole `sections` array of every touched document to
 * ../exports/sanity-backups/, commits one transaction (`ifRevisionID` on each
 * document's patch), then reads back.
 *
 * Plan only (default, or `-- --dry`); write with `-- --apply`.
 * `-- --only=A,B,C,D` limits the groups; `-- --skip=<id>,<id>` drops fixes.
 *
 *   npx sanity exec scripts/patch-audit-nov27-b.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-audit-nov27-b.ts --with-user-token -- --apply --only=B
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

/** `remove` = drop the keyed array item itself (`from` = its caption, pinned). */
type Kind = "color" | "str" | "num" | "remove";
type Fix = {
  group: Group;
  id: string;
  slug: string;
  study: string;
  sectionKey: string;
  sectionType: string;
  /** Item inside a keyed array of the section (e.g. highlightReel `cells`). */
  item?: { array: string; key: string };
  /** Dotted field path inside the section (or the item); "" for `remove`. */
  field: string;
  kind: Kind;
  /** Expected current value: colour "#RRGGBB"; str / num as string; null = empty / unset. */
  from: string | null;
  /** Target: colour "#RRGGBB"; str; num as string; null = unset the field (or remove the item). */
  to: string | null;
  studio: string;
  source: string;
};

const AR = { slug: "the-ar-handbook", study: "AR Handbook" } as const;
const AR_HL = "a4e2a4f7e078";
const AR_HL_TILES: [string, string, string][] = [
  ["539d0b763689", "Delivery Item Identification", "tile 1 (welder; Figma text \"Disrupt the $2bn…\")"],
  ["f95f7188a50e", "Correct Work Item Placement", "tile 2 (workbench)"],
  ["135164b5ae2f", "Delivery Item Identification", "tile 3 (warehouse)"],
  ["33be2160b65a", "Disrupt the $2bn service part catalogue Industry", "tile 5 (catalogue book)"],
];
const WIDTH = "Layout & colors → Container max width (px)";

const FIXES: Fix[] = [
  // ---- A: AR Handbook Project Highlights → 3 × 2 grid ----
  {
    group: "A",
    id: "ar-hl-layout",
    ...AR,
    sectionKey: AR_HL,
    sectionType: "highlightReel",
    field: "layout",
    kind: "str",
    from: "single",
    to: "grid",
    studio: "Project Highlights → Layout → Grid (3×2 cells)",
    source: "Figma 6:51634 (desktop 3 × 2) / 6:53691 (phone 2 × 3, draft tiles)",
  },
  {
    group: "A",
    id: "ar-hl-gap",
    ...AR,
    sectionKey: AR_HL,
    sectionType: "highlightReel",
    field: "gridGap",
    kind: "num",
    from: null,
    to: "18",
    studio: "Project Highlights → Grid gap (px)",
    source: "Figma 6:51637: tiles at x 0 / 414.7 / 829.3, rows 0 / 282.4 (397 × 265) → 17.6; every grid study stores 18",
  },
  {
    group: "A",
    id: "ar-hl-matte",
    ...AR,
    sectionKey: AR_HL,
    sectionType: "highlightReel",
    field: "gridCellMatteColor",
    kind: "color",
    from: null,
    to: "#BACCBD",
    studio: "Project Highlights → Grid cell matte color",
    source: "Figma 6:51634 tile matte pixels #BACCBD (Vuforia Chalk's grids use the same)",
  },
  ...AR_HL_TILES.map(
    ([key, caption, what], i): Fix => ({
      group: "A",
      id: `ar-hl-caption-${i + 1}`,
      ...AR,
      sectionKey: AR_HL,
      sectionType: "highlightReel",
      item: { array: "cells", key },
      field: "caption",
      kind: "str",
      from: caption,
      to: null,
      studio: `Project Highlights → Multiple Highlights → ${what} → Caption / Description (clear)`,
      source: "Figma 6:51634: no caption under the tiles (text is in the tile art); no other grid study has captions",
    }),
  ),
  {
    group: "A",
    id: "ar-hl-drop-persona",
    ...AR,
    sectionKey: AR_HL,
    sectionType: "highlightReel",
    item: { array: "cells", key: "815cbd936810" },
    field: "",
    kind: "remove",
    from: "Cross-functional impact by persona",
    to: null,
    studio: "Project Highlights → Multiple Highlights → \"Cross-functional impact by persona\" → Remove",
    source: "not one of Figma 6:51634's six tiles (slots 4 / 6 = Sakib's videos); kept in the backup",
  },
  // ---- B: plates at Figma width ----
  ...(
    [
      ["ar-di1-width", AR, "6fffafce479c", null, "1055", "Design Interventions (1st, still)", "Figma 6:50296 Overlay+Shadow 1055.4 × 659.1 at x 192 (live 762: no Max width → 762 default)"],
      ["ar-di2-width", AR, "5d0fa1404225", null, "1055", "Design Interventions (Detect slider)", "Figma 6:50443 1055.4 × 659.1 at x 192 (live 873 = wide)"],
      ["ar-di3-width", AR, "7cc6c31b5a68", null, "1055", "Design Interventions (Label & Train slider)", "Figma 6:50840 1055.4 × 659.1 at x 192 (live 873)"],
      ["ar-di4-width", AR, "9b06e1e84f71", null, "1055", "Design Interventions (Classify slider)", "Figma 6:51254 1055.4 × 659.1 at x 192 (live 873)"],
      ["circle-ep-width", { slug: "circle", study: "Circle" }, "08d5984410a4", null, "1055", "Early prototyping", "Figma 44:39939 (Israel, Nov 27) Overlay+Shadow 1054.7 × 658.7 at x 192.8 (live 873 @1440)"],
      ["oc-links-di-width", { slug: "oc-links", study: "OC Links" }, "826b99d238fd", null, "1017", "Design Interventions (video)", "Figma 42:28547 (Israel, Nov 27) frame 1016.5 × 678.1 at x 215.2 (live 873)"],
    ] as const
  ).map(
    ([id, s, sectionKey, from, to, band, source]): Fix => ({
      group: "B",
      id,
      ...s,
      sectionKey,
      sectionType: "desktopMotionShowcase",
      field: "appearance.containerMaxWidth",
      kind: "num",
      from,
      to,
      studio: `${band} → ${WIDTH}`,
      source,
    }),
  ),
  {
    group: "B",
    id: "circle-ep-variant",
    slug: "circle",
    study: "Circle",
    sectionKey: "08d5984410a4",
    sectionType: "desktopMotionShowcase",
    field: "appearance.maxWidth",
    kind: "str",
    from: "full",
    to: "wide",
    studio: "Early prototyping → Layout & colors → Max width: Full → Wide",
    source: "`full` ignores Container max width (fluid 873 @1440 / 1152 @1920); `wide` caps at the container width",
  },
  // ---- C: Coral Marketing Website ----
  {
    group: "C",
    id: "coral-mw-width",
    slug: "coral-health",
    study: "Coral Health",
    sectionKey: "27c4684f40c6",
    sectionType: "desktopMotionShowcase",
    field: "appearance.containerMaxWidth",
    kind: "num",
    from: null,
    to: "1046",
    studio: `Marketing Website → ${WIDTH}`,
    source: "Figma 6:27642 laptop 1046 × 654 at x 196 (live 1176 × 720 at x 132, the Marketing Website default)",
  },
  // ---- D: Forever / Snapback showcases: Figma size + caption below ----
  ...(
    [
      ["forever-p1", { slug: "forever-a-surfer", study: "Forever" }, "54a29fe1eb90", "Phase 1 Strategy", "1043", "Figma 6:98342: image 1042.7 × 651.2 at x 198.6; caption below at x 721, 616 wide"],
      ["forever-di", { slug: "forever-a-surfer", study: "Forever" }, "87823bd589a8", "Design Interventions", "1043", "Figma 6:98368: image 1042.7 × 651.2 at x 198.6; caption below at x 777, 560 wide"],
      ["snapback-di", { slug: "snapback-lifestyle", study: "Snapback" }, "ad1837b4457b", "Design Interventions", "1008", "Figma 6:92473 (audit C metadata): frame 1008 × 629.5 at x 216; caption below at x 786, 608 wide"],
    ] as const
  ).flatMap(([id, s, sectionKey, band, width, source]): Fix[] => [
    {
      group: "D",
      id: `${id}-width`,
      ...s,
      sectionKey,
      sectionType: "desktopMotionShowcase",
      field: "appearance.containerMaxWidth",
      kind: "num",
      from: null,
      to: width,
      studio: `${band} → ${WIDTH}`,
      source: `${source} (live 873 × 532, Max width wide)`,
    },
    {
      group: "D",
      id: `${id}-caption-below`,
      ...s,
      sectionKey,
      sectionType: "desktopMotionShowcase",
      field: "layoutVariant",
      kind: "str",
      from: "single",
      to: "captionBelow",
      studio: `${band} → Band layout → Large device, caption below (as Editor Demo / Miner VR)`,
      source: `${source}; the variant: x 770, 616 wide @1440 (live caption right, x 927, 445 wide)`,
    },
  ]),
  {
    group: "C",
    id: "coral-mw-caption-below",
    slug: "coral-health",
    study: "Coral Health",
    sectionKey: "27c4684f40c6",
    sectionType: "desktopMotionShowcase",
    field: "layoutVariant",
    kind: "str",
    from: null,
    to: "captionBelow",
    studio: "Marketing Website → Band layout → Large device, caption below (OPTIONAL — see notes)",
    source: "Figma 6:27642 caption x 793, ~592 wide, top 825 (live x 927, 445 wide); the variant puts it at x 770, 616 wide",
  },
];

/** Not Studio values (printed for the record). */
const LEFT_OUT: [string, string][] = [
  ["AR Highlights tiles 4 and 6", "Sakib's videos (Figma 6:51733 \"Object Detection in View App\", 6:52111 \"RealWear Demo/Vuforia View app\"); add as items 4 and 6 in Studio (Highlight Reel / Animation Asset) — the grid plays them muted in the tile"],
  ["AR Highlights tile art", "the 4 stills are the old single-card frames (full-bleed photo + caption bar); Figma's tiles are 397 × 267 with the #BACCBD matte, photo + teal text panel: export 6:51825, 6:51925, 6:51639, 6:52020 (Israel / Ade) and swap the frames"],
  ["AR Highlights inset", "the grid code draws every tile flush (inset fields are ignored since Figma 4556:38244); Figma's matte is part of the tile art, so the exports above carry it"],
  ["AR Highlights phone", "Figma 6:53691 is a draft (tile 3 twice, a blank 6th tile); the site's phone grid is 2 columns of the same six"],
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
  /** Path inside the section, for read-back. */
  inner: string;
  path: string;
  label: string;
  before: unknown;
  /** undefined = unset / remove */
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
  if (kind === "remove") return v === undefined ? "(no item)" : `item "${clip(String((v as Item).caption ?? ""), 40)}"`;
  return isEmpty(v) ? "(unset)" : JSON.stringify(typeof v === "string" ? clip(v) : v);
}

function matches(kind: Kind, v: unknown, want: string | null): boolean {
  if (kind === "color") {
    if (want === null) return v == null;
    return (color(v) ?? "").toLowerCase() === want.toLowerCase() && Math.abs(alphaOf(v) - 1) < 0.005;
  }
  if (kind === "num") return want === null ? v == null : v === Number(want);
  if (kind === "remove") return want === null ? v === undefined : !!v && (v as Item).caption === want;
  return want === null || want === "" ? isEmpty(v) : v === want;
}

const innerPath = (fix: Fix) =>
  fix.item
    ? `${fix.item.array}[_key=="${fix.item.key}"]${fix.field ? `.${fix.field}` : ""}`
    : fix.field;

function locate(doc: Doc, fix: Fix) {
  const secs = (doc.sections ?? []).filter((s) => s._key === fix.sectionKey);
  if (secs.length !== 1) return { err: `${secs.length} sections with _key ${fix.sectionKey}` } as const;
  if (secs[0]._type !== fix.sectionType) return { err: `section ${fix.sectionKey} is ${secs[0]._type}, expected ${fix.sectionType}` } as const;
  if (fix.item) {
    const arr = secs[0][fix.item.array];
    const n = Array.isArray(arr) ? (arr as Item[]).filter((x) => x._key === fix.item!.key).length : 0;
    // A removed item is "already done", not an error.
    if (n !== 1 && !(fix.kind === "remove" && n === 0))
      return { err: `${n} ${fix.item.array} items with _key ${fix.item.key} in ${fix.sectionKey}` } as const;
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
        refuse(fix.id, `${path} is ${show(fix.kind, cur)}, expected ${fix.kind === "color" ? String(fix.from) : fix.kind === "remove" ? `item "${fix.from}"` : show("str", fix.from)} (Studio edit since Nov 27?)`);
        continue;
      }
      const after =
        fix.to === null
          ? undefined
          : fix.kind === "color"
            ? sanityColor(fix.to.toLowerCase(), 1)
            : fix.kind === "num"
              ? Number(fix.to)
              : fix.to;
      const note = draftNote(draftsById.get(doc._id), fix);
      revs[doc._id] = doc._rev;
      touched.add(doc._id);
      const showAfter = after === undefined ? (fix.kind === "remove" ? "(removed)" : "(unset)") : show(fix.kind, after);
      changes.push({
        group,
        id: fix.id,
        docId: doc._id,
        rev: doc._rev,
        study: fix.study,
        sectionKey: fix.sectionKey,
        inner,
        path,
        label: `${fix.sectionKey}${fix.item ? ` ${fix.item.array}[${fix.item.key}]` : ""}${fix.field ? `.${fix.field}` : ""}`,
        before: cur ?? null,
        after,
        show: [show(fix.kind, cur), showAfter],
        draftNote: note,
      });
      say(`    ${show(fix.kind, cur)} → ${showAfter}`);
      if (note) say(`    ${note}`);
    }
  }

  const sections: Record<string, Section[]> = {};
  for (const id of touched) sections[id] = published.find((d) => d._id === id)!.sections ?? [];
  return { changes, already, problems, revs, sections };
}

async function main() {
  console.log(
    `patch-audit-nov27-b (${DRY ? "DRY — nothing written" : "APPLY"}) · groups ${ONLY.size ? [...ONLY].join(",") : GROUPS.join(",")}${SKIP.size ? ` · skip: ${[...SKIP].join(", ")}` : ""}`,
  );
  const first = await plan(true);

  const docs = new Set(first.changes.map((c) => c.docId));
  console.log(`\n— Summary: ${first.changes.length} field(s) in ${docs.size} document(s); already set: ${first.already.length}`);
  console.log(`  ${"group".padEnd(5)} ${"study".padEnd(13)} ${"field".padEnd(60)} before → after`);
  for (const c of first.changes)
    console.log(`  ${c.group.padEnd(5)} ${c.study.padEnd(13)} ${c.label.padEnd(60)} ${c.show[0]} → ${c.show[1]}${c.draftNote ? `  [${c.draftNote}]` : ""}`);
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
  const file = join(BACKUPS, `audit-nov27-b-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(
    file,
    JSON.stringify(
      {
        revs: p.revs,
        changes: p.changes.map((c) => ({ id: c.id, _id: c.docId, _rev: c.rev, path: c.path, before: c.before, after: c.after ?? "(unset / removed)" })),
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
    console.log(`  ${good ? "OK   " : "WRONG"} ${c.docId} ${c.label}: ${v === undefined ? "(unset / removed)" : JSON.stringify(v).slice(0, 100)}`);
  }
  for (const id of docs) console.log(`  ${id} rev ${now.get(id)!._rev}${now.get(`drafts.${id}`) ? ` (draft drafts.${id} untouched)` : ""}`);
  if (!ok) throw new Error("read-back check failed — see above; restore from the backup");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
