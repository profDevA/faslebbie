/**
 * Diamond Valuation AI §01 Hero — desktop + mobile from Figma Holistic (28fl2XqojJTa3jEblotAaz).
 *
 * Figma: desktop `4001:75340`, mobile `4002:84551` (DA_MV_Hero.Jpg).
 *
 *   public/work/diamond-valuation-ai/01-hero-desktop.png
 *   public/work/diamond-valuation-ai/02-hero-mobile.png
 *
 * Copy: scripts/data/caseStudyCollabCopy.json → diamond-valuation-ai.hero
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-diamond-valuation-hero.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-diamond-valuation-hero.ts --with-user-token
 *   npx sanity exec scripts/patch-diamond-valuation-hero.ts --with-user-token -- --copy-only
 *   npx sanity exec scripts/patch-diamond-valuation-hero.ts --with-user-token -- --mobile-only
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";

import { getCliClient } from "sanity/cli";

import collab from "./data/caseStudyCollabCopy.json";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const COPY_ONLY = process.argv.includes("--copy-only");
const MOBILE_ONLY = process.argv.includes("--mobile-only");
const DESKTOP_ONLY = process.argv.includes("--desktop-only");
const PUB_ID = "cs-diamond-valuation-ai";

const ASSET_DIR = join(process.cwd(), "public/work/diamond-valuation-ai");
const FILES = {
  desktop: join(ASSET_DIR, "01-hero-desktop.png"),
  mobile: join(ASSET_DIR, "02-hero-mobile.png"),
} as const;

const copy = collab["diamond-valuation-ai" as keyof typeof collab] as {
  hero: {
    projectName: string;
    statement: string;
    from: string;
    to: string;
  };
};

type Section = { _type: string; _key: string; image?: unknown; imageMobile?: unknown };

function heroIdx(sections: Section[]) {
  return sections.findIndex((s) => s._type === "heroSection");
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

async function patchDoc(
  docId: string,
  opts: {
    image?: unknown;
    imageMobile?: unknown;
    docFields?: Record<string, string>;
    heroCaption?: string;
    heroIdx: number;
  },
) {
  const patch = client.patch(docId);
  const { heroIdx: idx, image, imageMobile, docFields, heroCaption } = opts;

  if (docFields) {
    for (const [k, v] of Object.entries(docFields)) patch.set({ [k]: v });
  }
  if (heroCaption !== undefined) patch.set({ [`sections[${idx}].caption`]: heroCaption });
  if (image && !MOBILE_ONLY) patch.set({ [`sections[${idx}].image`]: image });
  if (imageMobile && !DESKTOP_ONLY) patch.set({ [`sections[${idx}].imageMobile`]: imageMobile });

  if (!DRY) await patch.commit();
}

async function main() {
  console.log(`patch-diamond-valuation-hero (${DRY ? "dry" : "live"})`);

  const pub = await client.fetch<{ sections: Section[] }>(
    `*[_id == $id][0]{ sections[]{ _type, _key, image, imageMobile } }`,
    { id: PUB_ID },
  );
  if (!pub?.sections?.length) throw new Error(`Missing ${PUB_ID}`);

  const idx = heroIdx(pub.sections);
  if (idx < 0) throw new Error("No heroSection on published doc");

  const docFields = {
    title: copy.hero.projectName,
    tagline: copy.hero.statement,
    from: copy.hero.from,
    to: copy.hero.to,
  };

  let desktop: unknown;
  let mobile: unknown;

  if (!COPY_ONLY) {
    if (!MOBILE_ONLY) {
      console.log("desktop hero:");
      desktop = await uploadImage(FILES.desktop);
    }
    if (!DESKTOP_ONLY) {
      console.log("mobile hero:");
      mobile = await uploadImage(FILES.mobile);
    }
  }

  const patchOpts = {
    heroIdx: idx,
    image: desktop,
    imageMobile: mobile,
    docFields,
    heroCaption: copy.hero.statement,
  };

  console.log(`→ patch ${PUB_ID}`);
  console.log(`  tagline: ${docFields.tagline}`);
  console.log(`  from/to: ${docFields.from} → ${docFields.to}`);
  await patchDoc(PUB_ID, patchOpts);

  const draftId = `drafts.${PUB_ID}`;
  const draftExists = await client.getDocument(draftId);
  if (draftExists) {
    console.log(`→ sync ${draftId}`);
    await patchDoc(draftId, patchOpts);
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
