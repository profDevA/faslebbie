/**
 * The AR Handbook — View More popups on KPE cross-functional bands 2, 4, 6.
 *
 * Band 2 = **Detect**, band 4 = **Label & Train**, band 6 = **Classify**.
 * Tab counts (Figma popup frames — one CE-style modal per band, device tabs inside):
 *   Detect — `4290:23592` + `4292:25396` (same modal; ignore duplicate link): M4 / I8 / R10
 *   Label & Train — `4292:27867` + `4292:28529`: M2 / I4 / R4
 *   Classify — `4292:30155`: M6 / I10 / R10
 * View More CTA on band 2: `4295:39701`
 *
 * Assets: live WP flow PNGs (correct counts per tab) until Figma @4× plates land in
 * `public/work/the-ar-handbook/key-product/view-more/` — then switch `ASSET_MODE` to local.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-ar-handbook-kpe-view-more-popups.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-ar-handbook-kpe-view-more-popups.ts --with-user-token
 *   npx sanity exec scripts/patch-ar-handbook-kpe-view-more-popups.ts --with-user-token -- --appearance-only
 *
 * **Do not re-run full patch after manual Studio uploads.**
 */
import { createWriteStream, existsSync, mkdirSync } from "node:fs";
import { createReadStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const APPEARANCE_ONLY = process.argv.includes("--appearance-only");
const SLUG = "the-ar-handbook";
const DOC_IDS = [
  "cs-remote-assistant-object-detection",
  "drafts.cs-remote-assistant-object-detection",
];
const WP_CACHE = join(
  process.cwd(),
  "public/work/the-ar-handbook/core-flow/popup-tabs",
);
const LOCAL_ROOT = join(
  process.cwd(),
  "public/work/the-ar-handbook/key-product/view-more",
);
const WP = "http://fasandsabrina.com/wp-content/uploads/2024/12";

const POPUP_BG = "#bbcdbe";
const POPUP_TILE = "#4d585a";
const KICKER = "Design Interventions";

const WP_MOBILE = [
  "1-4-scaled.png",
  "2-3-scaled.png",
  "3-4-scaled.png",
  "4-4-scaled.png",
  "5-4-scaled.png",
  "6-4-scaled.png",
  "7-4-scaled.png",
  "8-3-scaled.png",
  "9-3-scaled.png",
  "10-4-scaled.png",
  "11-3-scaled.png",
  "12-6-scaled.png",
] as const;

const WP_IPAD = [
  "1-5-scaled.png",
  "2-4-scaled.png",
  "3-5-scaled.png",
  "4-5-scaled.png",
  "5-5-scaled.png",
  "6-5-scaled.png",
  "7-5-scaled.png",
  "8-4-scaled.png",
  "9-4-scaled.png",
  "10-5-scaled.png",
  "11-4-scaled.png",
  "12-7-scaled.png",
  "13-12-scaled.png",
  "14-8-scaled.png",
] as const;

const WP_REALWEAR = [
  "1-6-scaled.png",
  "2-5-scaled.png",
  "3-6-scaled.png",
  "4-6-scaled.png",
  "5-6-scaled.png",
  "6-6-scaled.png",
  "7-6-scaled.png",
  "8-5-scaled.png",
  "9-5-scaled.png",
  "10-6-scaled.png",
  "11-5-scaled.png",
  "12-8-scaled.png",
  "13-13-scaled.png",
  "14-9-scaled.png",
  "15-3-scaled.png",
  "16-4-scaled.png",
  "17-4-scaled.png",
  "18-3-scaled.png",
  "19-2-scaled.png",
  "20-2-scaled.png",
  "21-3-scaled.png",
  "22-3-scaled.png",
  "23-4-scaled.png",
  "24-3-scaled.png",
] as const;

const INTROS = {
  detect:
    "Detect gives technicians operational visibility — capturing equipment imagery, validating highlighted regions, and accepting or rejecting results before issues become costly downtime.",
  labelTrain:
    "Label & Train closes the learning loop — technicians confirm or correct part labels so verified training data improves the recognition model over time.",
  classify:
    "Classify delivers frontline precision — a technician scans a single part, reviews match confidence, confirms the result, and links the correct PLM record in under thirty seconds.",
} as const;

/** Per-band device-tab tile counts (not shared — each flow has its own set). */
const BAND_CONFIG = [
  {
    flow: "Detect",
    intro: INTROS.detect,
    pages: [
      {
        mobile: 4,
        ipad: 8,
        realwear: 10,
        mobileOffset: 0,
        ipadOffset: 0,
        realwearOffset: 0,
      },
    ],
  },
  {
    flow: "Label & Train",
    intro: INTROS.labelTrain,
    pages: [
      {
        mobile: 2,
        ipad: 4,
        realwear: 4,
        mobileOffset: 0,
        ipadOffset: 0,
        realwearOffset: 0,
      },
    ],
  },
  {
    flow: "Classify",
    intro: INTROS.classify,
    pages: [
      {
        mobile: 6,
        ipad: 10,
        realwear: 10,
        mobileOffset: 0,
        ipadOffset: 0,
        realwearOffset: 0,
      },
    ],
  },
] as const;

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

type SanityImage = {
  _type: "image";
  asset: { _type: "reference"; _ref: string };
};

type PopupPage = {
  _key: string;
  _type: "viewMorePopupPage";
  popupKicker: string;
  popupTitle: string;
  popupBody: ReturnType<typeof pt>;
  popupTabs: {
    _key: string;
    _type: "deviceTab";
    label: string;
    items: {
      _key: string;
      _type: "galleryItem";
      image: SanityImage;
    }[];
  }[];
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

function sliceWp(
  files: readonly string[],
  offset: number,
  count: number,
): string[] {
  if (count <= 0) return [];
  return files.slice(offset, offset + count);
}

function localPaths(
  bandSlug: string,
  pageIndex: number,
  device: "mobile" | "ipad" | "realwear",
  count: number,
): string[] {
  const dir = join(LOCAL_ROOT, bandSlug, `page-${pageIndex + 1}`, device);
  const out: string[] = [];
  for (let i = 1; i <= count; i++) {
    const padded = String(i).padStart(2, "0");
    const png = join(dir, `${padded}.png`);
    const jpg = join(dir, `${padded}.jpg`);
    if (existsSync(png)) out.push(png);
    else if (existsSync(jpg)) out.push(jpg);
    else return [];
  }
  return out;
}

async function download(url: string, dest: string, tries = 3) {
  if (existsSync(dest)) return;
  mkdirSync(join(dest, ".."), { recursive: true });
  let lastErr: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`fetch ${url} → ${res.status}`);
      await pipeline(res.body!, createWriteStream(dest));
      return;
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    }
  }
  throw lastErr;
}

