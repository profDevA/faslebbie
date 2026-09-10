/**
 * Design Assist AI — Intervention Carousel + Grid (Figma 3719:64984 / 3719:65044).
 *
 * Replaces legacy showcaseGallery "Design Interventions" (16 WP tiles) with:
 *   1. interventionCarousel — 5 Layers poster carousel
 *   2. interventionGrid — 16 on-page intervention cards (6 visible, Load More)
 *
 * PNG:
 *   public/work/design-assist-ai/intervention-carousel/01–06-*.png (Figma 3719:67246–67358)
 *   public/work/design-assist-ai/intervention-grid/01–16-*.png (Figma 3719:70040–72436)
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-design-assist-intervention-sections.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-design-assist-intervention-sections.ts --with-user-token
 *   npx sanity exec scripts/patch-design-assist-intervention-sections.ts --with-user-token -- --carousel-only
 *   npx sanity exec scripts/patch-design-assist-intervention-sections.ts --with-user-token -- --grid-only
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const APPEARANCE_ONLY = process.argv.includes("--appearance-only");
const CAROUSEL_ONLY = process.argv.includes("--carousel-only");
const GRID_ONLY = process.argv.includes("--grid-only");
const SLUG = "design-assist-ai";
const PUB_ID = "cs-design-assist-ai";

const CAROUSEL_DIR = join(process.cwd(), "public/work/design-assist-ai/intervention-carousel");
const GRID_DIR = join(process.cwd(), "public/work/design-assist-ai/intervention-grid");
const CAROUSEL_BG = "#e9eef7";
const GRID_BG = "#d5cfdd";

const RESEARCH_TITLES = new Set(["Research Artifacts", "Toolkit, Methods & Frameworks"]);
const LEGACY_DI_TITLE = "Design Interventions";

/** Live WP Design Interventions intro — fasandsabrina.com/case-studies/design-assist-ai/ */
const GRID_INTRO =
  "Design Assist began as a Figma plugin acting as a real-time bridge between Blueprint and the designer's active file. It intervenes in three ways: contextual guidance, automated production, and system enforcement. We didn't just build a chatbot. We built infrastructure. We created a Design Data Schema mapping 6,000+ component patterns to a standardized taxonomy and collaborated with engineering to build the RAG Knowledge Pipeline, ensuring AI could securely \"read\" Figma tables and Product Catalog context.";

/** Figma 3719:64984 poster carousel — six layer slides @67246–67358. */
const CAROUSEL_INTRO =
  "Design Assist applies a five-layer framework for designing with AI—input, processing, output, feedback, and control—so generative suggestions stay grounded in Blueprint standards, live engineering data, and human oversight.";

const CAROUSEL_SLIDES = [
  {
    file: "01-five-layers-overview.png",
    title: "The 5 Layers of Designing for AI",
    body: CAROUSEL_INTRO,
    figma: "3719:67246",
  },
  {
    file: "02-layer-input.png",
    title: "Layer 1: Input",
    body: "An AI is only as good as its data diet. We structured Blueprint (6,000+ patterns), the Product Catalog, and governance docs into a rigid Design Data Schema for the RAG pipeline.",
    figma: "3719:67292",
  },
  {
    file: "03-layer-processing.png",
    title: "Layer 2: Processing",
    body: "Raw data becomes design intent through few-shot intent mapping and contextual RAG that reads the active Figma selection and DesignKit brief—not just the chat prompt.",
    figma: "3719:67318",
  },
  {
    file: "04-layer-output.png",
    title: "Layer 3: Output",
    body: "Expression is indigenous to Figma—pixels, not paragraphs. Three modes: reactive assistant, proactive co-pilot, and generative partner via Magic Iteration.",
    figma: "3719:67334",
  },
  {
    file: "05-layer-feedback.png",
    title: "Layer 4: Feedback",
    body: "Low-friction learning loops capture implicit signals (Auto-adjust accepts, detach events) and explicit correction (thumbs up/down on Magic Iteration variations).",
    figma: "3719:67344",
  },
  {
    file: "06-layer-control.png",
    title: "Layer 5: Control",
    body: "Strict guardrails ensure designers retain final agency—confidence thresholds withhold low-confidence suggestions, and no pixel changes happen without explicit confirmation.",
    figma: "3719:67358",
  },
] as const;

