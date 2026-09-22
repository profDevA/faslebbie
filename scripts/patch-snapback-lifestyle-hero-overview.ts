/**
 * Snapback Lifestyle §01 Hero + §02 Overview (Figma 4152:143794 / mobile 4152:145288).
 *
 * Desktop hero `4152:143796`, mobile `4153:155723` (SLC_MV_Hero.Jpg),
 * overview side photo `4152:151745` (luku-photo collage).
 *
 * Copy: live WP / case-studies.generated.ts (Figma frames still carry Coral lorem).
 *
 *   public/work/snapback-lifestyle/01-hero-desktop.png
 *   public/work/snapback-lifestyle/02-hero-mobile.png
 *   public/work/snapback-lifestyle/03-overview-side.png
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-snapback-lifestyle-hero-overview.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-snapback-lifestyle-hero-overview.ts --with-user-token
 *   npx sanity exec scripts/patch-snapback-lifestyle-hero-overview.ts --with-user-token -- --copy-only
 *   npx sanity exec scripts/patch-snapback-lifestyle-hero-overview.ts --with-user-token -- --hero-only
 *   npx sanity exec scripts/patch-snapback-lifestyle-hero-overview.ts --with-user-token -- --overview-only
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const COPY_ONLY = process.argv.includes("--copy-only");
const HERO_ONLY = process.argv.includes("--hero-only");
const OVERVIEW_ONLY = process.argv.includes("--overview-only");
const SLUG = "snapback-lifestyle";

const ASSET_DIR = join(process.cwd(), "public/work/snapback-lifestyle");
const FILES = {
  hero: join(ASSET_DIR, "01-hero-desktop.png"),
  heroMobile: join(ASSET_DIR, "02-hero-mobile.png"),
  overview: join(ASSET_DIR, "03-overview-side.png"),
} as const;

/** Figma / mobile-cs-extract overview left column */
const OVERVIEW_BAND = "#e8e4dc";
/** Match overview band cream so contain letterbox blends (4152:151745 side export). */
const OVERVIEW_SIDE_BG = "#e8e4dc";

/** Live site hero kicker + Sanity from/to (trim Coral bleed). */
const copy = {
  hero: {
    projectName: "Snapback Lifestyle",
    statement: "Artist & community-led brand storytelling",
    from: "Aspiration",
    to: "Authenticity",
  },
  overview: {
    body: "Launched in October 2017, this four-month campaign increased Luku Watches’ brand awareness by uniting hip-hop culture with brand storytelling in an exclusive partnership with local artists as brand ambassadors. The campaign celebrated individual expression and creativity through artist collaborations, which resulted in increased brand awareness, improved sales across all channels, and a sustainable network of local artist partnerships.",
    disciplines:
      "Art direction · Visual brand storytelling · Research & Market Analysis · Brand positioning · Stakeholder interviews · Community-centered strategy",
    duration: "October 2017 - February 2018",
    team: "Fas Lebbie, Colby Smith, Alec McDonald",
    partners: "Local hip-hop artists, Creative communities (5 cities)",
  },
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
      [`sections[${overviewIdx}].serviceList`]: copy.overview.disciplines,
      [`sections[${overviewIdx}].duration`]: copy.overview.duration,
      [`sections[${overviewIdx}].team`]: `${copy.overview.team}\nPartners: ${copy.overview.partners}`,
      [`sections[${overviewIdx}].sideImageFit`]: "contain",
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
  console.log(`patch-snapback-lifestyle-hero-overview (${DRY ? "dry" : "live"})`);

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

  console.log("✓ Snapback Lifestyle hero + overview patched");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