async function uploadImage(path: string): Promise<SanityImage> {
  const asset = await client.assets.upload("image", createReadStream(path), {
    filename: path.split(/[/\\]/).pop(),
  });
  return {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
  };
}

async function resolveFiles(
  bandSlug: string,
  pageIndex: number,
  device: "mobile" | "ipad" | "realwear",
  wpFiles: readonly string[],
  offset: number,
  count: number,
): Promise<string[]> {
  const local = localPaths(bandSlug, pageIndex, device, count);
  if (local.length === count) return local;

  const names = sliceWp(wpFiles, offset, count);
  const cacheDir = join(
    WP_CACHE,
    bandSlug,
    `page-${pageIndex + 1}`,
    device,
  );
  const paths: string[] = [];
  for (const file of names) {
    const url = `${WP}/${file}`;
    const dest = join(cacheDir, file);
    if (!DRY && !APPEARANCE_ONLY) {
      await download(url, dest);
      paths.push(dest);
    } else {
      paths.push(dest);
    }
  }
  return paths;
}

async function buildPage(
  bandSlug: string,
  pageIndex: number,
  flow: string,
  intro: string,
  spec: (typeof BAND_CONFIG)[number]["pages"][number],
): Promise<PopupPage> {
  const tabSpecs = [
    {
      label: "Mobile View",
      device: "mobile" as const,
      wp: WP_MOBILE,
      count: spec.mobile,
      offset: spec.mobileOffset,
    },
    {
      label: "Ipad View",
      device: "ipad" as const,
      wp: WP_IPAD,
      count: spec.ipad,
      offset: spec.ipadOffset,
    },
    {
      label: "Realwear",
      device: "realwear" as const,
      wp: WP_REALWEAR,
      count: spec.realwear,
      offset: spec.realwearOffset,
    },
  ];

  const popupTabs: PopupPage["popupTabs"] = [];

  for (const tab of tabSpecs) {
    if (tab.count <= 0) continue;
    const paths = await resolveFiles(
      bandSlug,
      pageIndex,
      tab.device,
      tab.wp,
      tab.offset,
      tab.count,
    );
    const items: PopupPage["popupTabs"][number]["items"] = [];
    for (const filePath of paths) {
      if (DRY || APPEARANCE_ONLY) {
        items.push({
          _key: key(),
          _type: "galleryItem",
          image: {
            _type: "image",
            asset: { _type: "reference", _ref: "dry-run" },
          },
        });
        continue;
      }
      if (!existsSync(filePath)) {
        throw new Error(`Missing ${filePath} — export Figma plates or check WP cache`);
      }
      const image = await uploadImage(filePath);
      items.push({ _key: key(), _type: "galleryItem", image });
    }
    popupTabs.push({
      _key: key(),
      _type: "deviceTab",
      label: tab.label,
      items,
    });
  }

  return {
    _key: key(),
    _type: "viewMorePopupPage",
    popupKicker: KICKER,
    popupTitle: flow,
    popupBody: pt(intro),
    popupTabs,
  };
}

