/**
 * Design Assist AI §01 Hero — desktop + mobile from Figma Holistic (28fl2XqojJTa3jEblotAaz).
 *
 * Figma: desktop `3719:64865`, mobile `3936:8858` hero collage.
 *
 *   public/work/design-assist-ai/01-hero-desktop.png
 *   public/work/design-assist-ai/02-hero-mobile.png
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-design-assist-hero.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-design-assist-hero.ts --with-user-token
 *   npx sanity exec scripts/patch-design-assist-hero.ts --with-user-token -- --mobile-only
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const MOBILE_ONLY = process.argv.includes("--mobile-only");
const DESKTOP_ONLY = process.argv.includes("--desktop-only");
const SLUG = "design-assist-ai";
const PUB_ID = "cs-design-assist-ai";

const ASSET_DIR = join(process.cwd(), "public/work/design-assist-ai");
const FILES = {
  desktop: join(ASSET_DIR, "01-hero-desktop.png"),
  mobile: join(ASSET_DIR, "02-hero-mobile.png"),
} as const;

type Section = { _type: string; _key: string; image?: unknown; imageMobile?: unknown };

function heroIdx(sections: Section[]) {
  return sections.findIndex((s) => s._type === "heroSection");
}

async function uploadImage(absPath: string) {
  if (!existsSync(absPath)) throw new Error(`Missing ${absPath}`);
  const ext = absPath.toLowerCase().endsWith(".jpg") || absPath.toLowerCase().endsWith(".jpeg")
    ? "image/jpeg"
    : "image/png";
  const asset = await client.assets.upload("image", createReadStream(absPath), {
    filename: basename(absPath),
    contentType: ext,
  });
  console.log(`  ↑ ${basename(absPath)} → ${asset._id}`);
  return {
    _type: "image" as const,
    asset: { _type: "reference" as const, _ref: asset._id },
  };
}

async function patchDoc(docId: string, image?: unknown, imageMobile?: unknown) {
  const doc = await client.getDocument(docId);
  if (!doc) return false;
  const sections = (doc.sections ?? []) as Section[];
  const idx = heroIdx(sections);
  if (idx < 0) throw new Error(`${docId}: no heroSection`);

  const patch = client.patch(docId);
  if (image && !MOBILE_ONLY) patch.set({ [`sections[${idx}].image`]: image });
  if (imageMobile && !DESKTOP_ONLY) patch.set({ [`sections[${idx}].imageMobile`]: imageMobile });
  if (!DRY) await patch.commit();
  return true;
}

async function main() {
  console.log(`patch-design-assist-hero (${DRY ? "dry" : "live"})`);

  const pub = await client.fetch<{ sections: Section[] }>(
    `*[_id == $id][0]{ sections[]{ _type, _key, image, imageMobile } }`,
    { id: PUB_ID },
  );
  if (!pub?.sections?.length) throw new Error(`Missing ${PUB_ID}`);

  const idx = heroIdx(pub.sections);
  if (idx < 0) throw new Error("No heroSection on published doc");

  let desktop: unknown;
  let mobile: unknown;

  if (!MOBILE_ONLY) {
    console.log("desktop hero:");
    desktop = await uploadImage(FILES.desktop);
  }
  if (!DESKTOP_ONLY) {
    console.log("mobile hero:");
    mobile = await uploadImage(FILES.mobile);
  }

  console.log(`→ patch ${PUB_ID}`);
  await patchDoc(PUB_ID, desktop, mobile);

  const draftId = `drafts.${PUB_ID}`;
  const draftExists = await client.getDocument(draftId);
  if (draftExists) {
    console.log(`→ sync ${draftId}`);
    await patchDoc(draftId, desktop, mobile);
  }

  if (DRY) {
    console.log("(dry run — no writes)");
    return;
  }

  console.log("✓ hero patched");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
