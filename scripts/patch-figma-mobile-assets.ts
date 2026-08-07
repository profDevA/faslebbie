/**
 * Upload Figma mobile case-study stills (overview + optional gallery) into
 * Sanity and patch each overviewSection to prefer the new sideImage.
 *
 * Figma prose for non-Coral frames is mostly Lorem / Coral leftovers — this
 * script does NOT overwrite Duration/Team/services/body from Figma except
 * Coral Health overview body (real mobile copy). Other copy stays as-is.
 *
 * Run from frontend/:
 *   sanity exec scripts/patch-figma-mobile-assets.ts --with-user-token
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const PUBLIC = join(process.cwd(), "public");
const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

const hexColor = (hex: string, alpha = 1) => ({
  _type: "color" as const,
  hex,
  alpha,
});

const span = (text: string) => ({
  _type: "span" as const,
  _key: key(),
  text,
  marks: [] as string[],
});
const block = (text: string) => ({
  _type: "block" as const,
  _key: key(),
  style: "normal" as const,
  markDefs: [] as unknown[],
  children: [span(text)],
});
function pt(text?: string) {
  if (!text) return undefined;
  const blocks = text
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((p) => block(p.replace(/\n/g, " ")));
  return blocks.length ? blocks : undefined;
}

const cache = new Map<string, string | null>();
async function uploadImage(p: string): Promise<string | null> {
  if (cache.has(p)) return cache.get(p)!;
  const abs = join(PUBLIC, p.replace(/^\//, ""));
  if (!existsSync(abs)) {
    console.warn(`  ! missing: ${p}`);
    cache.set(p, null);
    return null;
  }
  const asset = await client.assets.upload("image", createReadStream(abs), {
    filename: basename(abs),
  });
  console.log(`  ↑ ${basename(abs)} → ${asset._id}`);
  cache.set(p, asset._id);
  return asset._id;
}
async function imageRef(p: string) {
  const id = await uploadImage(p);
  return id
    ? { _type: "image" as const, asset: { _type: "reference" as const, _ref: id } }
    : undefined;
}

type StudyPatch = {
  sanityId: string;
  slug: string;
  overviewPhone: string;
  overviewBg: string;
  /** When set, replace overview body (Coral mobile only — real Figma copy). */
  overviewBody?: string;
  /** Extra showcase images appended if a Research Artifacts gallery exists. */
  galleryExtras?: string[];
  /** Clear sideVideo so the still always wins (Coral keeps video for desktop via code). */
  clearSideVideo?: boolean;
};

// Coral mobile overview body from Figma 344:19467 (real, not leftover).
const CORAL_OVERVIEW_BODY =
  "Coral Health transforms healthcare access for underserved populations by providing an integrated platform that connects employees to culturally-competent care providers. Through employer partnerships, we've developed an innovative solution that combines smart provider matching, personalized health navigation, and cultural competency training to address critical gaps in healthcare delivery. Our platform has achieved a 77% adoption rate among target users while maintaining a 4.2/5 provider satisfaction score. This initiative significantly improves healthcare accessibility and utilization among historically underserved groups, demonstrating measurable progress in reducing health disparities.";

