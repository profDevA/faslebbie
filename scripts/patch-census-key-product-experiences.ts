/**
 * US Census — Key Product Experiences split into two bands (Figma 2229:30253 + 2229:30432):
 * - §07 motionShowcase: cream #e3e3db, featured mobile mockup, caption bottom-left
 * - §08 desktopMotionShowcase: blue #194498, desktop mockup, caption bottom-right
 *
 * Uses field-level patches only — never replaces the full sections array.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-census-key-product-experiences.ts --with-user-token
 *   npx sanity exec scripts/patch-census-key-product-experiences.ts --with-user-token -- --dry
 *
 * If content was wiped by an earlier version, run patch-census-restore-from-history.ts first.
 */
import { createReadStream, existsSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import collab from "./data/caseStudyCollabCopy.json";
import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

const SLUG = "2020-us-census-benefit-calculator";
const MOBILE_BG = "#e3e3db";
const DESKTOP_BG = "#194498";
const MOBILE_FILE = join(process.cwd(), "tmp", "census-covers", "key-product-mobile.png");
const DRY = process.argv.includes("--dry");

const MOBILE = {
  label: "Benefit Calculator",
  caption:
    "Millions of immigrant children risked being undercounted due to fear, misinformation, and limited resource access. Empowering immigrant families to count every child, every need, every future.",
  rowWidthPercent: 22,
} as const;

const DESKTOP = {
  sectionTitle: "Programme Discovery",
  body:
    collab[SLUG as keyof typeof collab]?.desktopMotion?.body ??
    "A walkthrough shows a parent moving from a ZIP code and a few household details to a personalized list of programmes, then into a programme's eligibility and application steps.",
} as const;

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

type SanityImage = {
  _type: "image";
  asset: { _type: "reference"; _ref: string };
};

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

function imageItem(image: SanityImage) {
  return {
    _type: "mediaItem" as const,
    _key: key(),
    mediaType: "image" as const,
    image,
  };
}

async function uploadMobileMockup(client: ReturnType<typeof getCliClient>) {
  if (!existsSync(MOBILE_FILE)) {
    throw new Error(`Missing ${MOBILE_FILE} — export Figma 2229:30257 first`);
  }
  const asset = await client.assets.upload("image", createReadStream(MOBILE_FILE), {
    filename: "census-key-product-mobile.png",
    contentType: "image/png",
  });
  console.log(`  ↑ mobile mockup → ${asset._id}`);
  return {
    _type: "image" as const,
    asset: { _type: "reference" as const, _ref: asset._id },
  };
}

async function main() {
  const client = getCliClient({ apiVersion: "2025-01-01" });
  const doc: {
    _id: string;
    sections: {
      _key: string;
      _type: string;
      sectionTitle?: string;
      body?: unknown;
      sideImage?: unknown;
      rows?: { device?: string; items?: { image?: SanityImage }[] }[];
      posterImage?: SanityImage;
    }[];
  } = await client.fetch(
    `*[_type == "caseStudy" && slug.current == $slug][0]{
      _id,
      sections[]{
        _key,
        _type,
        sectionTitle,
        body,
        sideImage,
        posterImage,
        rows[]{ device, items[]{ image } }
      }
    }`,
    { slug: SLUG },
  );
  if (!doc?._id) throw new Error(`case study not found: ${SLUG}`);

  const overview = doc.sections.find((s) => s._type === "overviewSection");
  if (!overview?.body && !overview?.sideImage) {
    throw new Error(
      "Overview section looks empty — run patch-census-restore-from-history.ts first",
    );
  }

  const motionIdx = doc.sections.findIndex((s) => s._type === "motionShowcase");
  if (motionIdx < 0) throw new Error("no motionShowcase section");

  const motion = doc.sections[motionIdx];
  const desktopImage =
    motion.rows?.find((r) => r.device === "desktop")?.items?.[0]?.image ??
    doc.sections.find((s) => s._type === "desktopMotionShowcase")?.posterImage ??
    motion.rows?.[0]?.items?.[0]?.image;

  if (!desktopImage?.asset?._ref) {
    throw new Error("desktop showcase image missing — upload desktop mockup in Studio first");
  }

  const mobileRow = {
    _type: "motionRow" as const,
    _key: key(),
    device: "mobile" as const,
    label: MOBILE.label,
    caption: MOBILE.caption,
    captionAlign: "left" as const,
    rowWidthPercent: MOBILE.rowWidthPercent,
    tileBackgroundColor: sanityColor("#ffffff"),
    items: [] as ReturnType<typeof imageItem>[],
  };

  let desktopIdx = doc.sections.findIndex((s) => s._type === "desktopMotionShowcase");
  const desktopSection = {
    _type: "desktopMotionShowcase" as const,
    _key: desktopIdx >= 0 ? doc.sections[desktopIdx]._key : key(),
    sectionTitle: DESKTOP.sectionTitle,
    body: pt(DESKTOP.body),
    posterImage: desktopImage,
    appearance: {
      _type: "appearance" as const,
      backgroundColor: sanityColor(DESKTOP_BG),
      textColor: sanityColor("#ffffff"),
    },
  };

  console.log("§07 motionShowcase → featured mobile band (cream)");
  console.log(`  desktop asset: ${desktopImage.asset._ref}`);
  console.log(
    desktopIdx >= 0
      ? `§08 desktopMotionShowcase[${desktopIdx}] → blue band`
      : "§08 desktopMotionShowcase → insert after motionShowcase",
  );

  if (DRY) {
    console.log("(dry run — nothing written)");
    return;
  }

  const mobileImage = await uploadMobileMockup(client);
  mobileRow.items = [imageItem(mobileImage)];

  let patch = client.patch(doc._id).set({
    [`sections[${motionIdx}].sectionTitle`]: "Key Product Experiences",
    [`sections[${motionIdx}].layoutVariant`]: "featured",
    [`sections[${motionIdx}].rows`]: [mobileRow],
    [`sections[${motionIdx}].appearance.backgroundColor`]: sanityColor(MOBILE_BG),
  });

  if (desktopIdx >= 0) {
    patch = patch.set({
      [`sections[${desktopIdx}].sectionTitle`]: desktopSection.sectionTitle,
      [`sections[${desktopIdx}].body`]: desktopSection.body,
      [`sections[${desktopIdx}].posterImage`]: desktopSection.posterImage,
      [`sections[${desktopIdx}].appearance`]: desktopSection.appearance,
    });
  } else {
    patch = patch.insert("after", `sections[${motionIdx}]`, [desktopSection]);
  }

  await patch.commit();
  console.log("✓ Census Key Product Experiences patched (split mobile + desktop bands)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
