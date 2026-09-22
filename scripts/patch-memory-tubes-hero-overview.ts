/**
 * Memory Tubes §01 Hero + §02 Overview (Figma 4152:101575 / mobile 4152:103447).
 *
 * Figma: desktop hero bitmap `4152:101578` (no burned-in caption — site overlays collab),
 * mobile hero `4152:133610` (DA_MV_Hero.Jpg),
 * overview side: stacked `sideVideo` + `sideImage` (Figma `4152:133564` area →
 * `Union-Square-Probing.mp4`; bottom still `4152:133565`).
 *
 *   public/work/memory-tubes/01-hero-desktop.png
 *   public/work/memory-tubes/02-hero-mobile.png
 *   public/work/memory-tubes/04-overview-side-bottom.png
 *   public/work/memory-tubes/Union-Square-Probing.mp4
 *
 * Copy: scripts/data/caseStudyCollabCopy.json → memory-tubes.hero / overview
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-memory-tubes-hero-overview.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-memory-tubes-hero-overview.ts --with-user-token
 *   npx sanity exec scripts/patch-memory-tubes-hero-overview.ts --with-user-token -- --copy-only
 *   npx sanity exec scripts/patch-memory-tubes-hero-overview.ts --with-user-token -- --hero-only
 *   npx sanity exec scripts/patch-memory-tubes-hero-overview.ts --with-user-token -- --overview-only
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
const SLUG = "memory-tubes";

const ASSET_DIR = join(process.cwd(), "public/work/memory-tubes");
const FILES = {
  hero: join(ASSET_DIR, "01-hero-desktop.png"),
  heroMobile: join(ASSET_DIR, "02-hero-mobile.png"),
  overviewBottom: join(ASSET_DIR, "04-overview-side-bottom.png"),
  overviewVideo: join(ASSET_DIR, "Union-Square-Probing.mp4"),
} as const;

/** Figma 4152:101595 left column band */
const OVERVIEW_BAND = "#e3e3db";
/** Figma LW_PO.Jpg panel */
const OVERVIEW_SIDE_BG = "#000000";

const copy = collab[SLUG as keyof typeof collab] as {
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

async function uploadVideo(absPath: string) {
  if (!existsSync(absPath)) throw new Error(`Missing ${absPath}`);
  const asset = await client.assets.upload("file", createReadStream(absPath), {
    filename: basename(absPath),
    contentType: "video/mp4",
  });
  console.log(`  ↑ ${basename(absPath)} → ${asset._id}`);
  return {
    _type: "file" as const,
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
    overviewVideo?: unknown;
  },
) {
  const patch = client.patch(docId);
  const { heroIdx, overviewIdx, heroImage, heroMobileImage, overviewImage, overviewVideo } =
    opts;

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
    if (overviewVideo) {
      patch.set({ [`sections[${overviewIdx}].sideVideo`]: overviewVideo });
    }
  }

  if (!DRY) await patch.commit();
}

async function main() {
  console.log(`patch-memory-tubes-hero-overview (${DRY ? "dry" : "live"})`);

  const pub = await client.fetch<{ _id: string; sections: Section[] }>(
    `*[_type == "caseStudy" && slug.current == $slug && !(_id in path("drafts.**"))][0]{
      _id, sections[]{ _type, _key }
    }`,
    { slug: SLUG },
  );
  if (!pub?.sections?.length) throw new Error(`Missing published ${SLUG}`);

  const heroIdx = idxOf(pub.sections, "heroSection");
  const overviewIdx = idxOf(pub.sections, "overviewSection");
  if (heroIdx < 0) throw new Error("No heroSection");
  if (overviewIdx < 0) throw new Error("No overviewSection");
  console.log(`doc ${pub._id} hero[${heroIdx}] overview[${overviewIdx}]`);

  let heroImage: unknown;
  let heroMobileImage: unknown;
  let overviewImage: unknown;
  let overviewVideo: unknown;
  if (!COPY_ONLY) {
    if (!OVERVIEW_ONLY) {
      console.log("hero desktop:");
      heroImage = await uploadImage(FILES.hero);
      console.log("hero mobile:");
      heroMobileImage = await uploadImage(FILES.heroMobile);
    }
    if (!HERO_ONLY) {
      console.log("overview side video:");
      overviewVideo = await uploadVideo(FILES.overviewVideo);
      console.log("overview side bottom still:");
      overviewImage = await uploadImage(FILES.overviewBottom);
    }
  }

  const opts = {
    heroIdx,
    overviewIdx,
    heroImage,
    heroMobileImage,
    overviewImage,
    overviewVideo,
  };

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

  console.log("✓ Memory Tubes hero + overview patched");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
