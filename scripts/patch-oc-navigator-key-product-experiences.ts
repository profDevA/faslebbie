/**
 * OC Resource Navigator — Key Product Experiences (2 bands).
 *
 * Desktop Figma `4152:73163` (mobile home) + `4152:73020` (desktop home).
 * Mobile Figma `4152:93676` + `4152:93533` (same copy stack; mockups from desktop frames).
 *
 *   1. motionShowcase featured — mobile home (#dbedf5)
 *   2. desktopMotionShowcase single — desktop home (#c5dff0)
 *
 * Replaces leftover empty motionShowcase (stacked / orange).
 *
 * PNG @4×:
 *   public/work/oc-digital-resource-navigator/key-product/01-mobile-home.png  ← 4152:73164
 *   public/work/oc-digital-resource-navigator/key-product/02-desktop-home.png ← 4152:73021
 *
 * Copy: collab `desktopMotion.body` + design-interventions body (ignore Figma lorem).
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-oc-navigator-key-product-experiences.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-oc-navigator-key-product-experiences.ts --with-user-token
 *   npx sanity exec scripts/patch-oc-navigator-key-product-experiences.ts --with-user-token -- --appearance-only
 *
 * Do not re-run full patch after manual Studio uploads.
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import collab from "./data/caseStudyCollabCopy.json";
import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const APPEARANCE_ONLY = process.argv.includes("--appearance-only");
const PUB_ID = "cs-oc-digital-resource-navigator";
const ASSET_DIR = join(
  process.cwd(),
  "public/work/oc-digital-resource-navigator/key-product",
);

const KPE_TITLE = "Key Product Experiences";
const SECTION_TITLE = "Design Interventions";

const collabNav = collab["oc-digital-resource-navigator" as keyof typeof collab] as {
  desktopMotion?: { body?: string };
};

const COPY = {
  mobileCaption:
    collabNav?.desktopMotion?.body ??
    "The public home page doubles as the front door: category tiles and a needs-assessment prompt let residents start from a known category or a guided question, no account required.",
  desktopBody:
    "The design intervention targets individuals seeking mental health services and providers making referrals who struggle with fragmented resource navigation. The Navigator enables users to complete a Social Determinants of Health (SDoH) screener, matches their needs with appropriate resources, facilitates self-referrals or provider referrals, and allows users to track their referral progress. The core intervention was the creation of a dual-sided digital ecosystem: a warm, accessible front door for residents and a high-velocity command center for providers. We realized early on that a static directory would not solve the fragmentation crisis. Instead, we built an intelligent triage engine that acts as connective tissue between the two groups.",
} as const;

const BANDS = [
  {
    kind: "motionShowcase" as const,
    file: "01-mobile-home.png",
    bg: "#dbedf5",
    figma: "4152:73163 / 4152:93676",
  },
  {
    kind: "desktopMotionShowcase" as const,
    file: "02-desktop-home.png",
    bg: "#c5dff0",
    figma: "4152:73020 / 4152:93533",
  },
] as const;

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

type SanityImage = {
  _type: "image";
  asset: { _type: "reference"; _ref: string };
};

type Section = Record<string, unknown> & { _key: string; _type: string };

function pt(text: string) {
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

function appearance(bg: string) {
  return {
    _type: "appearance" as const,
    backgroundColor: sanityColor(bg),
    textColor: sanityColor("#000000"),
    tileBorderRadius: 0,
    maxWidth: "wide" as const,
  };
}

async function uploadImage(absPath: string) {
  const asset = await client.assets.upload("image", createReadStream(absPath), {
    filename: basename(absPath),
    contentType: "image/png",
  });
  console.log(`  ↑ ${basename(absPath)} → ${asset._id}`);
  return {
    _type: "image" as const,
    asset: { _type: "reference" as const, _ref: asset._id },
  } satisfies SanityImage;
}

function buildMobileSection(image: SanityImage, existing?: Section): Section {
  return {
    ...(existing ?? {}),
    _type: "motionShowcase",
    _key: existing?._key ?? key(),
    sectionTitle: KPE_TITLE,
    layoutVariant: "featured",
    titleMarginBottom: 40,
    titleMarginBottomDesktop: 56,
    rows: [
      {
        _type: "motionRow",
        _key: key(),
        device: "mobile",
        label: SECTION_TITLE,
        caption: COPY.mobileCaption,
        captionAlign: "right",
        rowWidthPercent: 22,
        tileBackgroundColor: sanityColor("#ffffff"),
        items: [
          {
            _type: "mediaItem",
            _key: key(),
            mediaType: "image",
            image,
          },
        ],
      },
    ],
    appearance: appearance(BANDS[0].bg),
  };
}

function buildDesktopSection(image: SanityImage, existing?: Section): Section {
  return {
    ...(existing ?? {}),
    _type: "desktopMotionShowcase",
    _key: existing?._key ?? key(),
    layoutVariant: "single",
    sectionTitle: SECTION_TITLE,
    body: pt(COPY.desktopBody),
    posterImage: image,
    videoUrl: undefined,
    videoFile: undefined,
    slides: undefined,
    appearance: appearance(BANDS[1].bg),
  };
}

function spliceMotionBands(sections: Section[], motionBands: Section[]) {
  const firstMotionIdx = sections.findIndex(
    (s) => s._type === "motionShowcase" || s._type === "desktopMotionShowcase",
  );
  const withoutMotion = sections.filter(
    (s) => s._type !== "motionShowcase" && s._type !== "desktopMotionShowcase",
  );

  let insertAt: number;
  if (firstMotionIdx >= 0) {
    insertAt = sections
      .slice(0, firstMotionIdx)
      .filter(
        (s) =>
          s._type !== "motionShowcase" && s._type !== "desktopMotionShowcase",
      ).length;
  } else {
    const galleryIdx = withoutMotion.findIndex(
      (s) => s._type === "showcaseGallery",
    );
    insertAt = galleryIdx >= 0 ? galleryIdx + 1 : withoutMotion.length;
  }

  return [
    ...withoutMotion.slice(0, insertAt),
    ...motionBands,
    ...withoutMotion.slice(insertAt),
  ];
}

async function patchDoc(docId: string) {
  const doc = await client.getDocument(docId);
  if (!doc) return false;

  const sections = [...((doc.sections ?? []) as Section[])];
  const motionIdx = sections.findIndex((s) => s._type === "motionShowcase");
  const desktopIdx = sections.findIndex(
    (s) => s._type === "desktopMotionShowcase",
  );

  if (APPEARANCE_ONLY) {
    if (motionIdx < 0 && desktopIdx < 0) {
      throw new Error(`${docId}: no KPE motion sections to patch`);
    }
    const patch: Record<string, unknown> = {};
    if (motionIdx >= 0) {
      patch[`sections[${motionIdx}].appearance`] = appearance(BANDS[0].bg);
      patch[`sections[${motionIdx}].sectionTitle`] = KPE_TITLE;
      patch[`sections[${motionIdx}].layoutVariant`] = "featured";
    }
    if (desktopIdx >= 0) {
      patch[`sections[${desktopIdx}].appearance`] = appearance(BANDS[1].bg);
      patch[`sections[${desktopIdx}].layoutVariant`] = "single";
    }
    if (!DRY) await client.patch(docId).set(patch).commit();
    console.log(`✓ ${docId}: KPE appearance-only${DRY ? " (dry)" : ""}`);
    return true;
  }

  for (const band of BANDS) {
    const abs = join(ASSET_DIR, band.file);
    if (!existsSync(abs)) {
      throw new Error(`Missing ${abs} — export Figma ${band.figma} @4× first`);
    }
  }

  const mobileImage = DRY
    ? ({ _type: "image", asset: { _type: "reference", _ref: "dry-run" } } as SanityImage)
    : await uploadImage(join(ASSET_DIR, BANDS[0].file));
  const desktopImage = DRY
    ? ({ _type: "image", asset: { _type: "reference", _ref: "dry-run" } } as SanityImage)
    : await uploadImage(join(ASSET_DIR, BANDS[1].file));

  const motionBands = [
    buildMobileSection(mobileImage, motionIdx >= 0 ? sections[motionIdx] : undefined),
    buildDesktopSection(
      desktopImage,
      desktopIdx >= 0 ? sections[desktopIdx] : undefined,
    ),
  ];

  const next = spliceMotionBands(sections, motionBands);
  console.log(
    `${docId}: motion bands ${sections.filter((s) => s._type === "motionShowcase" || s._type === "desktopMotionShowcase").length} → 2`,
  );

  if (!DRY) await client.patch(docId).set({ sections: next }).commit();
  console.log(`✓ ${docId}: ${KPE_TITLE} (featured mobile + desktop)${DRY ? " (dry)" : ""}`);
  return true;
}

async function main() {
  console.log(
    `patch-oc-navigator-key-product-experiences (${DRY ? "dry" : APPEARANCE_ONLY ? "appearance-only" : "live"})`,
  );
  BANDS.forEach((b, i) =>
    console.log(`  ${i + 1}. ${b.kind} ${b.file} ${b.bg} (${b.figma})`),
  );

  await patchDoc(PUB_ID);
  const draftId = `drafts.${PUB_ID}`;
  if (await client.getDocument(draftId)) await patchDoc(draftId);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
