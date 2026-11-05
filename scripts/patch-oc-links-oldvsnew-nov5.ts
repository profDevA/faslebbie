/**
 * Israel's recording #2721 (Nov 4, 1:21–1:42; docs/meetings/2026-11-04-2-actions.md
 * L1): OC Links Key Product Experiences → the Figma "Old vs New" band (559:37739,
 * #B6C5E4) — 3 rows: old iCarol screen → arrow → new OC Links screen, row title +
 * text on the right.
 *
 *   Band a3fd82f0f29a (desktopMotionShowcase, staggered pair, two 5-slide sliders)
 *   → layoutVariant "oldVsNew", heading "Old vs New", 3 rows in `carousels`
 *   (slide 1 old, slide 2 new, title, body). Appearance (colour, padding) kept.
 *   Screens exported from Figma @3× (with their drop shadow on #B6C5E4):
 *   ../exports/figma-2026-11-05/oc-links-oldvsnew/ — old 559:37753 / 37756 / 37757,
 *   new 559:37758 / 37903 / 38050.
 *   Row 3's text repeats row 1's in Figma (copied as is — flagged to Israel).
 *
 * NEEDS THE CODE FIRST: before the Old vs New renderer is deployed, the live site
 * shows only the band heading for this layout. Deploy, then --apply.
 *
 * Addressed by _key, revision-guarded, published doc + draft. Dry by default (no
 * uploads); --apply uploads the 6 PNGs once and backs the doc up to
 * ../exports/sanity-backups/ first. Idempotent ("already done").
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-oc-links-oldvsnew-nov5.ts --with-user-token
 *   npx sanity exec scripts/patch-oc-links-oldvsnew-nov5.ts --with-user-token -- --apply
 */
import { createReadStream, existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const APPLY = process.argv.includes("--apply");
const BACKUPS = join(process.cwd(), "..", "exports", "sanity-backups");
const EXPORTS = join(process.cwd(), "..", "exports", "figma-2026-11-05", "oc-links-oldvsnew");
const DOC = "cs-oc-links";
const SECTION = "a3fd82f0f29a";

const ROWS = [
  { key: "ovn1caller00", file: "1-caller", title: "Caller Information", body: "Caller details reorganized into a guided intake form." },
  { key: "ovn2referral", file: "2-referrals", title: "Resource Referrals", body: "Added referrals grouped into clear, removable cards." },
  { key: "ovn3report00", file: "3-report", title: "Report Workflow", body: "Caller details reorganized into a guided intake form." },
];

type Section = { _key: string; _type: string; layoutVariant?: string; sectionTitle?: string; carousels?: unknown[]; appearance?: { backgroundColor?: { hex?: string } } } & Record<string, unknown>;
type Doc = { _id: string; _rev: string; sections: Section[] };

const uploaded = new Map<string, string>();
async function imageValue(file: string) {
  const path = join(EXPORTS, file);
  if (!existsSync(path)) throw new Error(`missing export: ${path}`);
  if (!APPLY) return { _type: "image", asset: { _type: "reference", _ref: `(would upload ${file}, ${(statSync(path).size / 1e3).toFixed(0)} kB)` } };
  if (!uploaded.has(file)) {
    const asset = await client.assets.upload("image", createReadStream(path), { filename: `oc-links-oldvsnew-${file}` });
    uploaded.set(file, asset._id);
  }
  return { _type: "image", asset: { _type: "reference", _ref: uploaded.get(file)! } };
}

const block = (key: string, text: string) => ({
  _type: "block",
  _key: key,
  style: "normal",
  markDefs: [],
  children: [{ _type: "span", _key: `${key}s`, text, marks: [] }],
});

async function rows() {
  const out = [];
  for (const r of ROWS) {
    out.push({
      _key: r.key,
      _type: "desktopMotionCarousel",
      title: r.title,
      body: [block(`${r.key}b`, r.body)],
      slides: [
        { _key: `${r.key}o`, _type: "desktopMotionSlide", alt: `Old — ${r.title}`, image: await imageValue(`old-${r.file}.png`) },
        { _key: `${r.key}n`, _type: "desktopMotionSlide", alt: `New — ${r.title}`, image: await imageValue(`new-${r.file}.png`) },
      ],
    });
  }
  return out;
}

async function main() {
  console.log(`patch-oc-links-oldvsnew-nov5 (${APPLY ? "APPLY" : "dry"})`);
  for (const r of ROWS) for (const f of [`old-${r.file}.png`, `new-${r.file}.png`]) {
    if (!existsSync(join(EXPORTS, f))) throw new Error(`missing export: ${f}`);
  }
  const docs = await client.fetch<Doc[]>(`*[_id in $ids]`, { ids: [DOC, `drafts.${DOC}`] });
  if (!docs.some((d) => d._id === DOC)) throw new Error(`${DOC} not found`);
  const plan: { d: Doc; next: Section }[] = [];
  for (const d of docs) {
    const s = d.sections.find((x) => x._key === SECTION);
    console.log(`\n• ${d._id} (sections ${d.sections.length})`);
    if (!s || s._type !== "desktopMotionShowcase") throw new Error(`${d._id}: desktopMotionShowcase ${SECTION} not found`);
    if (s.layoutVariant === "oldVsNew") { console.log("  already done"); continue; }
    if (s.layoutVariant !== "staggeredPair") throw new Error(`${d._id}: ${SECTION} is "${s.layoutVariant}", expected staggeredPair — not touching it`);
    console.log(`  band ${SECTION} "${s.sectionTitle}" · ${s.layoutVariant} · ${s.carousels?.length ?? 0} sliders · bg ${s.appearance?.backgroundColor?.hex}`);
    const next: Section = { ...s, sectionTitle: "Old vs New", layoutVariant: "oldVsNew", carousels: await rows() };
    console.log(`  → "Old vs New" · oldVsNew · ${ROWS.length} rows:`);
    for (const r of ROWS) console.log(`     ${r.title} — ${r.body}  [old-${r.file}.png → new-${r.file}.png]`);
    plan.push({ d, next });
  }
  if (!APPLY || !plan.length) return console.log(`\n${plan.length ? "would patch" : "nothing to do"} ${plan.length} document(s)`);
  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `oc-links-oldvsnew-nov5-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify(plan.map((p) => p.d), null, 1));
  console.log(`backup → ${file}`);
  for (const { d, next } of plan) {
    await client.patch(d._id).ifRevisionId(d._rev).set({ [`sections[_key=="${SECTION}"]`]: next }).commit();
  }
  console.log(`✓ patched ${plan.length} document(s); uploaded ${uploaded.size} image(s)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
