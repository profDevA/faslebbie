/**
 * Financial Data Exchange — new section order from Israel's Final Cleanup Figma
 * (XIAN page, FDE 1440 mock 245:43795; Nov 2 recording #2680 10:30–12:40;
 * docs/meetings/2026-11-02-2-actions.md):
 *
 *   "Replace the existing FDX / Mint section arrangement with the updated Figma
 *    layout. Follow the new section order, motion placement, headings, and Core
 *    Experience positioning exactly as shown."
 *
 * New order (Studio keys):
 *   hero · overview · problem context ·
 *   FDX intro band  (featured abb8fd154374, #94CEC6) ·
 *   FDX Core Experience (79924bd7e98f, cream #F2EFE8, dark text) ·
 *   My Approach + Design Process (19c98f6fc95c, band #E3E3DB, panel #009687, white panel text) ·
 *   Mint intro band (featured 6b9a5ac0e2eb, #94CEC6) ·
 *   Mint Core Experience (NEW — 5 phones + captions from Figma 245:44410) ·
 *   Impact (79b97c8df4b6) ·
 *   Project Highlights (NEW — 2×3 grid, Israel's 6 tiles, band #118596) ·
 *   reflection (7af6b72d2c54)
 * Removed: the two "Design Interventions" desktop-motion bands (3dd5b0cb86df,
 * f92ec43ff0bf) — not in the Figma order. The full document is backed up first.
 *
 * Saqib is redoing the FDE motions (Teams Nov 1–2) and edits this document:
 * run only when he is not editing FDE. Guarded by the document revision.
 * Images: ../exports/figma-2026-11-02/fde-mint-ce/ and highlights-fde/.
 * Dry by default (no upload, no write).
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-fde-restructure-nov2.ts --with-user-token
 *   npx sanity exec scripts/patch-fde-restructure-nov2.ts --with-user-token -- --apply
 */
import { createReadStream, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const APPLY = process.argv.includes("--apply");
const DOC = "cs-financial-data-exchange";
const EXPORTS = join(process.cwd(), "..", "exports", "figma-2026-11-02");
const BACKUPS = join(process.cwd(), "..", "exports", "sanity-backups");

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);
const color = (hex: string) => ({ _type: "color", alpha: 1, hex });

const MINT_SCREENS = [
  { file: "01-access-your-account.png", w: 761, h: 1641, label: "Access Your Account:", description: "Sign in securely to begin managing your connected financial accounts." },
  { file: "02-start-account-linking.png", w: 806, h: 1641, label: "Start Account Linking:", description: "Choose to connect an account to complete your financial profile." },
  { file: "03-choose-how-to-connect.png", w: 806, h: 1641, label: "Choose How to Connect:", description: "Select a detected banking app or connect another financial institution." },
  { file: "04-select-your-bank.png", w: 807, h: 1635, label: "Select Your Bank:", description: "Find and choose the financial institution you want to connect." },
  { file: "05-establish-secure-connection.png", w: 771, h: 1635, label: "Establish a Secure Connection:", description: "Verify the connection as Mint securely links and syncs your bank account." },
];
const HIGHLIGHT_TILES = ["01.png", "02.png", "03.png", "04.png", "05.png", "06.png"];

const ORDER = [
  "f305aa3e3c1d", // hero
  "cc7497d615db", // overview
  "bdb39d1c7e8c", // problem context
  "abb8fd154374", // FDX intro (featured)
  "79924bd7e98f", // FDX core experience
  "19c98f6fc95c", // my approach + design process
  "6b9a5ac0e2eb", // Mint intro (featured)
  "NEW_MINT_CE",
  "79b97c8df4b6", // impact
  "NEW_HIGHLIGHTS",
  "7af6b72d2c54", // reflection
];
const REMOVE = ["3dd5b0cb86df", "f92ec43ff0bf"];

type Section = { _key: string; _type: string } & Record<string, unknown>;
type Doc = { _id: string; _rev: string; sections: Section[] };

async function image(dir: string, file: string) {
  const path = join(EXPORTS, dir, file);
  if (!existsSync(path)) throw new Error(`missing export: ${path}`);
  if (!APPLY) return { _type: "image", asset: { _type: "reference", _ref: `(would upload ${dir}/${file})` } };
  const asset = await client.assets.upload("image", createReadStream(path), { filename: file });
  return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
}

const withAppearance = (s: Section, extra: Record<string, unknown>) => ({
  ...s,
  appearance: { ...((s.appearance as object) ?? {}), _type: "appearance", ...extra },
});