/** Figma 3719:67419 expanded grid — 16 cards @70040–72436. */
const GRID_CARDS = [
  { file: "01-design-assist-toolbar.png", caption: "Design Assist Toolbar", figma: "3719:70040" },
  { file: "02-auto-adjust-blueprint.png", caption: "Auto-adjust for Blueprint", figma: "3719:70079" },
  { file: "03-documentation-in-context.png", caption: "Documentation in Context", figma: "3719:70136" },
  { file: "04-quick-starter-jtbds.png", caption: "Quick Starter JTBDs", figma: "3719:70159" },
  { file: "05-pattern-understanding.png", caption: "Pattern Understanding", figma: "3719:70421" },
  { file: "06-templates-in-figma.png", caption: "Templates in Figma", figma: "3719:70542" },
  { file: "07-busy-work-co-pilot.png", caption: "Busy-work Co-pilot", figma: "3719:71221" },
  { file: "08-canvas-selection-options.png", caption: "Canvas Selection Options", figma: "3719:71267" },
  { file: "09-generated-content-layers.png", caption: "Generated Content Layers", figma: "3719:71299" },
  { file: "10-project-context.png", caption: "Project Context", figma: "3719:71337" },
  { file: "11-magic-iteration.png", caption: "Magic Iteration", figma: "3719:71522" },
  { file: "12-design-assist-2.png", caption: "Design Assist 2.0", figma: "3719:71830" },
  { file: "13-design-assist-orb.png", caption: "Design Assist Orb", figma: "3719:71876" },
  { file: "14-design-assist-today.png", caption: "Design Assist Today", figma: "3719:71932" },
  { file: "15-design-assist-plugin.png", caption: "Design Assist", figma: "3719:71983" },
  { file: "16-design-assist-overview.png", caption: "Design Assist Overview", figma: "3719:72436" },
] as const;

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

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

function bandAppearance(bg: string) {
  return {
    _type: "appearance" as const,
    backgroundColor: sanityColor(bg),
    textColor: sanityColor("#000000"),
    maxWidth: "wide" as const,
  };
}

const carouselAppearance = bandAppearance(CAROUSEL_BG);
const gridAppearance = bandAppearance(GRID_BG);

async function uploadImage(absPath: string) {
  const asset = await client.assets.upload("image", createReadStream(absPath), {
    filename: basename(absPath),
    contentType: "image/png",
  });
  console.log(`  ↑ ${basename(absPath)} → ${asset._id}`);
  return { _type: "image" as const, asset: { _type: "reference" as const, _ref: asset._id } };
}

async function buildCarouselSection(existing?: Record<string, unknown>) {
  const prevSlides = (existing?.slides as { _key?: string }[] | undefined) ?? [];
  const slides = [];
  for (let i = 0; i < CAROUSEL_SLIDES.length; i++) {
    const spec = CAROUSEL_SLIDES[i];
    const abs = join(CAROUSEL_DIR, spec.file);
    if (!existsSync(abs)) throw new Error(`Missing PNG: ${abs}`);
    const image = DRY
      ? { _type: "image", asset: { _type: "reference", _ref: "dry-run" } }
      : await uploadImage(abs);
    slides.push({
      _type: "interventionSlide",
      _key: prevSlides[i]?._key ?? key(),
      title: spec.title,
      body: pt(spec.body),
      image,
      order: i + 1,
    });
    console.log(`  carousel [${i + 1}] ${spec.title} ← ${spec.file} (${spec.figma})`);
  }
  return {
    ...(existing ?? {}),
    _type: "interventionCarousel",
    _key: (existing?._key as string) ?? key(),
    sectionTitle: LEGACY_DI_TITLE,
    introBody: pt(CAROUSEL_INTRO),
    slides,
    appearance: carouselAppearance,
  };
}

async function buildGridSection(existing?: Record<string, unknown>) {
  const prevItems = (existing?.items as { _key?: string }[] | undefined) ?? [];
  const items = [];
  for (let i = 0; i < GRID_CARDS.length; i++) {
    const spec = GRID_CARDS[i];
    const abs = join(GRID_DIR, spec.file);
    if (!existsSync(abs)) throw new Error(`Missing PNG: ${abs}`);
    const image = DRY
      ? { _type: "image", asset: { _type: "reference", _ref: "dry-run" } }
      : await uploadImage(abs);
    items.push({
      _type: "showcaseItem",
      _key: prevItems[i]?._key ?? key(),
      caption: spec.caption,
      image,
      order: i + 1,
    });
    console.log(`  grid [${i + 1}] ${spec.caption} ← ${spec.file} (${spec.figma})`);
  }
  return {
    ...(existing ?? {}),
    _type: "interventionGrid",
    _key: (existing?._key as string) ?? key(),
    sectionTitle: LEGACY_DI_TITLE,
    introBody: pt(GRID_INTRO),
    items,
    initialVisibleCount: 6,
    readMoreLabel: "Load More",
    appearance: gridAppearance,
  };
}

type Section = Record<string, unknown> & { _key: string; _type: string; sectionTitle?: string };

