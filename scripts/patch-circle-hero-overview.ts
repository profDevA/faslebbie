/**
 * Circle §01 Hero + §02 Overview (Figma `4171:32095` / mobile `4171:37062`).
 *
 * Desktop hero collage `4412:35227`, mobile hero `4412:35779`.
 * Overview side: Live AR phone mock (`4171:32108` right column / `4172:67225`).
 *
 * Copy: `scripts/data/caseStudyCollabCopy.json` → `circle` (Figma still has Coral
 * lorem on hero caption — replace when collab doc lands).
 *
 *   public/work/circle/01-hero-desktop.png
 *   public/work/circle/02-hero-mobile.png
 *   public/work/circle/03-overview-side.png
 *
 * Run from frontend/:
 *   npx sanity exec scripts/seed-circle-case-study.ts --with-user-token
 *   npx sanity exec scripts/patch-circle-hero-overview.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-circle-hero-overview.ts --with-user-token
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

import collab from "./data/caseStudyCollabCopy.json";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const COPY_ONLY = process.argv.includes("--copy-only");
const HERO_ONLY = process.argv.includes("--hero-only");
const OVERVIEW_ONLY = process.argv.includes("--overview-only");
const SLUG = "circle";
const PUB_ID = "cs-circle";

const ASSET_DIR = join(process.cwd(), "public/work/circle");
const FILES = {
  hero: join(ASSET_DIR, "01-hero-desktop.png"),
  heroMobile: join(ASSET_DIR, "02-hero-mobile.png"),
  overview: join(ASSET_DIR, "03-overview-side.png"),
} as const;

/** Figma overview band `4171:32108` */
const OVERVIEW_BAND = "#e3e3db";
/** Figma overview media panel gradient base `#2a2828` */
const OVERVIEW_SIDE_BG = "#2a2828";

const copy = collab["circle" as keyof typeof collab] as {
  hero: {
    projectName: string;
    statement: string;
    from: string;
    to: string;
  };
  overview: {
    body: string;
    disciplines: string;
    duration: string;
    team: string;
  };
};

type Section = { _type: string; _key: string };

function key() {
  return randomUUID().replace(/-/g, "").slice(0, 12);
}

function pt(text: string) {
  return [
    {
      _type: "block" as const,
      _key: key(),
      style: "normal" as const,
      markDefs: [],
      children: [{ _type: "span" as const, _key: key(), text, marks: [] }],
    },
  ];
}

function idxOf(sections: Section[], type: string) {
  return sections.findIndex((s) => s._type === type);
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
    heroIdx: number;
    overviewIdx: number;
    heroImage?: unknown;
    heroMobileImage?: unknown;
    overviewImage?: unknown;
  },
) {
  const patch = client.patch(docId);
  const { heroIdx, overviewIdx, heroImage, heroMobileImage, overviewImage } = opts;

  if (!OVERVIEW_ONLY) {
    patch.set({
      title: copy.hero.projectName,
      tagline: copy.hero.statement,
      from: copy.hero.from,
      to: copy.hero.to,
      [`sections[${heroIdx}].caption`]: copy.hero.statement,
      [`sections[${heroIdx}].headingOverride`]: copy.hero.projectName,
    });
    if (heroImage) patch.set({ [`sections[${heroIdx}].image`]: heroImage });
    if (heroMobileImage) {
      patch.set({ [`sections[${heroIdx}].imageMobile`]: heroMobileImage });
    }
  }

  if (!HERO_ONLY) {
    patch.set({
      [`sections[${overviewIdx}].sectionTitle`]: "Overview",
      [`sections[${overviewIdx}].body`]: pt(copy.overview.body),
      [`sections[${overviewIdx}].serviceCategoryLabel`]: "Research & Design",
      [`sections[${overviewIdx}].serviceList`]: copy.overview.disciplines.replace(
        /\.$/,
        "",
      ),
      [`sections[${overviewIdx}].duration`]: copy.overview.duration,
      [`sections[${overviewIdx}].team`]: copy.overview.team,
      [`sections[${overviewIdx}].sideImageFit`]: "cover",
      [`sections[${overviewIdx}].sideImageBackgroundColor`]:
        sanityColor(OVERVIEW_SIDE_BG),
      [`sections[${overviewIdx}].appearance.backgroundColor`]:
        sanityColor(OVERVIEW_BAND),
    });
    if (overviewImage) {
      patch.set({ [`sections[${overviewIdx}].sideImage`]: overviewImage });
    }
  }

  if (!DRY) await patch.commit();
}

async function main() {
  console.log(`patch-circle-hero-overview (${DRY ? "dry" : "live"})`);

  const pub = await client.fetch<{ _id: string; sections: Section[] }>(
    `*[_type == "caseStudy" && slug.current == $slug && !(_id in path("drafts.**"))][0]{
      _id, sections[]{ _type, _key }
    }`,
    { slug: SLUG },
  );
  if (!pub?.sections?.length) {
    throw new Error(`Missing published ${SLUG} — run seed-circle-case-study.ts first`);
  }

  const heroIdx = idxOf(pub.sections, "heroSection");
  const overviewIdx = idxOf(pub.sections, "overviewSection");
  if (heroIdx < 0) throw new Error("No heroSection");
  if (overviewIdx < 0) throw new Error("No overviewSection");
  console.log(`doc ${pub._id} hero[${heroIdx}] overview[${overviewIdx}]`);

  let heroImage: unknown;
  let heroMobileImage: unknown;
  let overviewImage: unknown;
  if (!COPY_ONLY) {
    if (!OVERVIEW_ONLY) {
      console.log("hero desktop:");
      heroImage = await uploadImage(FILES.hero);
      console.log("hero mobile:");
      heroMobileImage = await uploadImage(FILES.heroMobile);
    }
    if (!HERO_ONLY) {
      console.log("overview side:");
      overviewImage = await uploadImage(FILES.overview);
    }
  }

  const opts = { heroIdx, overviewIdx, heroImage, heroMobileImage, overviewImage };

  console.log(`→ patch ${pub._id}`);
  console.log(`  tagline: ${copy.hero.statement}`);
  console.log(`  from/to: ${copy.hero.from} → ${copy.hero.to}`);
  await patchDoc(pub._id, opts);

  const draftId = `drafts.${pub._id}`;
  if (await client.getDocument(draftId)) {
    console.log(`→ sync ${draftId}`);
    await patchDoc(draftId, opts);
  }

  if (DRY) {
    console.log("(dry run — no writes)");
    return;
  }

  console.log("✓ Circle hero + overview patched");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
