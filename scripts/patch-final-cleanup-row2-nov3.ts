/**
 * Israel's "Faslebbie Final Cleanup" Figma, page XIAN — the second row of studies
 * (Xian Nov 3: "if he wants it for all case studies, why don't we do?";
 * docs/meetings/2026-11-02-2-actions.md, "Row 2").
 *
 *   Heroes ("Remove the current gradient … replace with images that I specifically
 *     put gradient for"): new desktop + mobile exports for OC Navigator, OC Links,
 *     AR Handbook, Design Assist, Memory Tubes, Snapback, Forever a Surfer,
 *     Galderma. "Images already include the dark gradient" only where the export
 *     is dark under the caption (OC Links, Design Assist, Memory Tubes, Forever);
 *     AR / Snapback (light grey / yellow), OC Navigator mobile (tablet UI) and
 *     Galderma keep the site wash so the white caption stays readable (as DVA).
 *   Overview ("Update on live site."): new DA_PO stills for OC Navigator, AR
 *     Handbook, Circle (+ panel colour); Memory Tubes + Forever → one landscape
 *     video in a white card ("Video in a white card", side still kept, hidden).
 *   Core Experience: OC Navigator + OC Links straight 2 × 2 (stagger 0, as Acme /
 *     Census); Circle's five phones with the new white outline.
 *   Circle Key Product Experiences ("Reduce the oversized screens"): one phone
 *     per row (Figma 239:89425) instead of two-phone slides.
 *   Project Highlights: Forever (6) + Snapback (9) tiles with Israel's white mats.
 *
 * Images: ../exports/figma-2026-11-03/ (Figma exports at 3× / 4×; Circle phones
 * and KPE trimmed to the phone outline). Sections / items addressed by _key;
 * published doc + draft (if any); one revision-guarded patch per document.
 * Dry by default: no upload, no write. --apply backs the docs up to
 * ../exports/sanity-backups/ first.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-final-cleanup-row2-nov3.ts --with-user-token
 *   npx sanity exec scripts/patch-final-cleanup-row2-nov3.ts --with-user-token -- --apply
 *   (after 164cfd9 is live) … -- --apply --circle-kpe-only
 */
