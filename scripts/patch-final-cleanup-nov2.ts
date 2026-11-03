/**
 * Israel's "Faslebbie Final Cleanup" Figma, page XIAN (Nov 2, recordings #2680 / #2681;
 * docs/meetings/2026-11-02-2-actions.md) — the single-field / asset items:
 *
 *   Heroes (FDE, Experian, Acme, Census): new desktop + mobile exports that carry
 *     their own gradient → upload, and set "Images already include the dark
 *     gradient" so the site skips its wash. DVA hero only with --dva-hero (Israel's
 *     own tracker row; its export has no dark area under the caption, so the site
 *     wash stays on).
 *   Overview: FDE copy column #E3E3DB + media column #F2EFE8 (annotations);
 *     DVA + Census new media image (DA_PO.Jpg); Acme media column blue #2C6F9A
 *     (colour of DA_PO.Jpg — "this is the color of the background we should use").
 *   Core Experience: Acme + Census straight 2×2 grid (stagger 0, "no more
 *     slanted"); Acme band → Figma #56A3DC.
 *
 * Images come from ../exports/figma-2026-11-02/ (Figma exports, captions hidden).
 * Sections are addressed by _key; published doc + draft (if any). Prints
 * before → after. Dry by default: no upload, no write. --apply backs the docs up
 * to ../exports/sanity-backups/ first.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-final-cleanup-nov2.ts --with-user-token
 *   npx sanity exec scripts/patch-final-cleanup-nov2.ts --with-user-token -- --apply
 */
