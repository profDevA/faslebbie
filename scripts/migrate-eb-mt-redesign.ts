/**
 * Experian Boost + Memory Tubes case-study REDESIGN (08/03 meeting). Rebuilds
 * both docs' `sections` into the Coral template structure, following the
 * "Faslebbie July Hollistic" Figma file (28fl2XqojJTa3jEblotAaz):
 *
 *   Experian Boost (600:31396) — 9 bands: Hero · Overview · Problem Context +
 *   What I Brought · Design Process · Research Artifacts · Key Product
 *   Experiences · Impact · Project Highlights · Reflection / Next Steps.
 *   (No Marketing Website band, unlike Coral.)
 *
 *   Memory Tubes (1123:1024) — the same minus Key Product Experiences; it has
 *   no product UI, so the overview art is the street photography column.
 *
 * Copy is the real case-study text from src/lib/case-studies.generated.ts. The
 * Figma pages still carry Coral's placeholder prose (and Coral's impact
 * numbers), so only structure, colour and section titles come from the design.
 *
 * Device screens are static Figma exports standing in for the Jitter/After
 * Effects animations Sakib is producing from the "Complete Flow" screen strips;
 * swap them for video files in Studio when they land.
 *
 * Only patches the `sections` array (card / SEO / order preserved). Idempotent:
 * asset uploads are cached by path.
 *
 * Run from frontend/:
 *   sanity exec scripts/migrate-eb-mt-redesign.ts --with-user-token
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import { generatedCaseStudies } from "../src/lib/case-studies.generated";

const client = getCliClient({ apiVersion: "2025-01-01" });
const PUBLIC = join(process.cwd(), "public");

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);
const hexColor = (hex: string, alpha = 1) => ({ _type: "color", hex, alpha });

// Band fills sampled from the Figma page renders.
const C = {
  black: hexColor("#000000"),
  white: hexColor("#ffffff"),
  // Experian Boost
  ebPanel: hexColor("#5454b1"), // overview panel
  ebProcess: hexColor("#d9aacd"), // design process band
  ebProcessPanel: hexColor("#bc6aa7"), // accordion card
  ebDevices: hexColor("#282866"), // key product experiences
  ebImpact: hexColor("#f7eef5"),
  ebHighlights: hexColor("#6e2278"),
  // Memory Tubes
  mtProcess: hexColor("#d6e0d8"),
  mtProcessPanel: hexColor("#799c96"),
  mtImpact: hexColor("#e6ece8"),
  mtHighlights: hexColor("#8facaa"),
};

function appearance(
  bg?: ReturnType<typeof hexColor>,
  textLight = false,
  extra: Record<string, unknown> = {},
) {
  return {
    _type: "appearance",
    ...(bg ? { backgroundColor: bg } : {}),
    ...(textLight ? { textColor: C.white } : {}),
    ...extra,
  };
}

const span = (text: string) => ({ _type: "span", _key: key(), text, marks: [] as string[] });
function block(text: string, listItem?: "bullet" | "number") {
  const b: Record<string, unknown> = { _type: "block", _key: key(), style: "normal", markDefs: [], children: [span(text)] };
  if (listItem) { b.listItem = listItem; b.level = 1; }
  return b;
}
function pt(text?: string) {
  if (!text) return undefined;
  const blocks = text.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean).map((p) => block(p.replace(/\n/g, " ")));
  return blocks.length ? blocks : undefined;
}
function ptAccordion(item: { paras?: string[]; bullets?: string[] }) {
  const blocks: ReturnType<typeof block>[] = [];
  for (const p of item.paras ?? []) blocks.push(block(p.replace(/\n/g, " ")));
  for (const b of item.bullets ?? []) blocks.push(block(b.replace(/\n/g, " "), "bullet"));
  return blocks.length ? blocks : undefined;
}
// "What I Brought" is one centred prose band in the new template, but the real
// copy is three titled contributions — keep the titles as paragraph lead-ins so
// nothing is lost while Fas writes the condensed version.
function ptBrought(items?: { title?: string; paras?: string[] }[]) {
  const blocks: ReturnType<typeof block>[] = [];
  for (const it of items ?? []) {
    const body = (it.paras ?? []).join(" ").replace(/\n/g, " ").trim();
    if (!body) continue;
    blocks.push(block(it.title ? `${it.title} — ${body}` : body));
  }
  return blocks.length ? blocks : undefined;
}

// ── asset uploads (cached by public path) ────────────────────────────────────
const cache = new Map<string, string | null>();
async function upload(kind: "image" | "file", p: string): Promise<string | null> {
  if (cache.has(p)) return cache.get(p)!;
  const abs = join(PUBLIC, p.replace(/^\//, ""));
  if (!existsSync(abs)) { console.warn(`  ! missing asset: ${p}`); cache.set(p, null); return null; }
  const asset = await client.assets.upload(kind, createReadStream(abs), { filename: basename(abs) });
  cache.set(p, asset._id);
  return asset._id;
}
async function image(p?: string) {
  if (!p) return undefined;
  const id = await upload("image", p);
  return id ? { _type: "image", asset: { _type: "reference", _ref: id } } : undefined;
}
async function mediaImage(p: string) {
  return { _type: "mediaItem", _key: key(), mediaType: "image", image: await image(p) };
}
async function artifactItems(entries: readonly (readonly [string, string])[]) {
  const items = [];
  for (const [caption, p] of entries) {
    const img = await image(p);
    if (img) items.push({ _type: "showcaseItem", _key: key(), image: img, caption });
  }
  return items;
}
// Single-card Project Highlights: one cell whose frames cross-fade.
async function highlightCell(paths: readonly string[]) {
  const frames = [];
  for (const p of paths) {
    const f = await image(p);
    if (f) frames.push({ ...f, _key: key() });
  }
  return frames.length ? [{ _type: "highlightCell", _key: key(), frames }] : [];
}

// ── Experian Boost ───────────────────────────────────────────────────────────
const EB = "/work/experian-boost";

const EB_ARTIFACTS = [
  ["EXPERIENCE FLOW", `${EB}/EB_AI_slider_1.Jpg.png`],
  ["CREDIT ACCESSIBILITY PAIN SCALE", `${EB}/EB_AI_slider_3.Jpg.png`],
  ["CONSUMER EXPERIENCE", `${EB}/EB_AI_slider_2.Jpg.png`],
  ["STAKEHOLDER ACTIVITY MAPPING", `${EB}/EB_AI_slider_4.Jpg.png`],
  ["STAKEHOLDER MAPPING", `${EB}/EB_AI_slider_6.Jpg.png`],
  ["THEORY OF CHANGE", `${EB}/32.png`],
] as const;

// Six customer testimonial cards (Figma 567:21428) rotating through one card.
const EB_HIGHLIGHTS = [1, 2, 3, 4, 5, 6].map((n) => `${EB}/highlights/card-${n}.png`);

const EB_CONFIDENTIALITY =
  "Confidentiality: This case study's insights and design process reflect my perspective and design approach. Specific details have been modified to protect sensitive information from Experian while showcasing my design approach.";

async function buildExperianBoost() {
  const cs = generatedCaseStudies["experian-boost"];
  if (!cs) throw new Error("experian-boost not found in generatedCaseStudies");
  const sections: Record<string, unknown>[] = [];
  const push = (s: Record<string, unknown>) => sections.push({ _key: key(), ...s });

  // 1 · Hero (Figma 600:31409)
  push({
    _type: "heroSection",
    image: await image(cs.hero?.image),
    headingOverride: "Experian Boost",
    caption: "Reimagining Credit Access for Millions",
  });

  // 2 · Overview (600:31419) — indigo panel holding the onboarding screen.
  push({
    _type: "overviewSection",
    sectionTitle: "Overview",
    body: pt(cs.overview?.body),
    serviceCategoryLabel: "Research & Design",
    serviceList: cs.overview?.disciplines,
    duration: cs.overview?.duration,
    team: cs.overview?.team,
    sideImage: await image(`${EB}/overview-panel.png`),
    // The export keeps Figma's own margins around the phone, so contain it on
    // the panel colour rather than cover-cropping the device.
    sideImageFit: "contain",
    sideImageBackgroundColor: C.ebPanel,
    confidentialityNote: EB_CONFIDENTIALITY,
    ctaLabel: "Visit Site",
    ctaUrl: "#",
  });

  // 3 · Problem Context + What I Brought — one continuous black band (600:31598).
  push({ _type: "proseSection", sectionTitle: "Problem Context", body: pt(cs.problem), appearance: appearance(C.black, true, { paddingBottom: "sm" }) });
  push({ _type: "proseSection", sectionTitle: "What I Brought", body: ptBrought(cs.brought), appearance: appearance(C.black, true, { paddingTop: "none" }) });

  // 4 · Design Process (600:31607) — split accordion on the pink band.
  if (cs.approach) {
    push({
      _type: "accordionSection",
      variant: "split",
      sideTitle: "My Approach",
      sideBody: pt(cs.approach.blurb),
      sectionTitle: "Design Process",
      accordionBackgroundColor: C.ebProcessPanel,
      appearance: appearance(C.ebProcess),
      items: cs.approach.process.map((it, i) => ({ _type: "accordionItem", _key: key(), title: it.title, body: ptAccordion(it), defaultOpen: i === 0 })),
    });
  }

  // 5 · Research Artifacts (600:31626) — tap-to-expand slider, intro below.
  push({
    _type: "showcaseGallery",
    sectionTitle: "Research Artifacts",
    introBody: pt(cs.designInterventions?.body),
    expandable: true,
    items: await artifactItems(EB_ARTIFACTS),
    appearance: appearance(C.black, true),
  });

  // 6 · Key Product Experiences (600:31818) — two staggered mobile rows of two.
  //     Static Figma screens until Sakib's flow animations land.
  push({
    _type: "motionShowcase",
    sectionTitle: "Key Product Experiences",
    rows: [
      {
        _type: "motionRow", _key: key(), device: "mobile",
        label: "How It Works",
        caption: cs.productDemo?.body,
        items: [await mediaImage(`${EB}/screens/kpe-1.png`), await mediaImage(`${EB}/screens/kpe-2.png`)],
      },
      {
        _type: "motionRow", _key: key(), device: "mobile",
        label: "Brand-Mirrored Bank Linking",
        caption: "As users selected their bank, the interface subtly adapted to that institution's palette, so the third-party connection felt like a native extension of their own banking app.",
        items: [await mediaImage(`${EB}/screens/kpe-3.png`), await mediaImage(`${EB}/screens/kpe-4.png`)],
      },
    ],
    appearance: appearance(C.ebDevices, true),
  });

  // 7 · Impact (600:32107) — the live numbers, not Figma's Coral placeholders.
  push({
    _type: "statsSection",
    sectionTitle: "Impact",
    items: (cs.stats ?? []).map((s) => ({ _type: "statItem", _key: key(), value: s.value, suffix: s.suffix, label: s.label, note: s.note })),
    appearance: appearance(C.ebImpact),
  });

  // 8 · Project Highlights (600:32123) — one card cycling six testimonials.
  push({
    _type: "highlightReel",
    sectionTitle: "Project Highlights",
    layout: "single",
    cells: await highlightCell(EB_HIGHLIGHTS),
    appearance: appearance(C.ebHighlights, true),
  });

  // 9 · Reflection + Next Steps — one black band (600:32138).
  push({ _type: "proseSection", sectionTitle: "Reflection", body: pt(cs.reflections), appearance: appearance(C.black, true) });
  push({ _type: "bulletSection", sectionTitle: "Next Steps", items: cs.nextSteps, appearance: appearance(C.black, true) });

  return sections;
}

// ── Memory Tubes ─────────────────────────────────────────────────────────────
const MT = "/work/memory-tubes";

const MT_ARTIFACTS = [
  ["URBAN NEEDS ANALYSIS MATRIX", `${MT}/ProbesProvotypes_needanalysismatrix.png`],
  ["DESIGN INTERVENTION STRATEGY FRAMEWORK", `${MT}/ProbesProvotypes_intervention-strategy-1.png`],
  ["PROVOTYPE CONCEPT GENERATION", `${MT}/ProbesProvotypes_Provotype-Concept-Generation-1.png`],
  ["MEMORY TUBE SYSTEM ARCHITECTURE", `${MT}/ProbesProvotypes_Session-four-1.png`],
  ["PROMPT DEVELOPMENT PROCESS", `${MT}/ProbesProvotypes_Session-five-1.png`],
  ["PROMPT DESIGN CATEGORIZATION", `${MT}/ProbesProvotypes_Session-five-Cont-1.png`],
  ["WHEEL OF REASONING", `${MT}/ProbesProvotypes_Wheel-of-Reasoning.png`],
  ["SENSE MAKING", `${MT}/ProbesProvotypes_Sense-Making.png`],
  ["INTEGRATED METHODOLOGY", `${MT}/ProbesProvotypes_Integrated-Methodology.png`],
] as const;

// Nine documentation cards (Figma 1123:8579) rotating through one card.
const MT_HIGHLIGHTS = [
  "01-the-making", "02-the-prompt", "03-the-thing", "04-take-one", "05-take-two",
  "06-generating-curiosity", "07-prototype-deployment", "08-leveraging-prompt", "09-sense-making",
].map((n) => `${MT}/highlights/${n}.png`);

async function buildMemoryTubes() {
  const cs = generatedCaseStudies["memory-tubes"];
  if (!cs) throw new Error("memory-tubes not found in generatedCaseStudies");
  const sections: Record<string, unknown>[] = [];
  const push = (s: Record<string, unknown>) => sections.push({ _key: key(), ...s });

  // 1 · Hero (1123:1037) — the street-intervention collage.
  push({
    _type: "heroSection",
    image: await image(cs.hero?.image),
    headingOverride: "Memory Tubes",
    caption: "Behavioral design research through provocative urban installations",
  });

  // 2 · Overview (1123:1055) — no product UI, so the side art is the field
  //     photography column (piano / "speak here" / prompt signs).
  push({
    _type: "overviewSection",
    sectionTitle: "Overview",
    body: pt(cs.overview?.body),
    serviceCategoryLabel: "Research & Design",
    serviceList: cs.overview?.disciplines,
    duration: cs.overview?.duration,
    team: cs.overview?.team,
    sideImage: await image(cs.overview?.image),
    sideImageBackgroundColor: C.black,
    ctaLabel: "Visit Site",
    ctaUrl: "#",
  });

  // 3 · Problem Context + What I Brought — one black band (1123:1071).
  push({ _type: "proseSection", sectionTitle: "Problem Context", body: pt(cs.problem), appearance: appearance(C.black, true, { paddingBottom: "sm" }) });
  push({ _type: "proseSection", sectionTitle: "What I Brought", body: ptBrought(cs.brought), appearance: appearance(C.black, true, { paddingTop: "none" }) });

  // 4 · Design Process (1123:1080) — split accordion on the sage band.
  if (cs.approach) {
    push({
      _type: "accordionSection",
      variant: "split",
      sideTitle: "My Approach",
      sideBody: pt(cs.approach.blurb),
      sectionTitle: "Design Process",
      accordionBackgroundColor: C.mtProcessPanel,
      appearance: appearance(C.mtProcess),
      items: cs.approach.process.map((it, i) => ({ _type: "accordionItem", _key: key(), title: it.title, body: ptAccordion(it), defaultOpen: i === 0 })),
    });
  }

  // 5 · Research Artifacts (1123:1099) — nine method frameworks.
  push({
    _type: "showcaseGallery",
    sectionTitle: "Research Artifacts",
    introBody: pt(cs.designInterventions?.body),
    expandable: true,
    items: await artifactItems(MT_ARTIFACTS),
    appearance: appearance(C.black, true),
  });

  // 6 · Impact (1123:1583)
  push({
    _type: "statsSection",
    sectionTitle: "Impact",
    items: (cs.stats ?? []).map((s) => ({ _type: "statItem", _key: key(), value: s.value, suffix: s.suffix, label: s.label, note: s.note })),
    appearance: appearance(C.mtImpact),
  });

  // 7 · Project Highlights (1123:1599) — one card cycling nine deployment cards.
  push({
    _type: "highlightReel",
    sectionTitle: "Project Highlights",
    layout: "single",
    cells: await highlightCell(MT_HIGHLIGHTS),
    appearance: appearance(C.mtHighlights),
  });

  // 8 · Next Steps (1123:1619). The Figma band also has a Reflection block, but
  //     no reflection copy exists for this study yet — add it in Studio.
  push({ _type: "bulletSection", sectionTitle: "Next Steps", items: cs.nextSteps, appearance: appearance(C.black, true) });

  return sections;
}

async function run() {
  const jobs = [
    ["cs-experian-boost", buildExperianBoost],
    ["cs-memory-tubes", buildMemoryTubes],
  ] as const;
  for (const [docId, build] of jobs) {
    console.log(`→ building redesigned sections for ${docId}`);
    const sections = await build();
    console.log(`→ patching ${docId} with ${sections.length} sections`);
    await client.patch(docId).set({ sections }).commit();
    console.log(`✓ ${docId} migrated`);
  }
}

run().catch((err) => { console.error(err); process.exit(1); });
