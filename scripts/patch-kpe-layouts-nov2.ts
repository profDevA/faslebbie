/**
 * Israel's Final Cleanup Figma (XIAN page, Nov 2; docs/meetings/2026-11-02-2-actions.md):
 * Key Product Experiences on the Coral layout — one device per row, alternating
 * sides, caption under each (renders as the Coral `mobileFlowStack`).
 *
 *   DVA (9f2d1de9871a): phoneRow (3 phones in one row) → stacked, one phone per
 *     row. Each phone's Studio caption becomes its row caption. Intro kept.
 *     ("Position the supporting Mobile and description consistent with the other
 *     case studies.")
 *   Census: the featured phone band (2a384e390c79) + the blue laptop band
 *     (8ab39e799a09) → ONE band "Key Product Experiences", navy #384E73, phone
 *     row then laptop row (Figma 245:60391; "we are no more doing this… you can
 *     delete this"). Captions are the existing Studio texts. The laptop band is
 *     removed — its poster image and body move into the merged band.
 *
 * Addressed by _key, guarded by the document revision, published doc + draft.
 * Dry by default; --apply backs the docs up to ../exports/sanity-backups/ first.
 * No uploads.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-kpe-layouts-nov2.ts --with-user-token
 *   npx sanity exec scripts/patch-kpe-layouts-nov2.ts --with-user-token -- --apply
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const APPLY = process.argv.includes("--apply");
const BACKUPS = join(process.cwd(), "..", "exports", "sanity-backups");

type Block = { children?: { text?: string }[] };
type Item = { _key: string; caption?: string } & Record<string, unknown>;
type Row = { _key: string; items?: Item[] } & Record<string, unknown>;
type Section = { _key: string; _type: string; rows?: Row[]; body?: Block[]; posterImage?: unknown } & Record<string, unknown>;
type Doc = { _id: string; _rev: string; sections: Section[] };

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);
const plain = (blocks?: Block[]) =>
  (blocks ?? []).map((b) => (b.children ?? []).map((c) => c.text ?? "").join("")).join("\n").trim();

function dva(doc: Doc): Section[] | null {
  const i = doc.sections.findIndex((s) => s._key === "9f2d1de9871a");
  if (i < 0) throw new Error(`${doc._id}: DVA KPE 9f2d1de9871a not found`);
  const s = doc.sections[i];
  if (s.layoutVariant === "stacked") return null; // already done
  if (s.layoutVariant !== "phoneRow" || s.rows?.length !== 1) throw new Error(`${doc._id}: unexpected DVA KPE shape`);
  const items = s.rows[0].items ?? [];
  const rows: Row[] = items.map((it) => ({
    _key: key(),
    _type: "motionRow",
    device: "mobile",
    ...(it.caption ? { caption: it.caption } : {}),
    items: [it],
  }));
  console.log(`  DVA KPE: phoneRow (1 row × ${items.length}) → stacked (${rows.length} rows × 1)`);
  rows.forEach((r, n) => console.log(`    row ${n + 1}: ${(r.items as Item[])[0]._key} · caption ${JSON.stringify(r.caption ?? null)}`));
  const next = { ...s, layoutVariant: "stacked", rows };
  return doc.sections.map((x, n) => (n === i ? next : x));
}

function census(doc: Doc): Section[] | null {
  const iPhone = doc.sections.findIndex((s) => s._key === "2a384e390c79");
  const iLaptop = doc.sections.findIndex((s) => s._key === "8ab39e799a09");
  if (iPhone < 0) throw new Error(`${doc._id}: Census featured band 2a384e390c79 not found`);
  const phone = doc.sections[iPhone];
  if (phone.layoutVariant === "stacked" && iLaptop < 0) return null; // already done
  if (iLaptop < 0) throw new Error(`${doc._id}: Census laptop band 8ab39e799a09 not found`);
  const laptop = doc.sections[iLaptop];
  if (phone._type !== "motionShowcase" || laptop._type !== "desktopMotionShowcase") throw new Error(`${doc._id}: unexpected Census KPE types`);
  const phoneRow = (phone.rows ?? [])[0];
  if (!phoneRow) throw new Error(`${doc._id}: Census phone band has no row`);
  // Featured-band-only fields don't apply to a stacked row; the label was the old band heading.
  const phoneRest: Record<string, unknown> = { ...phoneRow };
  for (const k of ["label", "captionAlign", "rowWidthPercent"]) delete phoneRest[k];
  const laptopCaption = plain(laptop.body);
  const merged: Section = {
    ...phone,
    sectionTitle: "Key Product Experiences",
    layoutVariant: "stacked",
    titleMarginBottomDesktop: 105,
    appearance: {
      ...(phone.appearance as object),
      _type: "appearance",
      backgroundColor: { _type: "color", alpha: 1, hex: "#384e73" },
      textColor: { _type: "color", alpha: 1, hex: "#ffffff" },
    },
    rows: [
      { ...(phoneRest as Row), device: "mobile" },
      {
        _key: key(),
        _type: "motionRow",
        device: "tablet",
        caption: laptopCaption,
        items: [{ _key: key(), _type: "mediaItem", mediaType: "image", image: laptop.posterImage }],
      },
    ],
  };
  console.log(`  Census: merge featured ${phone._key} + laptop ${laptop._key} → one stacked band ${phone._key} (#384e73)`);
  console.log(`    row 1 phone · caption ${JSON.stringify(String(phoneRow.caption ?? "").slice(0, 60))} (label "${phoneRow.label}" dropped)`);
  console.log(`    row 2 laptop (poster ${String((laptop.posterImage as { asset?: { _ref?: string } })?.asset?._ref).slice(0, 48)}) · caption ${JSON.stringify(laptopCaption.slice(0, 60))}`);
  console.log(`    remove section ${laptop._key} (${laptop._type} "${laptop.sectionTitle}")`);
  return doc.sections.flatMap((x, n) => (n === iPhone ? [merged] : n === iLaptop ? [] : [x]));
}

async function run(slug: string, fn: (d: Doc) => Section[] | null, backup: Doc[]) {
  const id = await client.fetch<string>(`*[_type == "caseStudy" && slug.current == $slug && !(_id in path("drafts.**"))][0]._id`, { slug });
  for (const docId of [id, `drafts.${id}`]) {
    const doc = await client.fetch<Doc | null>(`*[_id == $id][0]`, { id: docId });
    if (!doc) continue;
    console.log(`\n• ${docId} (sections ${doc.sections.length})`);
    const next = fn(doc);
    if (!next) {
      console.log("  already done");
      continue;
    }
    console.log(`  sections ${doc.sections.length} → ${next.length}`);
    backup.push(doc);
    if (APPLY) await client.patch(docId).ifRevisionId(doc._rev).set({ sections: next }).commit();
  }
}

async function main() {
  console.log(`patch-kpe-layouts-nov2 (${APPLY ? "APPLY" : "dry"})`);
  const backup: Doc[] = [];
  if (APPLY) mkdirSync(BACKUPS, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  // Back up before writing: read both docs first.
  const snapshot = await client.fetch<Doc[]>(`*[_type == "caseStudy" && slug.current in ["diamond-valuation-ai", "2020-us-census-benefit-calculator"]]`);
  if (APPLY) {
    const file = join(BACKUPS, `kpe-layouts-nov2-${stamp}.json`);
    writeFileSync(file, JSON.stringify(snapshot, null, 1));
    console.log(`backup → ${file}`);
  }
  await run("diamond-valuation-ai", dva, backup);
  await run("2020-us-census-benefit-calculator", census, backup);
  console.log(`\n${APPLY ? "✓ patched" : "would patch"} ${backup.length} document(s)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