import { createReadStream, existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const APPLY = process.argv.includes("--apply");
const DVA_HERO = process.argv.includes("--dva-hero");
const EXPORTS = join(process.cwd(), "..", "exports", "figma-2026-11-02");
const BACKUPS = join(process.cwd(), "..", "exports", "sanity-backups");

const color = (hex: string) => ({ _type: "color", alpha: 1, hex });

type Op =
  | { kind: "set"; field: string; value: unknown }
  | { kind: "image"; field: string; file: string };

type Change = { slug: string; sectionKey: string; sectionType: string; ops: Op[]; note: string };

const CHANGES: Change[] = [
  // Heroes — "Remove the current gradient we have on the live and let's replace with images that I specifically put gradient for on Figma"
  { slug: "financial-data-exchange", sectionKey: "f305aa3e3c1d", sectionType: "heroSection", note: "hero (Figma 245:47810 / 245:45563)", ops: [
    { kind: "image", field: "image", file: "fde-hero-desktop.png" },
    { kind: "image", field: "imageMobile", file: "fde-hero-mobile.png" },
    { kind: "set", field: "imageHasGradient", value: true },
  ] },
  { slug: "experian-boost", sectionKey: "3c90437575fd", sectionType: "heroSection", note: "hero (Figma 239:26420 / 239:22557)", ops: [
    { kind: "image", field: "image", file: "experian-hero-desktop.png" },
    { kind: "image", field: "imageMobile", file: "experian-hero-mobile.png" },
    { kind: "set", field: "imageHasGradient", value: true },
  ] },
  { slug: "acme-lending", sectionKey: "5ae23b26cfd7", sectionType: "heroSection", note: "hero (Figma 239:28334 / 239:28522)", ops: [
    { kind: "image", field: "image", file: "acme-hero-desktop.png" },
    { kind: "image", field: "imageMobile", file: "acme-hero-mobile.png" },
    { kind: "set", field: "imageHasGradient", value: true },
  ] },
  { slug: "2020-us-census-benefit-calculator", sectionKey: "b722d46d7409", sectionType: "heroSection", note: "hero (Figma 239:46542 / 239:46889)", ops: [
    { kind: "image", field: "image", file: "census-hero-desktop.png" },
    { kind: "image", field: "imageMobile", file: "census-hero-mobile.png" },
    { kind: "set", field: "imageHasGradient", value: true },
  ] },
  ...(DVA_HERO
    ? [{ slug: "diamond-valuation-ai", sectionKey: "d6e88774d06a", sectionType: "heroSection", note: "hero (Figma 239:32577 / 239:32854) — site wash stays", ops: [
        { kind: "image", field: "image", file: "dva-hero-desktop.png" },
        { kind: "image", field: "imageMobile", file: "dva-hero-mobile.png" },
      ] as Op[] }]
    : []),

  // Overview
  { slug: "financial-data-exchange", sectionKey: "cc7497d615db", sectionType: "overviewSection", note: "Overview colours (E3E3DB / F2EFE8)", ops: [
    { kind: "set", field: "appearance.backgroundColor", value: color("#e3e3db") },
    { kind: "set", field: "sideImageBackgroundColor", value: color("#f2efe8") },
  ] },
  { slug: "diamond-valuation-ai", sectionKey: "1a48d65cf8d3", sectionType: "overviewSection", note: "Overview image (DA_PO.Jpg 239:32833)", ops: [
    { kind: "image", field: "sideImage", file: "dva-overview-media.png" },
    { kind: "set", field: "sideImageBackgroundColor", value: color("#999999") },
  ] },
  { slug: "2020-us-census-benefit-calculator", sectionKey: "fecacd42c230", sectionType: "overviewSection", note: "Overview image (DA_PO.Jpg 239:46597)", ops: [
    { kind: "image", field: "sideImage", file: "census-overview-media.png" },
    { kind: "set", field: "sideImageBackgroundColor", value: color("#384e73") },
  ] },
  { slug: "acme-lending", sectionKey: "31f36f7f2d20", sectionType: "overviewSection", note: "Overview media column colour (DA_PO.Jpg blue)", ops: [
    { kind: "set", field: "sideImageBackgroundColor", value: color("#2c6f9a") },
  ] },

  // Core Experience — "no more slanted", update background
  { slug: "acme-lending", sectionKey: "18ede85944f6", sectionType: "coreExperience", note: "CE straight grid + band colour (Figma 239:26743)", ops: [
    { kind: "set", field: "previewRowStagger", value: 0 },
    { kind: "set", field: "appearance.backgroundColor", value: color("#56a3dc") },
  ] },
  { slug: "2020-us-census-benefit-calculator", sectionKey: "da93e62e8ede", sectionType: "coreExperience", note: "CE straight grid (Figma 239:44845)", ops: [
    { kind: "set", field: "previewRowStagger", value: 0 },
  ] },
];

type Section = { _key: string; _type: string } & Record<string, unknown>;
type Doc = { _id: string; _rev: string; sections?: Section[] };

const get = (o: unknown, path: string) =>
  path.split(".").reduce<unknown>((v, k) => (v && typeof v === "object" ? (v as Record<string, unknown>)[k] : undefined), o);

const show = (v: unknown) => {
  if (v && typeof v === "object" && "asset" in (v as object)) return `image ${String(get(v, "asset._ref")).slice(0, 52)}`;
  if (v && typeof v === "object" && "hex" in (v as object)) return String(get(v, "hex"));
  return JSON.stringify(v) ?? "∅";
};

const uploaded = new Map<string, string>();
async function assetRef(file: string) {
  const path = join(EXPORTS, file);
  if (!existsSync(path)) throw new Error(`missing export: ${path}`);
  if (!APPLY) return `(would upload ${file}, ${(statSync(path).size / 1e6).toFixed(1)} MB)`;
  if (!uploaded.has(file)) {
    const asset = await client.assets.upload("image", createReadStream(path), { filename: file });
    uploaded.set(file, asset._id);
  }
  return uploaded.get(file)!;
}

async function main() {
  console.log(`patch-final-cleanup-nov2 (${APPLY ? "APPLY" : "dry"}${DVA_HERO ? ", with DVA hero" : ""})`);
  const slugs = [...new Set(CHANGES.map((c) => c.slug))];
  const ids = await client.fetch<{ slug: string; _id: string }[]>(
    `*[_type == "caseStudy" && slug.current in $slugs && !(_id in path("drafts.**"))]{ "slug": slug.current, _id }`,
    { slugs },
  );
  const idBySlug = new Map(ids.map((r) => [r.slug, r._id]));
  const targets = (await Promise.all(
    slugs.map(async (slug) => {
      const id = idBySlug.get(slug);
      if (!id) throw new Error(`no case study: ${slug}`);
      const draft = `drafts.${id}`;
      const hasDraft = await client.fetch<boolean>(`defined(*[_id == $id][0]._id)`, { id: draft });
      return hasDraft ? [id, draft] : [id];
    }),
  )).flat();
  const docs = await client.fetch<Doc[]>(`*[_id in $ids]`, { ids: targets });
  const byId = new Map(docs.map((d) => [d._id, d]));

  if (APPLY) {
    mkdirSync(BACKUPS, { recursive: true });
    const file = join(BACKUPS, `final-cleanup-nov2-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
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
        const s = doc.sections?.find((x) => x._key === c.sectionKey);
        if (!s) throw new Error(`${docId}: section ${c.sectionKey} not found`);
        if (s._type !== c.sectionType) throw new Error(`${docId}: ${c.sectionKey} is ${s._type}, expected ${c.sectionType}`);
        console.log(`\n• ${docId} — ${c.note}`);
        const base = `sections[_key=="${c.sectionKey}"]`;
        if (c.ops.some((o) => o.field.startsWith("appearance."))) {
          patch = patch.setIfMissing({ [`${base}.appearance`]: { _type: "appearance" } });
        }
        for (const op of c.ops) {
          const before = get(s, op.field);
          const value =
            op.kind === "image"
              ? { _type: "image", asset: { _type: "reference", _ref: await assetRef(op.file) } }
              : op.value;
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
