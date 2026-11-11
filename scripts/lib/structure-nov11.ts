/**
 * Shared helpers for the Nov 11 "structure first" patches of the four legacy
 * studies (Galderma, Life of a Miner VR, Vuforia Editor, Vuforia Chalk):
 * patch-galderma-structure-nov11.ts, patch-life-of-a-miner-structure-nov11.ts,
 * patch-vuforia-editor-structure-nov11.ts, patch-vuforia-chalk-structure-nov11.ts.
 *
 * Pattern: fetch the published doc (+ draft if any), build the new sections in
 * JS, insert them after existing sections by `_key`, refuse if any of the new
 * titles already exists, and `set` the whole `sections` array under
 * `ifRevisionId`. Dry by default (no uploads, no writes); `-- --apply` uploads
 * the images (once per file, shared between bands), writes a full-document
 * backup to ../exports/sanity-backups/ and commits.
 */
import { createReadStream, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";
import { getCliClient } from "sanity/cli";

import { sanityColor } from "../../src/lib/sanityAppearanceDefaults";

export const client = getCliClient({ apiVersion: "2025-01-01" });
export const APPLY = process.argv.includes("--apply");
export const BACKUPS = join(process.cwd(), "..", "exports", "sanity-backups");
/** Old-site images the July extract skipped (downloaded Nov 11 from fasandsabrina.com). */
export const OLDSITE = join(process.cwd(), "..", "exports", "oldsite-2026-11-11");
/** July extract of the old site (frontend/public/work/<slug>/). */
export const WORK = join(process.cwd(), "public", "work");

/** Israel's blank placeholder mat (Figma 239:31974 slot 5, uploaded by patch-qa-highlights-2x3-nov4.ts). */
export const BLANK_MAT_ASSET = "image-465a8744756b2d79c041616069263f923ee3fb2a-1188x792-png";

export const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

export type ImageRef = { _type: "image"; asset: { _type: "reference"; _ref: string } };
export type Section = { _key: string; _type: string; sectionTitle?: string } & Record<string, unknown>;
export type Doc = { _id: string; _rev: string; sections: Section[] } & Record<string, unknown>;

export function pt(text: string) {
  return [
    {
      _type: "block",
      _key: key(),
      style: "normal",
      markDefs: [],
      children: [{ _type: "span", _key: key(), text, marks: [] }],
    },
  ];
}

export function appearance(bg: string, text: string, extra: Record<string, unknown> = {}) {
  return { _type: "appearance", backgroundColor: sanityColor(bg), textColor: sanityColor(text), ...extra };
}

export function assetRef(id: string): ImageRef {
  return { _type: "image", asset: { _type: "reference", _ref: id } };
}

const uploads = new Map<string, Promise<ImageRef>>();
let uploadCount = 0;

/** Upload once per file (dry: a fake ref, still checks the file exists). */
export function image(absPath: string): Promise<ImageRef> {
  if (!existsSync(absPath)) throw new Error(`missing image: ${absPath}`);
  let p = uploads.get(absPath);
  if (!p) {
    p = (async () => {
      if (!APPLY) return assetRef(`dry-${basename(absPath)}`);
      const asset = await client.assets.upload("image", createReadStream(absPath), {
        filename: basename(absPath),
      });
      uploadCount++;
      console.log(`  ↑ ${basename(absPath)} → ${asset._id}`);
      return assetRef(asset._id);
    })();
    uploads.set(absPath, p);
  }
  return p;
}

export function uploadedCount() {
  return uploadCount;
}

export function showcaseItem(img: ImageRef, caption?: string) {
  return { _type: "showcaseItem", _key: key(), image: img, ...(caption ? { caption } : {}) };
}

export function galleryItem(img: ImageRef, caption?: string) {
  return { _type: "galleryItem", _key: key(), image: img, ...(caption ? { caption } : {}) };
}

export function ceScreen(img: ImageRef) {
  return { _type: "coreExperienceScreen", _key: key(), image: img };
}

export async function fetchDocs(id: string): Promise<Doc[]> {
  const docs: Doc[] = [];
  for (const docId of [id, `drafts.${id}`]) {
    const d = await client.fetch<Doc | null>(`*[_id == $id][0]`, { id: docId });
    if (d) docs.push(d);
  }
  if (!docs.length) throw new Error(`${id} not found`);
  return docs;
}

export function insertAfter(sections: Section[], afterKey: string, add: Section[]): Section[] {
  const i = sections.findIndex((s) => s._key === afterKey);
  if (i < 0) throw new Error(`anchor section ${afterKey} not found`);
  return [...sections.slice(0, i + 1), ...add, ...sections.slice(i + 1)];
}

/** Run-once guard: refuse when any of the titles we are about to add is already there. */
export function refuseIfPresent(doc: Doc, titles: string[], types: string[] = []) {
  for (const s of doc.sections) {
    const t = (s.sectionTitle ?? "").trim();
    if ((t && titles.includes(t)) || types.includes(s._type)) {
      throw new Error(`${doc._id} already has ${s._type}${t ? ` "${t}"` : ""} (${s._key}) — run once only`);
    }
  }
}

export function describe(sections: Section[], added: Set<string>) {
  return sections
    .map((s, i) => `  ${added.has(s._key) ? "+" : " "} [${i}] ${s._type}${s.sectionTitle ? ` "${s.sectionTitle}"` : ""} (${s._key})`)
    .join("\n");
}

export async function commit(name: string, plan: { doc: Doc; sections: Section[] }[]) {
  if (!APPLY) {
    console.log(`dry run — nothing written (re-run with -- --apply)`);
    return;
  }
  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `${name}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify(plan.map((p) => p.doc), null, 1));
  console.log(`backup → ${file}`);
  for (const { doc, sections } of plan) {
    const res = await client
      .patch(doc._id)
      .ifRevisionId(doc._rev)
      .set({ sections })
      .commit<Doc>();
    console.log(`✓ ${doc._id}: ${doc.sections.length} → ${res.sections.length} sections (rev ${res._rev})`);
  }
  console.log(`uploaded ${uploadCount} image asset(s)`);
}