async function build(doc: Doc): Promise<Section[]> {
  const byKey = new Map(doc.sections.map((s) => [s._key, s]));
  const known = new Set([...ORDER, ...REMOVE]);
  const unknown = doc.sections.filter((s) => !known.has(s._key));
  if (unknown.length) throw new Error(`${doc._id}: unexpected sections ${unknown.map((s) => `${s._key}:${s._type}`).join(", ")} — re-read and update the plan`);
  for (const k of ORDER.filter((k) => !k.startsWith("NEW_"))) if (!byKey.has(k)) throw new Error(`${doc._id}: missing section ${k}`);

  const fdxCe = byKey.get("79924bd7e98f")!;
  const mintCe: Section = {
    _key: key(),
    _type: "coreExperience",
    sectionTitle: "Core Experience Flow",
    layoutVariant: "mobileRow",
    appearance: { ...((fdxCe.appearance as object) ?? {}), _type: "appearance", backgroundColor: color("#f2efe8"), textColor: color("#171717") },
    previewAppearance: { _type: "appearance", contentGap: 32, tileBackgroundColor: color("#f2efe8") },
    previewScreens: await Promise.all(
      MINT_SCREENS.map(async (m) => ({
        _key: key(),
        _type: "coreExperienceScreen",
        image: await image("fde-mint-ce", m.file),
        imageWidth: m.w,
        imageHeight: m.h,
        label: m.label,
        description: m.description,
      })),
    ),
  };
  const highlights: Section = {
    _key: key(),
    _type: "highlightReel",
    sectionTitle: "Project Highlights",
    layout: "grid",
    gridGap: 14,
    gridCellMatteColor: color("#74c0a9"),
    appearance: { _type: "appearance", backgroundColor: color("#118596"), textColor: color("#ffffff"), contentAlignment: "center", contentGap: 48, maxWidth: "default", paddingTop: 96, paddingBottom: 96 },
    cells: await Promise.all(
      HIGHLIGHT_TILES.map(async (f) => ({ _key: key(), _type: "highlightCell", frames: [{ ...(await image("highlights-fde", f)), _key: key() }] })),
    ),
  };

  const recolor: Record<string, (s: Section) => Section> = {
    abb8fd154374: (s) => withAppearance(s, { backgroundColor: color("#94cec6") }),
    "79924bd7e98f": (s) => ({
      ...withAppearance(s, { backgroundColor: color("#f2efe8"), textColor: color("#171717") }),
      previewAppearance: { ...((s.previewAppearance as object) ?? {}), _type: "appearance", tileBackgroundColor: color("#f2efe8") },
    }),
    "19c98f6fc95c": (s) => ({ ...withAppearance(s, { backgroundColor: color("#e3e3db") }), accordionBackgroundColor: color("#009687"), accordionTextColor: color("#ffffff") }),
    "6b9a5ac0e2eb": (s) => withAppearance(s, { backgroundColor: color("#94cec6") }),
  };

  return ORDER.map((k) => {
    if (k === "NEW_MINT_CE") return mintCe;
    if (k === "NEW_HIGHLIGHTS") return highlights;
    const s = byKey.get(k)!;
    return recolor[k] ? recolor[k](s) : s;
  });
}

async function main() {
  console.log(`patch-fde-restructure-nov2 (${APPLY ? "APPLY" : "dry"})`);
  const draftId = `drafts.${DOC}`;
  const hasDraft = await client.fetch<boolean>(`defined(*[_id == $id][0]._id)`, { id: draftId });
  if (hasDraft) throw new Error(`${draftId} exists — someone is editing FDE in Studio. Publish or discard it first.`);
  const doc = await client.fetch<Doc>(`*[_id == $id][0]`, { id: DOC });
  console.log(`current (${doc.sections.length}): ${doc.sections.map((s) => `${s._key}:${s._type}`).join(" ")}`);
  const next = await build(doc);
  console.log(`\nnew (${next.length}):`);
  next.forEach((s, i) => {
    const a = s.appearance as { backgroundColor?: { hex?: string } } | undefined;
    console.log(`  ${String(i).padStart(2)} ${s._key} ${s._type.padEnd(22)} ${String(s.sectionTitle ?? "").padEnd(24)} ${a?.backgroundColor?.hex ?? ""}`);
  });
  console.log(`  removed: ${REMOVE.join(", ")}`);
  if (!APPLY) {
    console.log("\ndry run — pass -- --apply to upload and write");
    return;
  }
  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `fde-restructure-nov2-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify(doc, null, 1));
  console.log(`backup → ${file}`);
  await client.patch(DOC).ifRevisionId(doc._rev).set({ sections: next }).commit();
  console.log("✓ written");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
