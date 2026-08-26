/**
 * Upload Figma book covers onto blogsPage.books rows (Figma 3393:3510).
 * 3550:2778 = Souvenirs of my Awakening
 * 3550:2781 = Mineral Choreography Vol 1
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-books-covers.ts --with-user-token
 *
 * Expects tmp/research-covers/souvenirs-memoir.png
 *         tmp/research-covers/mineral-choreography-book.png
 */
import { createReadStream, existsSync } from "node:fs";
import { join } from "node:path";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DIR = join(process.cwd(), "tmp", "research-covers");

const COVERS = [
  {
    match: /Souvenirs of my Awakening/i,
    file: "souvenirs-memoir.png",
    filename: "words-souvenirs-memoir-cover.png",
  },
  {
    match: /Mineral Choreography: Extraction Sites Vol 1/i,
    file: "mineral-choreography-book.png",
    filename: "words-mineral-choreography-vol1-cover.png",
  },
] as const;

type BookRow = {
  _key?: string;
  _type?: string;
  title?: string;
  cover?: unknown;
  [k: string]: unknown;
};

async function uploadCover(file: string, filename: string) {
  const path = join(DIR, file);
  if (!existsSync(path)) throw new Error(`Missing ${path}`);
  const asset = await client.assets.upload("image", createReadStream(path), {
    filename,
    contentType: "image/png",
  });
  return {
    _type: "image" as const,
    asset: { _type: "reference" as const, _ref: asset._id },
  };
}

async function main() {
  const doc = await client.fetch<{ books?: BookRow[] } | null>(
    `*[_id == "blogsPage"][0]{ books }`,
  );
  if (!doc?.books?.length) throw new Error("blogsPage books missing");

  const books = structuredClone(doc.books);
  let patched = 0;

  for (const spec of COVERS) {
    const row = books.find((b) => spec.match.test(b.title ?? ""));
    if (!row) {
      console.warn(`  ⚠ no book row matching ${spec.match}`);
      continue;
    }
    const image = await uploadCover(spec.file, spec.filename);
    console.log(`  ↑ ${spec.file} → ${row.title}`);
    row.cover = image;
    patched += 1;
  }

  if (!patched) throw new Error("No book rows patched");

  await client.patch("blogsPage").set({ books }).commit();
  console.log(`✓ books covers — ${patched} row(s) updated`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