const STUDIES: StudyPatch[] = [
  {
    sanityId: "cs-coral-health",
    slug: "coral-health",
    overviewPhone: "/work/coral-health/figma-mobile/overview-phone.png",
    overviewBg: "#52747e",
    overviewBody: CORAL_OVERVIEW_BODY,
    // Keep sideVideo for desktop; frontend prefers sideImage on mobile.
  },
  {
    sanityId: "cs-memory-tubes",
    slug: "memory-tubes",
    overviewPhone: "/work/memory-tubes/figma-mobile/overview-phone.png",
    overviewBg: "#E8E8E3",
    clearSideVideo: true,
  },
  {
    sanityId: "cs-2020-us-census-benefit-calculator",
    slug: "2020-us-census-benefit-calculator",
    overviewPhone:
      "/work/2020-us-census-benefit-calculator/figma-mobile/overview-phone.png",
    overviewBg: "#F5F0E6",
    clearSideVideo: true,
  },
  {
    sanityId: "cs-diamond-valuation-ai",
    slug: "diamond-valuation-ai",
    overviewPhone: "/work/diamond-valuation-ai/figma-mobile/overview-phone.png",
    overviewBg: "#1A1A1A",
    clearSideVideo: true,
  },
  {
    sanityId: "cs-oc-links",
    slug: "oc-links",
    overviewPhone: "/work/oc-links/figma-mobile/overview-phone.png",
    overviewBg: "#E8E4DC",
    clearSideVideo: true,
    galleryExtras: [
      "/work/oc-links/figma-mobile/gallery-2268-55383.png",
      "/work/oc-links/figma-mobile/gallery-2268-55386.png",
      "/work/oc-links/figma-mobile/gallery-2268-55389.png",
      "/work/oc-links/figma-mobile/gallery-2268-55392.png",
      "/work/oc-links/figma-mobile/gallery-2268-55396.png",
      "/work/oc-links/figma-mobile/gallery-2268-55253.png",
      "/work/oc-links/figma-mobile/gallery-2268-55115.png",
      "/work/oc-links/figma-mobile/gallery-2268-54941.png",
      "/work/oc-links/figma-mobile/gallery-2268-55401.png",
      "/work/oc-links/figma-mobile/gallery-2268-55520.png",
      "/work/oc-links/figma-mobile/process-1788-18394.png",
    ],
  },
  {
    sanityId: "cs-forever-a-surfer",
    slug: "forever-a-surfer",
    overviewPhone: "/work/forever-a-surfer/figma-mobile/overview-phone.png",
    overviewBg: "#EDE8E0",
    clearSideVideo: true,
    galleryExtras: [
      "/work/forever-a-surfer/figma-mobile/gallery-1902-31593.png",
      "/work/forever-a-surfer/figma-mobile/gallery-349-29758.png",
    ],
  },
  {
    sanityId: "cs-snapback-lifestyle",
    slug: "snapback-lifestyle",
    overviewPhone: "/work/snapback-lifestyle/figma-mobile/overview-phone.png",
    overviewBg: "#E8E4DC",
    clearSideVideo: true,
  },
];

type Section = Record<string, unknown> & {
  _key: string;
  _type: string;
  sectionTitle?: string;
  items?: Array<Record<string, unknown> & { _key: string; image?: unknown }>;
};

async function patchStudy(study: StudyPatch) {
  console.log(`\n— ${study.slug}`);
  // Patch published + draft (preview often reads drafts.* and can shadow published).
  const docs = await client.fetch<{ _id: string; sections: Section[] }[]>(
    `*[_type == "caseStudy" && (_id == $id || _id == $draftId || slug.current == $slug)]{
      _id, sections
    }`,
    {
      id: study.sanityId,
      draftId: `drafts.${study.sanityId}`,
      slug: study.slug,
    },
  );
  if (!docs.length) {
    console.warn(`  ! no Sanity doc for ${study.slug}`);
    return;
  }
  const doc = docs.find((d) => !d._id.startsWith("drafts.")) ?? docs[0];

  const sideImage = await imageRef(study.overviewPhone);
  if (!sideImage) {
    console.warn(`  ! skip — no overview phone asset`);
    return;
  }

  const sections = structuredClone(doc.sections) as Section[];
  const oi = sections.findIndex((s) => s._type === "overviewSection");
  if (oi < 0) {
    console.warn(`  ! no overviewSection`);
    return;
  }

  const overview = { ...sections[oi] };
  overview.sideImage = sideImage;
  overview.sideImageFit = "contain";
  overview.sideImageBackgroundColor = hexColor(study.overviewBg);
  if (study.overviewBody) {
    overview.body = pt(study.overviewBody);
  }
  if (study.clearSideVideo) {
    delete overview.sideVideo;
  }
  sections[oi] = overview;
  console.log(`  · overview sideImage + bg ${study.overviewBg}`);

  if (study.galleryExtras?.length) {
    const gi = sections.findIndex(
      (s) =>
        s._type === "showcaseGallery" &&
        /research artifacts|artifacts/i.test(String(s.sectionTitle ?? "")),
    );
    if (gi >= 0) {
      const gallery = { ...sections[gi] };
      const items = [...((gallery.items as Section["items"]) ?? [])];
      for (const path of study.galleryExtras) {
        const img = await imageRef(path);
        if (!img) continue;
        items.push({
          _type: "showcaseItem",
          _key: key(),
          image: img,
          caption: basename(path).replace(/\.[^.]+$/, ""),
        });
      }
      gallery.items = items;
      sections[gi] = gallery;
      console.log(`  · appended ${study.galleryExtras.length} gallery stills`);
    } else {
      console.log(`  · no Research Artifacts gallery — extras uploaded only`);
      for (const path of study.galleryExtras) await uploadImage(path);
    }
  }

  for (const target of docs) {
    await client.patch(target._id).set({ sections }).commit();
    console.log(`  ✓ patched ${target._id}`);
  }
}

async function main() {
  for (const study of STUDIES) {
    try {
      await patchStudy(study);
    } catch (err) {
      console.error(`  ✗ ${study.slug}:`, err);
    }
  }
  console.log("\nDone.");
}

main();