async function patchAppearanceOnly(docId: string, sections: Section[]) {
  const carouselIdx = sections.findIndex((s) => s._type === "interventionCarousel");
  const gridIdx = sections.findIndex((s) => s._type === "interventionGrid");
  if (carouselIdx < 0 && gridIdx < 0) {
    console.log(`skip ${docId}: no intervention sections`);
    return;
  }
  const patch: Record<string, unknown> = {};
  if (carouselIdx >= 0) {
    patch[`sections[${carouselIdx}].appearance`] = carouselAppearance;
    console.log(`  carousel[${carouselIdx}] → ${CAROUSEL_BG}`);
  }
  if (gridIdx >= 0) {
    patch[`sections[${gridIdx}].appearance`] = gridAppearance;
    console.log(`  grid[${gridIdx}] → ${GRID_BG}`);
  }
  if (DRY) {
    console.log("(dry run — appearance only)");
    return;
  }
  await client.patch(docId).set(patch).commit();
  console.log(`✓ ${docId}: intervention band colors updated`);
}

function researchIdx(sections: Section[]) {
  return sections.findIndex(
    (s) => s._type === "showcaseGallery" && RESEARCH_TITLES.has(s.sectionTitle ?? ""),
  );
}

async function patchDoc(docId: string) {
  const doc = await client.fetch<{ sections: Section[] }>(
    `*[_id == $id][0]{ sections }`,
    { id: docId },
  );
  if (!doc?.sections?.length) throw new Error(`${docId}: no sections`);

  const hero = doc.sections.find((s) => s._type === "heroSection") as
    | (Section & { image?: unknown; imageMobile?: unknown })
    | undefined;
  if (!hero?.image && !hero?.imageMobile) {
    throw new Error(`${docId}: hero has no images — aborting`);
  }

  if (APPEARANCE_ONLY) {
    await patchAppearanceOnly(docId, doc.sections);
    return;
  }

  const carouselIdx = doc.sections.findIndex((s) => s._type === "interventionCarousel");
  const gridIdx = doc.sections.findIndex((s) => s._type === "interventionGrid");

  if (CAROUSEL_ONLY) {
    if (carouselIdx < 0) throw new Error(`${docId}: no interventionCarousel section`);
    console.log(`${docId} — carousel only (${CAROUSEL_SLIDES.length} slides)`);
    const carousel = await buildCarouselSection(doc.sections[carouselIdx]);
    if (DRY) {
      console.log(`(dry run) → patch sections[${carouselIdx}] interventionCarousel`);
      return;
    }
    await client.patch(docId).set({ [`sections[${carouselIdx}]`]: carousel }).commit();
    console.log(`✓ ${docId}: interventionCarousel (${CAROUSEL_SLIDES.length} slides)`);
    return;
  }

  if (GRID_ONLY) {
    if (gridIdx < 0) throw new Error(`${docId}: no interventionGrid section`);
    console.log(`${docId} — grid only (${GRID_CARDS.length} cards)`);
    const grid = await buildGridSection(doc.sections[gridIdx]);
    if (DRY) {
      console.log(`(dry run) → patch sections[${gridIdx}] interventionGrid`);
      return;
    }
    await client.patch(docId).set({ [`sections[${gridIdx}]`]: grid }).commit();
    console.log(`✓ ${docId}: interventionGrid (${GRID_CARDS.length} cards, 6 initial)`);
    return;
  }
  const legacyDiIdx = doc.sections.findIndex(
    (s) => s._type === "showcaseGallery" && s.sectionTitle === LEGACY_DI_TITLE,
  );

  console.log(`${docId} — intervention sections`);
  if (legacyDiIdx >= 0) {
    console.log(`  remove showcaseGallery[${legacyDiIdx}] "${LEGACY_DI_TITLE}"`);
  }

  const carousel = await buildCarouselSection(
    carouselIdx >= 0 ? doc.sections[carouselIdx] : undefined,
  );
  const grid = await buildGridSection(gridIdx >= 0 ? doc.sections[gridIdx] : undefined);

  let sections = doc.sections.filter(
    (s, i) =>
      i !== legacyDiIdx &&
      s._type !== "interventionCarousel" &&
      s._type !== "interventionGrid" &&
      s._type !== "coreExperience",
  );

  const artIdx = researchIdx(sections);
  const insertAt = artIdx >= 0 ? artIdx + 1 : sections.length;
  sections = [
    ...sections.slice(0, insertAt),
    carousel,
    grid,
    ...sections.slice(insertAt),
  ];

  if (DRY) {
    console.log(
      `(dry run) → ${sections.length} section(s): … → interventionCarousel → interventionGrid → …`,
    );
    return;
  }

  await client.patch(docId).set({ sections }).commit();
  console.log(`✓ ${docId}: interventionCarousel + interventionGrid (${sections.length} sections)`);
}

async function main() {
  console.log(
    `patch-design-assist-intervention-sections (${DRY ? "dry" : "live"}${APPEARANCE_ONLY ? ", appearance-only" : ""}${CAROUSEL_ONLY ? ", carousel-only" : ""}${GRID_ONLY ? ", grid-only" : ""})`,
  );
  await patchDoc(PUB_ID);
  const draftId = `drafts.${PUB_ID}`;
  if (await client.getDocument(draftId)) await patchDoc(draftId);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
