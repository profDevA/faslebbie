/**
 * Forever a Surfer §01 Hero + §02 Overview (Figma 4162:23111 / mobile 4162:24607).
 *
 * Desktop hero bitmap `4162:26948`, mobile hero frame `4170:20582` (SPL_MV_Hero.Jpg),
 * overview side: stacked `sideVideo` + `sideImage` (Memory Tubes pattern — WP
 * campaign video + bottom still Figma `4170:20683`).
 *
 * Copy: live WP / case-studies.generated.ts (Figma frames still carry Coral lorem).
 *
 *   public/work/forever-a-surfer/01-hero-desktop.png
 *   public/work/forever-a-surfer/02-hero-mobile.png
 *   public/work/forever-a-surfer/forever-a-surfer-campaign.mp4
 *   public/work/forever-a-surfer/04-overview-side-bottom.png
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-forever-a-surfer-hero-overview.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-forever-a-surfer-hero-overview.ts --with-user-token
 *   npx sanity exec scripts/patch-forever-a-surfer-hero-overview.ts --with-user-token -- --copy-only
 *   npx sanity exec scripts/patch-forever-a-surfer-hero-overview.ts --with-user-token -- --hero-only
 *   npx sanity exec scripts/patch-forever-a-surfer-hero-overview.ts --with-user-token -- --overview-only
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
const SLUG = "forever-a-surfer";

const ASSET_DIR = join(process.cwd(), "public/work/forever-a-surfer");
const FILES = {
  hero: join(ASSET_DIR, "01-hero-desktop.png"),
  heroMobile: join(ASSET_DIR, "02-hero-mobile.png"),
  overviewBottom: join(ASSET_DIR, "04-overview-side-bottom.png"),
  overviewVideo: join(ASSET_DIR, "forever-a-surfer-campaign.mp4"),
} as const;

/** Figma 4162:23131 left column */
const OVERVIEW_BAND = "#e3e3db";
/** Figma mobile overview media panel `4162:24639` */
const OVERVIEW_SIDE_BG = "#33356e";

const copy = {
  hero: {
    projectName: "Forever a Surfer",
    statement: "Transforming surf culture into social activism",
    from: "Recreation",
    to: "Purpose",
  },
  overview: {
    body: "Launched in October 2017, this two-month initiative connected local surfers with social justice activism through FAS Movement brand ambassadors. The campaign increased brand awareness, improved engagement across all channels, and established a sustainable network of surfer partnerships dedicated to social change, integrating humanitarian action with the promotion of surf culture. The initiative leveraged surf workshops and clinics into fundraising opportunities, raising $50,000 for a surf clinic in Sierra Leone. Through integrated lifestyle branding, the campaign successfully bridged recreational surfing with meaningful nonprofit impact.",
    disciplines:
      "Brand strategy development · Social justice advocacy · Social impact campaigns · Partnership development · Photography & videography",
    duration: "October–December 2017",
    team: "Fas Lebbie, Lance Lowry, Nick Jones, Parker Welbeck, local surfers",
    partners: "RedBull Ambassadors",
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
  const {
    heroIdx,
    overviewIdx,
    heroImage,
    heroMobileImage,
    overviewImage,
    overviewVideo,
  } = opts;

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
      [`sections[${overviewIdx}].serviceCategoryLabel`]: "Branding & Strategy",
      [`sections[${overviewIdx}].serviceList`]: copy.overview.disciplines,
      [`sections[${overviewIdx}].duration`]: copy.overview.duration,
      [`sections[${overviewIdx}].team`]: `${copy.overview.team}\nPartners: ${copy.overview.partners}`,
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
  console.log(`patch-forever-a-surfer-hero-overview (${DRY ? "dry" : "live"})`);

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
  if (!OVERVIEW_ONLY) {
    console.log(`  tagline: ${copy.hero.statement}`);
    console.log(`  from/to: ${copy.hero.from} → ${copy.hero.to}`);
  }
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

  console.log("✓ Forever a Surfer hero + overview patched");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