function bandSlug(flow: string) {
  return flow
    .toLowerCase()
    .replace(/\s*&\s*/g, "-")
    .replace(/\s+/g, "-");
}

function popupAppearanceFields() {
  return {
    backgroundColor: sanityColor(POPUP_BG),
    textColor: sanityColor("#000000"),
    contentAlignment: "left" as const,
    tileBackgroundColor: sanityColor(POPUP_TILE),
    contentGap: 43,
    contentGapInner: 87,
  };
}

function crossFunctionalIndices(sections: { _type: string; layoutVariant?: string }[]) {
  return sections
    .map((s, i) => ({ s, i }))
    .filter(
      ({ s }) =>
        s._type === "motionShowcase" && s.layoutVariant === "crossFunctional",
    )
    .map(({ i }) => i);
}

async function main() {
  if (APPEARANCE_ONLY) {
    console.log(`${SLUG} — KPE View More popup appearance only`);
    for (const id of DOC_IDS) {
      const doc = await client.fetch<{ sections: { _type: string; layoutVariant?: string }[] }>(
        `*[_id == $id][0]{ sections[]{ _type, layoutVariant } }`,
        { id },
      );
      if (!doc?.sections?.length) {
        console.log(`skip ${id}`);
        continue;
      }
      const indices = crossFunctionalIndices(doc.sections);
      let patch: Record<string, unknown> = {};
      for (const idx of indices) {
        patch = {
          ...patch,
          [`sections[${idx}].popupAppearance`]: popupAppearanceFields(),
        };
      }
      if (DRY) {
        console.log(`(dry) ${id}: ${indices.length} band(s)`);
        continue;
      }
      await client.patch(id).set(patch).commit();
      console.log(`✓ ${id}: popup appearance on ${indices.length} band(s)`);
    }
    return;
  }

  console.log(`${SLUG} — KPE View More (Detect / Label & Train / Classify)`);
  BAND_CONFIG.forEach((b, i) => {
    const p = b.pages.map((pg) => `M${pg.mobile}/I${pg.ipad}/R${pg.realwear}`).join(" + ");
    console.log(`  band ${i + 1}. ${b.flow} — ${b.pages.length} page(s): ${p}`);
  });

  const allBandPages: PopupPage[][] = [];
  for (const band of BAND_CONFIG) {
    const slug = bandSlug(band.flow);
    const pages: PopupPage[] = [];
    for (let pi = 0; pi < band.pages.length; pi++) {
      pages.push(await buildPage(slug, pi, band.flow, band.intro, band.pages[pi]!));
    }
    allBandPages.push(pages);
  }

  if (DRY) {
    console.log("(dry run — nothing written)");
    return;
  }

  for (const id of DOC_IDS) {
    const doc = await client.fetch<{ sections: { _type: string; layoutVariant?: string }[] }>(
      `*[_id == $id][0]{ sections[]{ _type, layoutVariant } }`,
      { id },
    );
    if (!doc?.sections?.length) {
      console.log(`skip ${id}`);
      continue;
    }
    const indices = crossFunctionalIndices(doc.sections);
    if (indices.length < BAND_CONFIG.length) {
      throw new Error(
        `${id}: need ${BAND_CONFIG.length} crossFunctional sections, found ${indices.length}`,
      );
    }

    let patch: Record<string, unknown> = {};
    BAND_CONFIG.forEach((_, bi) => {
      const idx = indices[bi]!;
      patch = {
        ...patch,
        [`sections[${idx}].viewMoreLabel`]: "View More",
        [`sections[${idx}].viewMorePopups`]: allBandPages[bi],
        [`sections[${idx}].popupItemsBeforeViewMore`]: 6,
        [`sections[${idx}].popupLoadMoreLabel`]: "Load More",
        [`sections[${idx}].popupLoadLessLabel`]: "Show Less",
        [`sections[${idx}].popupAppearance`]: popupAppearanceFields(),
      };
    });

    await client.patch(id).set(patch).commit();
    console.log(`✓ ${id}: View More popups patched (${BAND_CONFIG.length} bands)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
