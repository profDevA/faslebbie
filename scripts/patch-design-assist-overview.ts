/**
 * Design Assist AI §02 Overview — product still from live WP (Figma 3719:64895 still
 * embeds Mosaic “Foam museum entrance” placeholder — do not export from Figma).
 *
 * Source: fasandsabrina.com/wp-content/.../Section.png
 * PNG: public/work/design-assist-ai/03-overview-side.png
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-design-assist-overview.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-design-assist-overview.ts --with-user-token
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const SLUG = "design-assist-ai";
const PUB_ID = "cs-design-assist-ai";
const IMAGE_FILE = join(process.cwd(), "public/work/design-assist-ai/03-overview-side.png");

type Section = { _type: string; _key: string; image?: unknown };

function overviewIdx(sections: Section[]) {
  return sections.findIndex((s) => s._type === "overviewSection");
}

async function uploadImage(absPath: string) {
  if (!existsSync(absPath)) throw new Error(`Missing ${absPath}`);
  const asset = await client.assets.upload("image", createReadStream(absPath), {
    filename: basename(absPath),
    contentType: "image/png",
  });
  console.log(`  ↑ ${basename(absPath)} → ${asset._id}`);
  return {
    _type: "image" as const,
    asset: { _type: "reference" as const, _ref: asset._id },
  };
}

async function patchDoc(docId: string, image: unknown) {
  const doc = await client.getDocument(docId);
  if (!doc) return false;
  const sections = (doc.sections ?? []) as Section[];
  const idx = overviewIdx(sections);
  if (idx < 0) throw new Error(`${docId}: no overviewSection`);

  if (!DRY) {
    await client.patch(docId).set({ [`sections[${idx}].image`]: image }).commit();
  }
  return true;
}

async function main() {
  console.log(`patch-design-assist-overview (${DRY ? "dry" : "live"})`);

  const pub = await client.fetch<{ sections: Section[] }>(
    `*[_id == $id][0]{ sections[]{ _type, _key, image } }`,
    { id: PUB_ID },
  );
  if (!pub?.sections?.length) throw new Error(`Missing ${PUB_ID}`);

  const idx = overviewIdx(pub.sections);
  if (idx < 0) throw new Error("No overviewSection on published doc");

  console.log("overview side image:");
  const image = DRY
    ? { _type: "image", asset: { _type: "reference", _ref: "dry-run" } }
    : await uploadImage(IMAGE_FILE);

  console.log(`→ patch ${PUB_ID}`);
  await patchDoc(PUB_ID, image);

  const draftId = `drafts.${PUB_ID}`;
  if (await client.getDocument(draftId)) {
    console.log(`→ sync ${draftId}`);
    await patchDoc(draftId, image);
  }

  if (DRY) {
    console.log("(dry run — no writes)");
    return;
  }

  console.log("✓ overview image patched");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
