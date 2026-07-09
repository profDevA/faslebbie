/**
 * One-off migration: seed Sanity `production` from the in-code data model
 * (src/lib/content.ts → workProjects) and upload every referenced local asset
 * from /public. Idempotent: uses deterministic _ids + createOrReplace, and
 * caches asset uploads by path.
 *
 * Run from frontend/:
 *   sanity exec scripts/migrate-to-sanity.ts --with-user-token
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import {
  workProjects,
  workCategories,
  WORK_CREDIT,
  type CaseStudy,
  type CaseStudyAccordionItem,
  type WorkCategory,
} from "../src/lib/content";

const client = getCliClient({ apiVersion: "2025-01-01" });
const PUBLIC = join(process.cwd(), "public");

// ── helpers ────────────────────────────────────────────────────────────────
const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

function hexColor(hex: string, alpha = 1) {
  return { _type: "color", hex, alpha };
}

// Signature band palette, lifted from components/CaseStudy.tsx so the migrated
// look matches the current hard-coded template. Authors can override per band.
const C = {
  sage: hexColor("#99B29D", 0.4),
  orange: hexColor("#FF5005", 0.5),
  teal: hexColor("#52747E", 1),
  tan: hexColor("#A4856E", 1),
  peach: hexColor("#FE9D68", 1),
  maroon: hexColor("#50242D", 1),
  periwinkle: hexColor("#B7C6E5", 1),
  forest: hexColor("#003545", 1),
  black: hexColor("#000000", 1),
  white: hexColor("#FFFFFF", 1),
};

function appearance(bg?: ReturnType<typeof hexColor>, textLight = false) {
  if (!bg) return undefined;
  return {
    _type: "appearance",
    backgroundColor: bg,
    ...(textLight ? { textColor: C.white } : {}),
  };
}

function span(text: string) {
  return { _type: "span", _key: key(), text, marks: [] as string[] };
}

function block(text: string, listItem?: "bullet" | "number") {
  const b: Record<string, unknown> = {
    _type: "block",
    _key: key(),
    style: "normal",
    markDefs: [],
    children: [span(text)],
  };
  if (listItem) {
    b.listItem = listItem;
    b.level = 1;
  }
  return b;
}

/** Split a prose string (blank-line separated) into Portable Text blocks. */
function pt(text?: string) {
  if (!text) return undefined;
  const paras = text
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  const blocks = paras.map((p) => block(p.replace(/\n/g, " ")));
  return blocks.length ? blocks : undefined;
}

function ptAccordion(item: CaseStudyAccordionItem) {
  const blocks: ReturnType<typeof block>[] = [];
  for (const p of item.paras ?? []) blocks.push(block(p.replace(/\n/g, " ")));
  for (const b of item.bullets ?? []) blocks.push(block(b.replace(/\n/g, " "), "bullet"));
  return blocks.length ? blocks : undefined;
}

const isEmbed = (src: string) => /youtu|vimeo|player\.|\/embed\//i.test(src);
const isVideoFile = (src: string) => /\.(mp4|webm|mov|m4v)$/i.test(src);

// ── asset uploads (cached by public path) ───────────────────────────────────
const assetCache = new Map<string, string | null>();

