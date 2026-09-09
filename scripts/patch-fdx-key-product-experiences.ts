/**
 * Financial Data Exchange — Key Product Experiences (Figma 3719:88185–88255).
 *
 * Four alternating motion bands after §05 Design Process:
 *   1. motionShowcase featured — FDX Mobile consent (#33ab9f)
 *   2. desktopMotionShowcase — FDX Mobile hero (#e3e3db)
 *   3. motionShowcase featured — Mint splash (#7cddc3)
 *   4. desktopMotionShowcase — Mint onboarding (#e7fff8)
 *
 * Replaces any existing motionShowcase / desktopMotionShowcase sections.
 * PNG source: public/work/financial-data-exchange/key-product/01–04-*.png
 * (Figma phone 3719:88188, desktop 3719:88226, phone 3719:88247, desktop 3719:88258).
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-fdx-key-product-experiences.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-fdx-key-product-experiences.ts --with-user-token
 *
 * **Manual images:** After the patch, replace mockups in Studio (Financial Data Exchange →
 * Sections, in order after Design Process). Do not re-run this script unless you want to
 * overwrite images — it re-uploads from public/work/financial-data-exchange/key-product/.
 *
 * | # | Studio section type | Image field |
 * |---|---------------------|-------------|
 * | 1 | 07 — Motion Showcase (featured, teal) | Rows → first row → Items → Image |
 * | 2 | 08 — Desktop Motion Showcase (cream) | Static image fallback |
 * | 3 | 07 — Motion Showcase (featured, mint) | Rows → first row → Items → Image |
 * | 4 | 08 — Desktop Motion Showcase (mint tint) | Static image fallback |
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import collab from "./data/caseStudyCollabCopy.json";
import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const SLUG = "financial-data-exchange";
const DOC_IDS = ["cs-financial-data-exchange", "drafts.cs-financial-data-exchange"];
const ASSET_DIR = join(
  process.cwd(),
  "public/work/financial-data-exchange/key-product",
);

/** Figma 3719:88185–88255 — all four bands use this caption heading. */
const SECTION_TITLE = "Design Interventions";

const collabFdx = collab[SLUG as keyof typeof collab];

const COPY = {
  mobileConsent: {
    label: SECTION_TITLE,
    caption:
      "The core design intervention was a standardized, API-driven consent flow that changed the data handshake. We treated FDX as a headless UI framework — logic, permissions, and disclosure patterns any partner could brand while enforcing strict trust standards.",
  },
  desktopFdxHero: {
    body:
      collabFdx?.desktopMotion?.body ??
      "A conversational walkthrough shows two systems exchanging only what's authorized: a financial app requests a user's accounts, and her bank returns balances and transactions through her own secure token.",
  },
  mobileMintSplash: {
    label: SECTION_TITLE,
    caption:
      "We deployed it first with Intuit Mint. We replaced their legacy screen-scraping logic with our new API-driven flow.",
  },
  desktopMintOnboarding: {
    body:
      "We applied the FDX standard as a headless UI framework directly within the Mint experience. The solution progressively discloses specific data requests, explicitly listing sensitive items such as Social Security numbers and routing numbers, and gives users granular controls to toggle individual accounts and view precise access-expiration dates.",
  },
} as const;

const BANDS = [
  {
    kind: "motionShowcase" as const,
    file: "01-fdx-mobile-consent.png",
    bg: "#33ab9f",
    layoutVariant: "featured" as const,
    copy: COPY.mobileConsent,
  },
  {
    kind: "desktopMotionShowcase" as const,
    file: "02-fdx-mobile-desktop-hero.png",
    bg: "#e3e3db",
    copy: COPY.desktopFdxHero,
  },
  {
    kind: "motionShowcase" as const,
    file: "03-mint-splash-mobile.png",
    bg: "#7cddc3",
    layoutVariant: "featured" as const,
    copy: COPY.mobileMintSplash,
  },
  {
    kind: "desktopMotionShowcase" as const,
    file: "04-mint-onboarding-desktop.png",
    bg: "#e7fff8",
    copy: COPY.desktopMintOnboarding,
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

function appearance(bg: string) {
  return {
    _type: "appearance" as const,
    backgroundColor: sanityColor(bg),
    textColor: sanityColor("#000000"),
  };
}

function buildMobileSection(
  image: SanityImage,
  band: (typeof BANDS)[0 | 2],
): Section {
  return {
    _type: "motionShowcase",
    _key: key(),
    layoutVariant: band.layoutVariant,
    rows: [
      {
        _type: "motionRow",
        _key: key(),
        device: "mobile",
        label: band.copy.label,
        caption: band.copy.caption,
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
    appearance: appearance(band.bg),
  };
}

function buildDesktopSection(
  image: SanityImage,
  band: (typeof BANDS)[1 | 3],
): Section {
  return {
    _type: "desktopMotionShowcase",
    _key: key(),
    sectionTitle: SECTION_TITLE,
    body: pt(band.copy.body),
    posterImage: image,
    appearance: appearance(band.bg),
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
    const accordionIdx = withoutMotion.findIndex(
      (s) => s._type === "accordionSection",
    );
    insertAt = accordionIdx >= 0 ? accordionIdx + 1 : withoutMotion.length;
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

  console.log(`${SLUG} — Key Product Experiences (4 bands, Figma 3719:88185–88255)`);
  BANDS.forEach((b, i) => console.log(`  ${i + 1}. ${b.kind} ${b.file} ${b.bg}`));

  if (DRY) {
    console.log("(dry run — nothing written)");
    return;
  }

  const motionBands: Section[] = [];
  for (const band of BANDS) {
    const image = await uploadImage(join(ASSET_DIR, band.file));
    motionBands.push(
      band.kind === "motionShowcase"
        ? buildMobileSection(image, band)
        : buildDesktopSection(image, band),
    );
  }

  for (const id of DOC_IDS) {
    const doc = await client.fetch<{ sections: Section[] }>(
      `*[_id == $id][0]{ sections }`,
      { id },
    );
    if (!doc?.sections?.length) {
      console.log(`skip ${id} — not found or no sections`);
      continue;
    }

    const { next, insertAt, before, removed } = spliceMotionBands(doc.sections, motionBands);
    await client.patch(id).set({ sections: next }).commit();
    console.log(
      `✓ ${id}: ${before} → ${next.length} sections (removed ${removed} motion band(s), inserted 4 at index ${insertAt})`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
