/**
 * The AR Handbook — KPE desktop bands 3, 5, 7 poster carousels (not band 1 video).
 *
 * Bands 2/4/6 (crossFunctional) unchanged. Patches slides[] on the 2nd–4th
 * desktopMotionShowcase sections in doc order.
 *
 * PNG @4× from Figma (export whole frame nodes):
 *   Band 3 Detect — 4 slides: 4152:127889, 4218:21915, 4218:22332, 4218:22601
 *   Band 5 Label & Train — 3: 4218:23001, 4218:23433, 4218:23710
 *   Band 7 Classify — 4: 4218:24141, 4218:24826, 4218:25265, 4218:25525
 *
 * Files (place before run):
 *   public/work/the-ar-handbook/key-product/slider/03-slide-01.png … 03-slide-04.png
 *   public/work/the-ar-handbook/key-product/slider/05-slide-01.png … 05-slide-03.png
 *   public/work/the-ar-handbook/key-product/slider/07-slide-01.png … 07-slide-04.png
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-ar-handbook-kpe-sliders.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-ar-handbook-kpe-sliders.ts --with-user-token
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const SLUG = "the-ar-handbook";
const DOC_IDS = [
  "cs-remote-assistant-object-detection",
  "drafts.cs-remote-assistant-object-detection",
];

const SLIDER_FILES = [
  {
    band: "03-detect",
    files: [
      "03-slide-01.png",
      "03-slide-02.png",
      "03-slide-03.png",
      "03-slide-04.png",
    ],
  },
  {
    band: "05-label-train",
    files: ["05-slide-01.png", "05-slide-02.png", "05-slide-03.png"],
  },
  {
    band: "07-classify",
    files: [
      "07-slide-01.png",
      "07-slide-02.png",
      "07-slide-03.png",
      "07-slide-04.png",
    ],
  },
] as const;

const ASSET_DIR = join(
  process.cwd(),
  "public/work/the-ar-handbook/key-product/slider",
);

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

type SanityImage = {
  _type: "image";
  asset: { _type: "reference"; _ref: string };
};

type Section = Record<string, unknown> & { _key: string; _type: string };

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

function buildSlides(images: SanityImage[], bandLabel: string) {
  return images.map((image, i) => ({
    _type: "desktopMotionSlide" as const,
    _key: key(),
    alt: `${bandLabel} slide ${i + 1}`,
    image,
  }));
}

async function main() {
  for (const group of SLIDER_FILES) {
    for (const file of group.files) {
      const abs = join(ASSET_DIR, file);
      if (!existsSync(abs)) {
        console.error(`Missing: ${abs}`);
        process.exit(1);
      }
    }
  }

  if (DRY) {
    console.log(`${SLUG} — would patch KPE slider bands 3/5/7 (${SLIDER_FILES.map((g) => g.files.length).join("+")} slides)`);
    console.log("(dry run — nothing uploaded or written)");
    return;
  }

  const uploaded = await Promise.all(
    SLIDER_FILES.map(async (group) => {
      const images: SanityImage[] = [];
      for (const file of group.files) {
        images.push(await uploadImage(join(ASSET_DIR, file)));
      }
      return { band: group.band, slides: buildSlides(images, group.band) };
    }),
  );

  for (const id of DOC_IDS) {
    const doc = await client.fetch<{ sections?: Section[] } | null>(
      `*[_id == $id][0]{ sections }`,
      { id },
    );
    if (!doc?.sections?.length) {
      console.log(`skip ${id} — no sections`);
      continue;
    }

    const desktopIdx: number[] = [];
    doc.sections.forEach((s, i) => {
      if (s._type === "desktopMotionShowcase") desktopIdx.push(i);
    });

    if (desktopIdx.length < 4) {
      console.error(
        `${id}: expected 4 desktopMotionShowcase bands, found ${desktopIdx.length}`,
      );
      process.exit(1);
    }

    const targetIndices = [desktopIdx[1], desktopIdx[2], desktopIdx[3]];
    const next = doc.sections.map((s) => ({ ...s }));

    uploaded.forEach((data, i) => {
      const idx = targetIndices[i];
      const section = next[idx] as Section & {
        posterImage?: SanityImage;
        slides?: unknown[];
      };
      section.slides = data.slides;
      section.posterImage = (data.slides[0] as { image: SanityImage }).image;
      console.log(
        `  patch ${data.band} @ section index ${idx} (${data.slides.length} slides)`,
      );
    });

    await client.patch(id).set({ sections: next }).commit();
    console.log(`✓ ${id}: KPE slider bands 3/5/7 updated`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