async function uploadAsset(kind: "image" | "file", p: string): Promise<string | null> {
  if (assetCache.has(p)) return assetCache.get(p)!;
  const abs = join(PUBLIC, p.replace(/^\//, ""));
  if (!existsSync(abs)) {
    console.warn(`  ! missing asset: ${p}`);
    assetCache.set(p, null);
    return null;
  }
  const asset = await client.assets.upload(kind, createReadStream(abs), {
    filename: basename(abs),
  });
  assetCache.set(p, asset._id);
  return asset._id;
}

async function imageValue(p?: string) {
  if (!p) return undefined;
  const id = await uploadAsset("image", p);
  if (!id) return undefined;
  return { _type: "image", asset: { _type: "reference", _ref: id } };
}

async function galleryItems(paths: string[]) {
  const items = [];
  for (const p of paths) {
    const img = await imageValue(p);
    if (img) items.push({ _type: "galleryItem", _key: key(), image: img });
  }
  return items;
}

async function showcaseItems(paths: string[]) {
  const items = [];
  for (const p of paths) {
    const img = await imageValue(p);
    if (img) items.push({ _type: "showcaseItem", _key: key(), image: img });
  }
  return items;
}

async function mediaItemFrom(src: string, caption?: string) {
  const base = { _type: "mediaItem", _key: key(), ...(caption ? { caption } : {}) };
  if (isEmbed(src)) return { ...base, mediaType: "video", videoUrl: src };
  if (isVideoFile(src)) {
    const id = await uploadAsset("file", src);
    if (!id) return null;
    return {
      ...base,
      mediaType: "video",
      videoFile: { _type: "file", asset: { _type: "reference", _ref: id } },
    };
  }
  const img = await imageValue(src);
  if (!img) return null;
  return { ...base, mediaType: "image", image: img };
}

async function mediaItemsFrom(sources: string[]) {
  const items = [];
  for (const s of sources) {
    const m = await mediaItemFrom(s);
    if (m) items.push(m);
  }
  return items;
}

// ── section builder ──────────────────────────────────────────────────────────
async function buildSections(cs: CaseStudy) {
  const sections: Record<string, unknown>[] = [];
  const push = (s: Record<string, unknown> | null | undefined) => {
    if (s) sections.push({ _key: key(), ...s });
  };

  // 1. hero
  const heroImage = await imageValue(cs.hero.image);
  if (heroImage) {
    push({
      _type: "heroSection",
      image: heroImage,
      imageMobile: await imageValue(cs.hero.imageMobile),
      caption: cs.hero.caption,
    });
  }

  // 2. overview
  if (cs.overview) {
    const o = cs.overview;
    push({
      _type: "overviewSection",
      sectionTitle: "Overview",
      body: pt(o.body),
      serviceCategoryLabel: "Research & Design",
      serviceList: o.disciplines,
      duration: o.duration,
      team: o.team,
      confidentialityNote: o.note,
      ...(o.visitSite ? { ctaLabel: "Visit Site", ctaUrl: o.visitSite } : {}),
      sideImage: await imageValue(o.image),
    });
  }

  // 3. What I Brought (centered accordion, sage)
  if (cs.brought?.length) {
    push({
      _type: "accordionSection",
      variant: "centered",
      sectionTitle: cs.broughtHeading ?? "What I Brought",
      accordionBackgroundColor: C.sage,
      appearance: appearance(C.sage),
      items: cs.brought.map((it, i) => ({
        _type: "accordionItem",
        _key: key(),
        title: it.title,
        body: ptAccordion(it),
        defaultOpen: i === 0,
      })),
    });
  }

  // 4. Problem Context (black)
  if (cs.problem) {
    push({
      _type: "proseSection",
      sectionTitle: cs.problemHeading ?? "Problem Context",
      body: pt(cs.problem),
      appearance: appearance(C.black, true),
    });
  }

  // 5. My Approach + Design Process (split accordion)
  if (cs.approach) {
    push({
      _type: "accordionSection",
      variant: "split",
      sideTitle: "My Approach",
      sideBody: pt(cs.approach.blurb),
      sectionTitle: "Design Process",
      accordionBackgroundColor: C.orange,
      items: cs.approach.process.map((it, i) => ({
        _type: "accordionItem",
        _key: key(),
        title: it.title,
        body: ptAccordion(it),
        defaultOpen: i === 0,
      })),
    });
  }

  // 6. Design Interventions (slider → showcase; else teal video/prose)
  if (cs.designInterventions) {
    const di = cs.designInterventions;
    if (di.slider?.length) {
      push({
        _type: "showcaseGallery",
        sectionTitle: di.heading ?? "Design Interventions",
        introBody: pt(di.body),
        items: await showcaseItems(di.slider),
      });
    } else if (di.video) {
      const item = await mediaItemFrom(di.video);
      push({
        _type: "mediaSection",
        sectionTitle: di.heading ?? "Design Interventions",
        body: pt(di.body),
        items: item ? [item] : [],
        appearance: appearance(C.teal, true),
      });
    } else {
      push({
        _type: "proseSection",
        sectionTitle: di.heading ?? "Design Interventions",
        body: pt(di.body),
        appearance: appearance(C.teal, true),
      });
    }
  }

  // 7. Core Experience Flows (tan device tabs)
  if (cs.coreFlows) {
    const tabs = [];
    for (const v of cs.coreFlows.views) {
      tabs.push({
        _type: "deviceTab",
        _key: key(),
        label: v.label,
        items: await galleryItems(v.images),
      });
    }
    push({
      _type: "gallerySection",
      sectionTitle: cs.coreFlows.heading,
      body: pt(cs.coreFlows.body),
      useDeviceTabs: true,
      tabs,
      appearance: appearance(C.tan, true),
    });
  }

  // 8. Product Demo (peach media)
  if (cs.productDemo) {
    const pd = cs.productDemo;
    const sources = pd.embeds?.length
      ? pd.embeds
      : [pd.video, pd.image].filter(Boolean) as string[];
    const items = await mediaItemsFrom(sources);
    if (items.length) {
      push({
        _type: "mediaSection",
        sectionTitle: pd.heading,
        body: pt(pd.body),
        items,
        appearance: appearance(C.peach),
      });
    } else if (pd.body) {
      push({
        _type: "proseSection",
        sectionTitle: pd.heading,
        body: pt(pd.body),
        appearance: appearance(C.peach),
      });
    }
  }

  // 9. Extra galleries (Supporting Designs, etc.)
  for (const g of cs.extraGalleries ?? []) {
    const mockups = g.variant === "mockups";
    push({
      _type: "gallerySection",
      sectionTitle: g.heading,
      body: pt(g.body),
      items: await galleryItems(g.images),
      showCaptions: false,
      ...(mockups ? { appearance: appearance(C.forest, true) } : {}),
    });
  }

  // 10. Advocate / Empowering (maroon media)
  if (cs.advocate) {
    const a = cs.advocate;
    const sources = a.embeds?.length
      ? a.embeds
      : [a.video, a.image].filter(Boolean) as string[];
    const items = await mediaItemsFrom(sources);
    if (items.length) {
      push({
        _type: "mediaSection",
        sectionTitle: a.heading,
        body: pt(a.body),
        items,
        appearance: appearance(C.maroon, true),
      });
    } else if (a.heading || a.body) {
      push({
        _type: "proseSection",
        sectionTitle: a.heading,
        body: pt(a.body),
        appearance: appearance(C.maroon, true),
      });
    }
  }

  // 11. Research Outputs (periwinkle grid)
  if (cs.researchOutputs?.images?.length) {
    push({
      _type: "gallerySection",
      sectionTitle: cs.researchOutputs.heading,
      body: pt(cs.researchOutputs.body),
      items: await galleryItems(cs.researchOutputs.images),
      appearance: appearance(C.periwinkle),
    });
  }

  // 12. Impact stats (white count-up)
  if (cs.stats?.length) {
    push({
      _type: "statsSection",
      sectionTitle: "Impact",
      items: cs.stats.map((s) => ({
        _type: "statItem",
        _key: key(),
        value: s.value,
        suffix: s.suffix,
        label: s.label,
        note: s.note,
      })),
    });
  }

  // 13. Reflections & Impact (black)
  if (cs.reflections) {
    push({
      _type: "proseSection",
      sectionTitle: cs.reflectionsHeading ?? "Reflections & Impact",
      body: pt(cs.reflections),
      appearance: appearance(C.black, true),
    });
  }

  // 14. Next Steps (bullets)
  if (cs.nextSteps?.length) {
    push({
      _type: "bulletSection",
      sectionTitle: "Next Steps",
      items: cs.nextSteps,
    });
  }

  return sections;
}

// ── categories ───────────────────────────────────────────────────────────────
const catSlug = (c: WorkCategory) => c.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const catId = (c: WorkCategory) => `category-${catSlug(c)}`;

async function migrate() {
  console.log("→ categories");
  for (let i = 0; i < workCategories.length; i++) {
    const c = workCategories[i];
    await client.createOrReplace({
      _id: catId(c),
      _type: "category",
      title: c,
      slug: { _type: "slug", current: catSlug(c) },
      orderRank: String(i + 1).padStart(5, "0"),
    });
  }

  console.log("→ work page singleton");
  await client.createOrReplace({
    _id: "workPage",
    _type: "workPage",
    sectionTitle: "Work",
    enableTextView: true,
    enableImageView: true,
    loadMoreLabel: "Load More",
  });

  console.log(`→ ${workProjects.length} case studies`);
  for (let i = 0; i < workProjects.length; i++) {
    const p = workProjects[i];
    console.log(`  [${i + 1}/${workProjects.length}] ${p.slug}`);
    const sections = p.caseStudy ? await buildSections(p.caseStudy) : [];
    const doc = {
      _id: `cs-${p.slug}`,
      _type: "caseStudy",
      title: p.name,
      slug: { _type: "slug", current: p.slug },
      tagline: p.tagline,
      categories: p.categories.map((c) => ({
        _type: "reference",
        _key: key(),
        _ref: catId(c),
      })),
      cardThumbnail: await imageValue(p.image),
      cardCredits: WORK_CREDIT,
      cardTags: p.categories,
      accent: hexColor(normalizeHex(p.accent)),
      span: p.span,
      orderRank: String(i + 1).padStart(5, "0"),
      sections,
    };
    await client.createOrReplace(doc);
  }

  console.log("✓ migration complete");
}

/** color-input wants a 6-digit hex; accent values are already #rrggbb. */
function normalizeHex(hex: string) {
  const m = hex.trim().match(/^#?([0-9a-f]{6})$/i);
  return m ? `#${m[1].toLowerCase()}` : "#000000";
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
