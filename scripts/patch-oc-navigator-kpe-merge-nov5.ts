/**
 * Israel's recording #2721 (Nov 4, 4:19–4:30; docs/meetings/2026-11-04-2-actions.md
 * N1): OC Navigator — "these two sections go into this one section… just like
 * Experian and the rest". Figma 559:42568 (#A1CBDC): Key Product Experiences = one
 * phone + caption (left), then the laptop + caption (right), staggered — the Coral
 * stacked KPE (renders as `mobileFlowStack`, same as Census on Nov 2).
 *
 *   Featured KPE band 45d94b69a712 (phone video) + Design Interventions band
 *   1040b2aa7738 (laptop video + body) → ONE stacked band 45d94b69a712, #A1CBDC,
 *   row 1 phone (its Studio caption), row 2 laptop video (the Design
 *   Interventions body as its caption). The Design Interventions band is removed.
 *   Figma's captions are Coral placeholder copy — the live OC Navigator copy stays.
 *
 * Addressed by _key, revision-guarded, published doc + draft. Dry by default;
 * --apply backs the doc up to ../exports/sanity-backups/ first. No uploads.
 * Idempotent ("already done").
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-oc-navigator-kpe-merge-nov5.ts --with-user-token
 *   npx sanity exec scripts/patch-oc-navigator-kpe-merge-nov5.ts --with-user-token -- --apply
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const APPLY = process.argv.includes("--apply");
const BACKUPS = join(process.cwd(), "..", "exports", "sanity-backups");
const DOC = "cs-oc-digital-resource-navigator";
const PHONE = "45d94b69a712";
const LAPTOP = "1040b2aa7738";

type Block = { children?: { text?: string }[] };
type Row = { _key: string; label?: string; caption?: string } & Record<string, unknown>;
type Section = { _key: string; _type: string; rows?: Row[]; body?: Block[]; videoFile?: unknown; posterImage?: unknown; sectionTitle?: string; appearance?: Record<string, unknown> } & Record<string, unknown>;
type Doc = { _id: string; _rev: string; sections: Section[] };

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);
const plain = (blocks?: Block[]) =>
  (blocks ?? []).map((b) => (b.children ?? []).map((c) => c.text ?? "").join("")).join("\n").trim();

function merge(doc: Doc): Section[] | null {
  const iPhone = doc.sections.findIndex((s) => s._key === PHONE);
  const iLaptop = doc.sections.findIndex((s) => s._key === LAPTOP);
  if (iPhone < 0) throw new Error(`${doc._id}: KPE ${PHONE} not found`);
  const phone = doc.sections[iPhone];
  if (phone.layoutVariant === "stacked" && iLaptop < 0) return null; // already done
  if (iLaptop < 0) throw new Error(`${doc._id}: Design Interventions ${LAPTOP} not found`);
  const laptop = doc.sections[iLaptop];
  if (phone._type !== "motionShowcase" || laptop._type !== "desktopMotionShowcase") throw new Error(`${doc._id}: unexpected section types`);
  if (phone.rows?.length !== 1 || !laptop.videoFile) throw new Error(`${doc._id}: unexpected KPE / Design Interventions shape`);
  const phoneRow: Record<string, unknown> = { ...phone.rows[0] };
  // Featured-band-only fields don't apply to a stacked row; the label was the old band heading.
  for (const k of ["label", "captionAlign", "rowWidthPercent"]) delete phoneRow[k];
  const laptopCaption = plain(laptop.body);
  const merged: Section = {
    ...phone,
    sectionTitle: "Key Product Experiences",
    layoutVariant: "stacked",
    titleMarginBottomDesktop: 105,
    appearance: {
      ...(phone.appearance ?? {}),
      _type: "appearance",
      backgroundColor: { _type: "color", alpha: 1, hex: "#a1cbdc" },
      textColor: { _type: "color", alpha: 1, hex: "#000000" },
    },
    rows: [
      { ...(phoneRow as Row), device: "mobile" },
      {
        _key: key(),
        _type: "motionRow",
        device: "tablet",
        caption: laptopCaption,
        items: [{
          _key: key(),
          _type: "mediaItem",
          mediaType: "video",
          videoFile: laptop.videoFile,
          ...(laptop.posterImage ? { posterImage: laptop.posterImage } : {}),
        }],
      },
    ],
  };
  console.log(`  merge featured ${PHONE} + Design Interventions ${LAPTOP} → one stacked band ${PHONE} (#a1cbdc)`);
  console.log(`    row 1 phone · caption ${JSON.stringify(String(phone.rows[0].caption ?? "").slice(0, 70))} (label "${phone.rows[0].label}" dropped)`);
  console.log(`    row 2 laptop video ${String((laptop.videoFile as { asset?: { _ref?: string } })?.asset?._ref).slice(0, 50)} · caption ${JSON.stringify(laptopCaption.slice(0, 70))}… (${laptopCaption.length} chars)`);
  console.log(`    remove section ${LAPTOP} (${laptop._type} "${laptop.sectionTitle}")`);
  return doc.sections.flatMap((x, n) => (n === iPhone ? [merged] : n === iLaptop ? [] : [x]));
}

async function main() {
  console.log(`patch-oc-navigator-kpe-merge-nov5 (${APPLY ? "APPLY" : "dry"})`);
  const docs = await client.fetch<Doc[]>(`*[_id in $ids]`, { ids: [DOC, `drafts.${DOC}`] });
  if (!docs.some((d) => d._id === DOC)) throw new Error(`${DOC} not found`);
  const plan: { d: Doc; next: Section[] }[] = [];
  for (const d of docs) {
    console.log(`\n• ${d._id} (sections ${d.sections.length})`);
    const next = merge(d);
    if (!next) { console.log("  already done"); continue; }
    console.log(`  sections ${d.sections.length} → ${next.length}`);
    plan.push({ d, next });
  }
  if (!APPLY || !plan.length) return console.log(`\n${plan.length ? "would patch" : "nothing to do"} ${plan.length} document(s)`);
  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `oc-navigator-kpe-merge-nov5-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify(plan.map((p) => p.d), null, 1));
  console.log(`backup → ${file}`);
  for (const { d, next } of plan) await client.patch(d._id).ifRevisionId(d._rev).set({ sections: next }).commit();
  console.log(`✓ patched ${plan.length} document(s)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
