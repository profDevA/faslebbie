/**
 * US Census — Key Product Experiences (Figma Holistic 3999:52313 / 3999:54687).
 *
 * Two bands after Design Process / Research Artifacts:
 *   1. motionShowcase featured — mobile consent hero (#e3e3db)
 *   2. desktopMotionShowcase — desktop marketing site (#194498)
 *
 * Caption heading on both bands: Design Interventions (Figma 3999:55762 / 3999:53546).
 *
 * PNG source: public/work/2020-us-census-benefit-calculator/key-product/
 *   01-mobile-benefits.png  — phone 4001:70876 / 3999:60902
 *   02-desktop-marketing.png — desktop 3999:61079
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-census-key-product-experiences.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-census-key-product-experiences.ts --with-user-token
 *
 * **Manual images:** After the patch, replace mockups in Studio if MCP exports are off.
 * Do not re-run this script unless you want to overwrite images.
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import collab from "./data/caseStudyCollabCopy.json";
import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const SLUG = "2020-us-census-benefit-calculator";
const DOC_IDS = [
  "cs-2020-us-census-benefit-calculator",
  "drafts.cs-2020-us-census-benefit-calculator",
];
const ASSET_DIR = join(
  process.cwd(),
  "public/work/2020-us-census-benefit-calculator/key-product",
);

/** Figma Holistic — both bands use this caption heading. */
const SECTION_TITLE = "Design Interventions";

const collabCensus = collab[SLUG as keyof typeof collab];

const COPY = {
  mobile: {
    label: SECTION_TITLE,
    caption:
      "Millions of immigrant children risked being undercounted due to fear, misinformation, and limited resource access. Empowering immigrant families to count every child, every need, every future.",
  },
  desktop: {
    body:
      collabCensus?.desktopMotion?.body ??
      "A walkthrough shows a parent moving from a ZIP code and a few household details to a personalized list of programmes, then into a programme's eligibility and application steps.",
  },
} as const;

const BANDS = [
  {
    kind: "motionShowcase" as const,
    file: "01-mobile-benefits.png",
    bg: "#e3e3db",
    layoutVariant: "featured" as const,
    copy: COPY.mobile,
  },
  {
    kind: "desktopMotionShowcase" as const,
    file: "02-desktop-marketing.png",
    bg: "#194498",
    textColor: "#ffffff",
    copy: COPY.desktop,
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

function appearance(bg: string, textColor = "#000000") {
  return {
    _type: "appearance" as const,
    backgroundColor: sanityColor(bg),
    textColor: sanityColor(textColor),
  };
}

function buildMobileSection(image: SanityImage): Section {
  return {
    _type: "motionShowcase",
    _key: key(),
    layoutVariant: "featured",
    rows: [
      {
        _type: "motionRow",
        _key: key(),
        device: "mobile",
        label: COPY.mobile.label,
        caption: COPY.mobile.caption,
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

function buildDesktopSection(image: SanityImage): Section {
  return {
    _type: "desktopMotionShowcase",
    _key: key(),
    sectionTitle: SECTION_TITLE,
    body: pt(COPY.desktop.body),
    posterImage: image,
    appearance: appearance(BANDS[1].bg, BANDS[1].textColor),
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

  const next = [
    ...withoutMotion.slice(0, insertAt),
    ...motionBands,
    ...withoutMotion.slice(insertAt),
  ];
  return {
    next,
    insertAt,
    before: sections.length,
    removed: sections.length - withoutMotion.length,
  };
}

async function main() {
  for (const band of BANDS) {
    const abs = join(ASSET_DIR, band.file);
    if (!existsSync(abs)) {
      throw new Error(`Missing ${abs} — export Figma key-product frames first`);
    }
  }

  console.log(`${SLUG} — Key Product Experiences (2 bands, Figma 3999:52313)`);
  BANDS.forEach((b, i) => console.log(`  ${i + 1}. ${b.kind} ${b.file} ${b.bg}`));

  if (DRY) {
    console.log("(dry run — nothing written)");
    return;
  }

  const mobileImage = await uploadImage(join(ASSET_DIR, BANDS[0].file));
  const desktopImage = await uploadImage(join(ASSET_DIR, BANDS[1].file));
  const motionBands = [
    buildMobileSection(mobileImage),
    buildDesktopSection(desktopImage),
  ];

  for (const id of DOC_IDS) {
    const doc = await client.fetch<{ sections: Section[] }>(
      `*[_id == $id][0]{ sections }`,
      { id },
    );
    if (!doc?.sections?.length) {
      console.log(`skip ${id} — not found or no sections`);
      continue;
    }

    const { next, insertAt, before, removed } = spliceMotionBands(
      doc.sections,
      motionBands,
    );
    await client.patch(id).set({ sections: next }).commit();
    console.log(
      `✓ ${id}: ${before} → ${next.length} sections (removed ${removed} motion band(s), inserted 2 at index ${insertAt})`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
