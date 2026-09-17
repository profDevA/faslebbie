/**
 * The AR Handbook — Key Product Experiences (Figma 4152:122554).
 *
 * Seven alternating bands after Research Artifacts:
 *   1. desktopMotionShowcase — product demo poster (#bbcdbe)
 *   2. motionShowcase crossFunctional — Off-Road (#658181)
 *   3. desktopMotionShowcase — Detect board (#bbcdbe)
 *   4. motionShowcase crossFunctional — Motorcycle (#658181)
 *   5. desktopMotionShowcase — Label & Train board (#bbcdbe)
 *   6. motionShowcase crossFunctional — Snowmobile (#658181)
 *   7. desktopMotionShowcase — Classify board (#bbcdbe)
 *
 * Replaces any existing motionShowcase / desktopMotionShowcase sections.
 * PNG source: public/work/the-ar-handbook/key-product/
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-ar-handbook-key-product-experiences.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-ar-handbook-key-product-experiences.ts --with-user-token
 *   npx sanity exec scripts/patch-ar-handbook-key-product-experiences.ts --with-user-token -- --appearance-only
 *
 * **Manual images:** After the patch, replace mockups in Studio if exports drift.
 * Do not re-run unless you want to overwrite images from public/.
 * **`--appearance-only`** sets tileBorderRadius 0 on desktop bands only — no image re-upload.
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
const SLUG = "the-ar-handbook";
const DOC_IDS = [
  "cs-remote-assistant-object-detection",
  "drafts.cs-remote-assistant-object-detection",
];
const ASSET_DIR = join(
  process.cwd(),
  "public/work/the-ar-handbook/key-product",
);

const SAGE_BG = "#bbcdbe";
const TEAL_BG = "#658181";
const DESIGN_INTERVENTIONS = "Design Interventions";
const CROSS_FUNCTIONAL_TITLE = "Cross Functional Experiences";

const collabAr = collab[SLUG as keyof typeof collab];

const DEVICE_CAPTION =
  "Programme Details: Explore eligibility, required documents, benefits and application guidance.";

const COPY = {
  demo: {
    body:
      collabAr?.desktopMotion?.body ??
      "Industrial workers and factory equipment footage demonstrate real-time, AI-powered part identification across both Mobile and RealWear platforms.",
  },
  detect: {
    body:
      "Detect gives technicians operational visibility — capturing equipment imagery, validating highlighted regions, and accepting or rejecting results before issues become costly downtime.",
  },
  labelTrain: {
    body:
      "Label & Train closes the learning loop — technicians confirm or correct part labels so verified training data improves the recognition model over time.",
  },
  classify: {
    body:
      "Classify delivers frontline precision — a technician scans a single part, reviews match confidence, confirms the result, and links the correct PLM record in under thirty seconds.",
  },
} as const;

type CrossFunctionalBand = {
  kind: "crossFunctional";
  prefix: string;
  theme: string;
  devices: readonly [
    { file: string; device: "mobile" | "tablet" | "desktop"; label: string },
    { file: string; device: "mobile" | "tablet" | "desktop"; label: string },
    { file: string; device: "mobile" | "tablet" | "desktop"; label: string },
  ];
};

type DesktopBand = {
  kind: "desktop";
  file: string;
  copy: { body: string };
  wide?: boolean;
};

type Band = CrossFunctionalBand | DesktopBand;

const BANDS: Band[] = [
  {
    kind: "desktop",
    file: "01-demo-poster.png",
    copy: COPY.demo,
  },
  {
    kind: "crossFunctional",
    prefix: "02-offroad",
    theme: "Off-Road",
    devices: [
      { file: "02-offroad-mobile.png", device: "mobile", label: DEVICE_CAPTION },
      { file: "02-offroad-tablet.png", device: "tablet", label: DEVICE_CAPTION },
      { file: "02-offroad-realwear.png", device: "desktop", label: DEVICE_CAPTION },
    ],
  },
  {
    kind: "desktop",
    file: "03-detect-board.png",
    copy: COPY.detect,
    wide: true,
  },
  {
    kind: "crossFunctional",
    prefix: "04-motorcycle",
    theme: "Motorcycle",
    devices: [
      { file: "04-motorcycle-mobile.png", device: "mobile", label: DEVICE_CAPTION },
      { file: "04-motorcycle-tablet.png", device: "tablet", label: DEVICE_CAPTION },
      { file: "04-motorcycle-realwear.png", device: "desktop", label: DEVICE_CAPTION },
    ],
  },
  {
    kind: "desktop",
    file: "05-label-train-board.png",
    copy: COPY.labelTrain,
    wide: true,
  },
  {
    kind: "crossFunctional",
    prefix: "06-snowmobile",
    theme: "Snowmobile",
    devices: [
      { file: "06-snowmobile-mobile.png", device: "mobile", label: DEVICE_CAPTION },
      { file: "06-snowmobile-tablet.png", device: "tablet", label: DEVICE_CAPTION },
      { file: "06-snowmobile-realwear.png", device: "desktop", label: DEVICE_CAPTION },
    ],
  },
  {
    kind: "desktop",
    file: "07-classify-board.png",
    copy: COPY.classify,
    wide: true,
  },
];

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

function appearance(bg: string, textColor = "#000000") {
  return {
    _type: "appearance" as const,
    backgroundColor: sanityColor(bg),
    textColor: sanityColor(textColor),
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

function buildDesktopSection(
  image: SanityImage,
  band: DesktopBand,
): Section {
  return {
    _type: "desktopMotionShowcase",
    _key: key(),
    sectionTitle: DESIGN_INTERVENTIONS,
    body: pt(band.copy.body),
    posterImage: image,
    appearance: {
      ...appearance(SAGE_BG),
      ...(band.wide ? { maxWidth: "wide" } : {}),
      tileBorderRadius: 0,
    },
  };
}

function patchDesktopAppearance(sections: Section[]): Section[] {
  return sections.map((section) => {
    if (section._type !== "desktopMotionShowcase") return section;
    const app = (section.appearance ?? {}) as Record<string, unknown>;
    return {
      ...section,
      appearance: { ...app, tileBorderRadius: 0 },
    };
  });
}

function buildCrossFunctionalSection(
  images: SanityImage[],
  band: CrossFunctionalBand,
): Section {
  return {
    _type: "motionShowcase",
    _key: key(),
    layoutVariant: "crossFunctional",
    sectionTitle: CROSS_FUNCTIONAL_TITLE,
    rows: band.devices.map((device, i) => ({
      _type: "motionRow",
      _key: key(),
      device: device.device,
      label: device.label,
      captionAlign: "below",
      items: [
        {
          _type: "mediaItem",
          _key: key(),
          mediaType: "image",
          image: images[i],
        },
      ],
    })),
    appearance: appearance(TEAL_BG, "#ffffff"),
  };
}

function requiredFiles(): string[] {
  const files: string[] = [];
  for (const band of BANDS) {
    if (band.kind === "desktop") {
      files.push(band.file);
    } else {
      for (const device of band.devices) {
        files.push(device.file);
      }
    }
  }
  return files;
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
    const showcaseIdx = withoutMotion.findIndex(
      (s) => s._type === "showcaseGallery",
    );
    insertAt = showcaseIdx >= 0 ? showcaseIdx + 1 : withoutMotion.length;
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
  if (APPEARANCE_ONLY) {
    console.log(`${SLUG} — desktopMotionShowcase tileBorderRadius → 0 (appearance-only)`);
    if (DRY) {
      console.log("(dry run — nothing written)");
      return;
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
      const next = patchDesktopAppearance(doc.sections);
      const count = next.filter((s) => s._type === "desktopMotionShowcase").length;
      await client.patch(id).set({ sections: next }).commit();
      console.log(`✓ ${id}: tileBorderRadius 0 on ${count} desktopMotionShowcase band(s)`);
    }
    return;
  }

  for (const file of requiredFiles()) {
    const abs = join(ASSET_DIR, file);
    if (!existsSync(abs)) {
      throw new Error(`Missing ${abs} — export Figma key-product frames first`);
    }
  }

  console.log(`${SLUG} — Key Product Experiences (7 bands, Figma 4152:122554)`);
  BANDS.forEach((b, i) => {
    if (b.kind === "desktop") {
      console.log(`  ${i + 1}. desktopMotionShowcase ${b.file}`);
    } else {
      console.log(
        `  ${i + 1}. motionShowcase crossFunctional ${b.theme} (${b.devices.map((d) => d.file).join(", ")})`,
      );
    }
  });

  if (DRY) {
    console.log("(dry run — nothing written)");
    return;
  }

  const motionBands: Section[] = [];
  for (const band of BANDS) {
    if (band.kind === "desktop") {
      const image = await uploadImage(join(ASSET_DIR, band.file));
      motionBands.push(buildDesktopSection(image, band));
      continue;
    }
    const images = await Promise.all(
      band.devices.map((device) =>
        uploadImage(join(ASSET_DIR, device.file)),
      ),
    );
    motionBands.push(buildCrossFunctionalSection(images, band));
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

    const { next, insertAt, before, removed } = spliceMotionBands(
      doc.sections,
      motionBands,
    );
    await client.patch(id).set({ sections: next }).commit();
    console.log(
      `✓ ${id}: ${before} → ${next.length} sections (removed ${removed} motion band(s), inserted 7 at index ${insertAt})`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