import { createReadStream, existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const APPLY = process.argv.includes("--apply");
/** Circle's single-phone KPE needs `164cfd9` live (older code sizes a single
 *  phone as a two-phone slide, 585). Default run skips it; run it alone with
 *  --circle-kpe-only once that code is deployed. */
const CIRCLE_KPE_ONLY = process.argv.includes("--circle-kpe-only");
const CIRCLE_KPE_KEY = "a8c6c2bc5f1b";
const EXPORTS = join(process.cwd(), "..", "exports", "figma-2026-11-03");
const BACKUPS = join(process.cwd(), "..", "exports", "sanity-backups");

const color = (hex: string) => ({ _type: "color", alpha: 1, hex });
const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

type Op =
  | { kind: "set"; field: string; value: unknown }
  | { kind: "image"; field: string; file: string }
  /** Replace highlightReel cells with one image cell per file. */
  | { kind: "cells"; files: string[] };

type Change = { slug: string; sectionKey: string; sectionType: string; ops: Op[]; note: string };

const hero = (slug: string, sectionKey: string, file: string, gradient: boolean, note: string): Change => ({
  slug,
  sectionKey,
  sectionType: "heroSection",
  note,
  ops: [
    { kind: "image", field: "image", file: `${file}-hero-desktop.png` },
    { kind: "image", field: "imageMobile", file: `${file}-hero-mobile.png` },
    ...(gradient ? [{ kind: "set" as const, field: "imageHasGradient", value: true }] : []),
  ],
});

const tiles = (dir: string, n: number) => Array.from({ length: n }, (_, i) => `${dir}/0${i + 1}.png`);

const ALL_CHANGES: Change[] = [
  // Heroes
  hero("oc-digital-resource-navigator", "89f1516b2f6d", "nav", false, "hero (Figma 239:51235 / 239:51320) — wash kept (mobile tablet UI)"),
  hero("oc-links", "3d21e03895fa", "links", true, "hero (Figma 239:55503 / 239:57258)"),
  hero("the-ar-handbook", "74a5d75b62e5", "ar", false, "hero (Figma 239:60040 / 239:60239) — wash kept (light grey)"),
  hero("design-assist-ai", "638eb60ae594", "da", true, "hero (Figma 239:63796 / 239:63844)"),
  hero("memory-tubes", "2fe3bf68d190", "mt", true, "hero (Figma 239:109983 photo layer / 239:110001)"),
  hero("snapback-lifestyle", "f40d732cf033", "snap", false, "hero (Figma 239:112939 / 239:112944) — wash kept (yellow)"),
  hero("forever-a-surfer", "286f78f34fc4", "fas", true, "hero (Figma 239:118826 / 239:118831)"),
  hero("galderma", "b57d579b3097", "gal", false, "hero (Figma 239:131939 / 239:136092) — wash kept (mid grey)"),

  // Overview
  { slug: "oc-digital-resource-navigator", sectionKey: "06fa4d2d4920", sectionType: "overviewSection", note: "Overview image (DA_PO 239:51151)", ops: [
    { kind: "image", field: "sideImage", file: "nav-overview-media.png" },
    { kind: "set", field: "sideImageBackgroundColor", value: color("#a1cbdc") },
  ] },
  { slug: "the-ar-handbook", sectionKey: "1c9613d2688d", sectionType: "overviewSection", note: "Overview image (239:60208)", ops: [
    { kind: "image", field: "sideImage", file: "ar-overview-media.png" },
    { kind: "set", field: "sideImageBackgroundColor", value: color("#4c6060") },
  ] },
  { slug: "circle", sectionKey: "ff27e8d7770a", sectionType: "overviewSection", note: "Overview image (DA_PO 239:90708)", ops: [
    { kind: "image", field: "sideImage", file: "circle-overview-media.png" },
    { kind: "set", field: "sideImageBackgroundColor", value: color("#2a2828") },
  ] },
  { slug: "memory-tubes", sectionKey: "ea04b79141fd", sectionType: "overviewSection", note: "Overview video card (Figma 239:108827)", ops: [
    { kind: "set", field: "sideVideoCard", value: true },
    { kind: "set", field: "sideImageBackgroundColor", value: color("#8facaa") },
  ] },
  { slug: "forever-a-surfer", sectionKey: "904356fd45f3", sectionType: "overviewSection", note: "Overview video card (Figma 239:118125)", ops: [
    { kind: "set", field: "sideVideoCard", value: true },
    { kind: "set", field: "sideImageBackgroundColor", value: color("#939794") },
  ] },

  // Core Experience — straight 2 × 2
  { slug: "oc-digital-resource-navigator", sectionKey: "f9da2863494d", sectionType: "coreExperience", note: "CE straight grid (Figma 239:49774)", ops: [
    { kind: "set", field: "previewRowStagger", value: 0 },
  ] },
  { slug: "oc-links", sectionKey: "f0e8493c4348", sectionType: "coreExperience", note: "CE straight grid (Figma 239:53775)", ops: [
    { kind: "set", field: "previewRowStagger", value: 0 },
  ] },

  // Circle — CE phones with the white outline (Figma 239:88856 … 239:89207), in order
  { slug: "circle", sectionKey: "9ce2395ae7f8", sectionType: "coreExperience", note: "CE phones with white outline (Figma 239:88848)", ops: [
    ...["6cd20fb37e63", "ac94a5a4d524", "061fd7f16798", "26ce3a7052f2", "69bb2b758612"].flatMap((k, i): Op[] => [
      { kind: "image", field: `previewScreens[_key=="${k}"].image`, file: `circle-ce/0${i + 1}.png` },
      { kind: "set", field: `previewScreens[_key=="${k}"].imageWidth`, value: 992 },
      { kind: "set", field: `previewScreens[_key=="${k}"].imageHeight`, value: 2128 },
    ]),
  ] },
  // Circle — KPE one phone per row (Figma 239:89616, 239:89430, 239:89583)
  { slug: "circle", sectionKey: "a8c6c2bc5f1b", sectionType: "desktopMotionShowcase", note: "KPE single phones (Figma 239:89425)", ops: [
    { kind: "image", field: `carousels[_key=="dfa1a3f70bde"].slides[_key=="4c257ee2e982"].image`, file: "circle-kpe/01.png" },
    { kind: "set", field: `carousels[_key=="dfa1a3f70bde"].slides[_key=="4c257ee2e982"].alt`, value: "Home feed" },
    { kind: "image", field: `carousels[_key=="ec1e91f94043"].slides[_key=="4aee4eef1517"].image`, file: "circle-kpe/02.png" },
    { kind: "set", field: `carousels[_key=="ec1e91f94043"].slides[_key=="4aee4eef1517"].alt`, value: "Nearby discovery" },
    { kind: "image", field: `carousels[_key=="5abdff3885f5"].slides[_key=="b320b5c16ba7"].image`, file: "circle-kpe/03.png" },
    { kind: "set", field: `carousels[_key=="5abdff3885f5"].slides[_key=="b320b5c16ba7"].alt`, value: "Booking confirmed" },
  ] },

  // Project Highlights — Israel's tiles (mats included), cells flush
  { slug: "forever-a-surfer", sectionKey: "ed8230190c90", sectionType: "highlightReel", note: "Highlights 2 × 3 tiles (Figma 239:118234)", ops: [
    { kind: "cells", files: tiles("highlights-forever", 6) },
  ] },
  { slug: "snapback-lifestyle", sectionKey: "8148a0074ea2", sectionType: "highlightReel", note: "The Object, In Detail 3 × 3 tiles (Figma 239:112071)", ops: [
    { kind: "cells", files: tiles("highlights-snapback", 9) },
  ] },
];

const CHANGES = ALL_CHANGES.filter((c) => (c.sectionKey === CIRCLE_KPE_KEY) === CIRCLE_KPE_ONLY);

type Section = { _key: string; _type: string } & Record<string, unknown>;
type Doc = { _id: string; _rev: string; sections?: Section[] };

/** Read a dotted path with `name[_key=="…"]` segments. */
const get = (o: unknown, path: string): unknown =>
  path.split(".").reduce<unknown>((v, seg) => {
    if (!v || typeof v !== "object") return undefined;
    const m = seg.match(/^(\w+)\[_key=="(\w+)"\]$/);
    if (m) {
      const arr = (v as Record<string, unknown>)[m[1]];
      return Array.isArray(arr) ? arr.find((x) => x && (x as { _key?: string })._key === m[2]) : undefined;
    }
    return (v as Record<string, unknown>)[seg];
  }, o);

const show = (v: unknown) => {
  if (v && typeof v === "object" && "asset" in (v as object)) return `image ${String(get(v, "asset._ref")).slice(0, 56)}`;
  if (v && typeof v === "object" && "hex" in (v as object)) return String(get(v, "hex"));
  if (Array.isArray(v)) return `[${v.length} items]`;
  return JSON.stringify(v) ?? "∅";
};

const uploaded = new Map<string, string>();
async function assetRef(file: string) {
  const path = join(EXPORTS, file);
  if (!existsSync(path)) throw new Error(`missing export: ${path}`);
  if (!APPLY) return `(would upload ${file}, ${(statSync(path).size / 1e6).toFixed(1)} MB)`;
  if (!uploaded.has(file)) {
    const asset = await client.assets.upload("image", createReadStream(path), { filename: file.replace(/\//g, "-") });
    uploaded.set(file, asset._id);
  }
  return uploaded.get(file)!;
}
const imageValue = async (file: string) => ({ _type: "image", asset: { _type: "reference", _ref: await assetRef(file) } });

async function main() {
  console.log(`patch-final-cleanup-row2-nov3 (${APPLY ? "APPLY" : "dry"}${CIRCLE_KPE_ONLY ? ", Circle KPE only" : ", without Circle KPE"})`);
  for (const c of CHANGES) for (const op of c.ops) {
    for (const f of op.kind === "image" ? [op.file] : op.kind === "cells" ? op.files : []) {
      if (!existsSync(join(EXPORTS, f))) throw new Error(`missing export: ${f}`);
    }
  }
  const slugs = [...new Set(CHANGES.map((c) => c.slug))];
  const ids = await client.fetch<{ slug: string; _id: string }[]>(
    `*[_type == "caseStudy" && slug.current in $slugs && !(_id in path("drafts.**"))]{ "slug": slug.current, _id }`,
    { slugs },
  );
  const idBySlug = new Map(ids.map((r) => [r.slug, r._id]));
  for (const slug of slugs) if (!idBySlug.has(slug)) throw new Error(`no case study: ${slug}`);
  const targets = [...idBySlug.values()].flatMap((id) => [id, `drafts.${id}`]);
  const docs = await client.fetch<Doc[]>(`*[_id in $ids]`, { ids: targets });
  const byId = new Map(docs.map((d) => [d._id, d]));

  // Validate every target before anything is uploaded or written.
  for (const slug of slugs) {
    for (const docId of [idBySlug.get(slug)!, `drafts.${idBySlug.get(slug)!}`]) {
      const doc = byId.get(docId);
      if (!doc) continue;
      for (const c of CHANGES.filter((x) => x.slug === slug)) {
        const s = doc.sections?.find((x) => x._key === c.sectionKey);
        if (!s) throw new Error(`${docId}: section ${c.sectionKey} not found`);
        if (s._type !== c.sectionType) throw new Error(`${docId}: ${c.sectionKey} is ${s._type}, expected ${c.sectionType}`);
        for (const op of c.ops) {
          if (op.kind === "cells") continue;
          const parent = op.field.includes(".") ? op.field.slice(0, op.field.lastIndexOf(".")) : "";
          if (parent && get(s, parent) === undefined) throw new Error(`${docId}: ${c.sectionKey}.${parent} not found`);
        }
      }
    }
  }

  if (APPLY) {
    mkdirSync(BACKUPS, { recursive: true });
    const file = join(BACKUPS, `final-cleanup-row2-nov3${CIRCLE_KPE_ONLY ? "-circle-kpe" : ""}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
    writeFileSync(file, JSON.stringify(docs, null, 1));
    console.log(`backup → ${file}`);
  }

  let changed = 0;
  for (const slug of slugs) {
    const id = idBySlug.get(slug)!;
    for (const docId of [id, `drafts.${id}`]) {
      const doc = byId.get(docId);
      if (!doc) continue;
      // One patch per document — a second patch on the same _rev would fail the guard.
      let patch = client.patch(docId).ifRevisionId(doc._rev);
      for (const c of CHANGES.filter((x) => x.slug === slug)) {
        const s = doc.sections!.find((x) => x._key === c.sectionKey)!;
        console.log(`\n• ${docId} — ${c.note}`);
        const base = `sections[_key=="${c.sectionKey}"]`;
        for (const op of c.ops) {
          if (op.kind === "cells") {
            const cells = [];
            for (const f of op.files) {
              cells.push({ _key: key(), _type: "highlightCell", frames: [{ _key: key(), ...(await imageValue(f)) }] });
            }
            console.log(`  cells: ${show(s.cells)} → [${cells.length} tiles] (${op.files[0].split("/")[0]}); layout ${JSON.stringify(s.layout)}; inset 0`);
            patch = patch.set({
              [`${base}.layout`]: "grid",
              [`${base}.cells`]: cells,
              [`${base}.gridCellInsetVerticalPercent`]: 0,
              [`${base}.gridCellInsetHorizontalPercent`]: 0,
            });
            continue;
          }
          const before = get(s, op.field);
          const value = op.kind === "image" ? await imageValue(op.file) : op.value;
          console.log(`  ${op.field}: ${show(before)} → ${show(value)}`);
          patch = patch.set({ [`${base}.${op.field}`]: value });
        }
        changed++;
      }
      if (APPLY) await patch.commit();
    }
  }
  console.log(`\n${APPLY ? "✓ patched" : "would patch"} ${changed} section(s)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
