/**
 * Coral Health case-study REDESIGN (07/23 meeting — the one template all others
 * clone from). Rebuilds `cs-coral-health`'s `sections` into the new, shorter
 * structure:
 *   1 Hero · 2 Project Overview (animated mobile) · 3 Problem Context + What I
 *   Brought (merged) · 4 Design Process · 5 Research Artifacts (tap-to-expand
 *   slider) · 6 Motion Showcase (device animations) · 7 Marketing Website ·
 *   8 Impact · 9 Project Highlights (rotating grid) · 10 Reflection / Next Steps
 *
 * Real copy is reused from src/lib/case-studies.generated.ts; the overview +
 * artifacts intro use the updated Figma copy. Device/highlight animations are
 * placeholders (existing coral .mp4s + static frames) — the Jitter exports drop
 * in later by swapping the uploaded files.
 *
 * Only patches the `sections` array (card / SEO / order preserved). Idempotent:
 * asset uploads are cached by path.
 *
 * Run from frontend/:
 *   sanity exec scripts/migrate-coral-redesign.ts --with-user-token
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import { generatedCaseStudies } from "../src/lib/case-studies.generated";

const client = getCliClient({ apiVersion: "2025-01-01" });
const PUBLIC = join(process.cwd(), "public");
const DOC_ID = "cs-coral-health";
const CH = "/work/coral-health";

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);
const hexColor = (hex: string, alpha = 1) => ({ _type: "color", hex, alpha });

const C = {
  teal: hexColor("#52747e"),
  peach: hexColor("#fe9d68"),
  peachPanel: hexColor("#ef8a4e"),
  sage: hexColor("#99b29d", 0.4),
  orange: hexColor("#ff5005", 0.5),
  periwinkle: hexColor("#b7c6e5"),
  brown: hexColor("#a4856e"),
  reelTeal: hexColor("#0f3b42"),
  impactMist: hexColor("#d6e0d8", 0.6),
  black: hexColor("#000000"),
  white: hexColor("#ffffff"),
};

function appearance(bg?: ReturnType<typeof hexColor>, textLight = false, extra: Record<string, unknown> = {}) {
  return { _type: "appearance", ...(bg ? { backgroundColor: bg } : {}), ...(textLight ? { textColor: C.white } : {}), ...extra };
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
async function file(p?: string) {
  if (!p) return undefined;
  const id = await upload("file", p);
  return id ? { _type: "file", asset: { _type: "reference", _ref: id } } : undefined;
}
async function mediaVideo(p: string) {
  return { _type: "mediaItem", _key: key(), mediaType: "video", videoFile: await file(p) };
}
async function mediaImage(p: string) {
  return { _type: "mediaItem", _key: key(), mediaType: "image", image: await image(p) };
}

// Updated Figma copy (07/23 redesign).
const OVERVIEW_BODY =
  "In communities across America, finding healthcare providers who genuinely understand your background isn’t just a preference; it’s the difference between getting care or going without. Coral Health tackles this challenge by creating pathways that connect patients from underserved communities with culturally competent providers who understand their needs and experiences. As the only designer, I worked with the founding team and built the entire experience design system platform. The platform delivers smart matching technology and dedicated navigation support to its clients, helping over 75% of their users find and stick with providers they trust, improving healthcare accessibility and utilization among historically underserved groups.";
const CONFIDENTIALITY =
  "Confidentiality: This case study's insights and design process reflect my perspective and design approach. Specific details have been modified to protect sensitive information from Experian while showcasing my design approach.";
const PROBLEM_CONTEXT =
  "The data was stark, but the human reality was even heavier. In the U.S., 83% of health outcomes show worse results for Black patients compared to White patients, and Black women face 3× higher pregnancy-related mortality. Yet, the system often treats these disparities as inevitable.\n\nWe found that 65% of Black adults and 54% of Latinx adults struggle to find providers who understand their cultural backgrounds. This creates a cycle of mistrust: patients delay care, avoid screenings, and disengage until it is too late. The existing landscape offered them fragmented directories and cold clinical portals, forcing them to act as their own case managers in a system that didn’t seem to see them.";
const WHAT_I_BROUGHT =
  "For Coral Health, the challenge wasn’t just technical; it was systemic and economic. We had to intervene upstream. Traditional primary care dependency was a major barrier because many employees of color didn’t see PCPs regularly or faced “surprise costs” that eroded trust. We needed a design intervention that could bypass these systemic failures, offering a direct, transparent, and efficient pathway to early detection.";
const ARTIFACTS_INTRO =
  "The design intervention targets patients from underserved communities who struggle finding culturally competent providers. Currently, 65% of Black adults and 54% of Latinx adults report difficulty finding providers who understand their experiences. The Coral Health digital platform uses matching algorithms to connect patients with culturally competent providers and provides navigation support. The platform connects patients with providers who understand their cultural context, and it provides engagement tools and resources so patients can make informed healthcare decisions. By streamlining cultural matching, 75% of users find and stick with trusted providers.";

const ARTIFACTS = [
  ["THE PROBLEM", `${CH}/artifacts/problem.png`],
  ["PROBLEM & SOLUTION", `${CH}/artifacts/problem-solution.png`],
  ["STRUCTURAL DISPARITIES", `${CH}/artifacts/structural-disparities.png`],
  ["VALUE PROPOSITION CANVAS", `${CH}/artifacts/value-proposition.png`],
  ["THE SOLUTION", `${CH}/artifacts/solution.png`],
  ["THEORY OF CHANGE", `${CH}/artifacts/theory-of-change.png`],
] as const;

async function buildSections() {
  const cs = generatedCaseStudies["coral-health"];
  if (!cs) throw new Error("coral-health not found in generatedCaseStudies");
  const sections: Record<string, unknown>[] = [];
  const push = (s: Record<string, unknown>) => sections.push({ _key: key(), ...s });

  // 1 · Hero
  push({ _type: "heroSection", image: await image(`${CH}/ch_hero.jpg-scaled.png`), headingOverride: "Coral Health", caption: "Making quality healthcare accessible for underserved communities" });

  // 2 · Project Overview (animated mobile placeholder = existing coral .mp4)
  push({
    _type: "overviewSection",
    sectionTitle: "Overview",
    body: pt(OVERVIEW_BODY),
    serviceCategoryLabel: "Research & Design",
    serviceList: cs.overview?.disciplines,
    duration: cs.overview?.duration,
    team: cs.overview?.team,
    sideImage: await image(`${CH}/frame-1171276875-1.png`),
    sideVideo: await file(`${CH}/motion/Flow-1 Mobile.mp4`),
    sideImageBackgroundColor: C.teal,
    confidentialityNote: CONFIDENTIALITY,
    ctaLabel: "Visit Site",
    ctaUrl: "#",
  });

  // 3 · Problem Context / What I Brought (centered black narrative — Figma 600:12516).
  // Two stacked prose blocks on one continuous black band (flush padding between).
  push({ _type: "proseSection", sectionTitle: "Problem Context", body: pt(PROBLEM_CONTEXT), appearance: appearance(C.black, true, { paddingBottom: "sm" }) });
  push({ _type: "proseSection", sectionTitle: "What I Brought", body: pt(WHAT_I_BROUGHT), appearance: appearance(C.black, true, { paddingTop: "none" }) });

  // 4 · Design Process (split accordion — reused copy)
  if (cs.approach) {
    push({
      _type: "accordionSection",
      variant: "split",
      sideTitle: "My Approach",
      sideBody: pt(cs.approach.blurb),
      sectionTitle: "Design Process",
      accordionBackgroundColor: C.orange,
      appearance: appearance(C.sage),
      items: cs.approach.process.map((it, i) => ({ _type: "accordionItem", _key: key(), title: it.title, body: ptAccordion(it), defaultOpen: i === 0 })),
    });
  }

  // 5 · Research Artifacts (tap-to-expand slider)
  const artItems = [];
  for (const [caption, p] of ARTIFACTS) {
    const img = await image(p);
    if (img) artItems.push({ _type: "showcaseItem", _key: key(), image: img, caption });
  }
  push({
    _type: "showcaseGallery",
    sectionTitle: "Research Artifacts",
    introBody: pt(ARTIFACTS_INTRO),
    expandable: true,
    items: artItems,
    appearance: appearance(C.black, true),
  });

  // 6 · Motion Showcase (Key Product Experiences) — Jitter device animations.
  //     Staggered layout: 3 mobile flows (left) + 2 iPad flows (right).
  const M = `${CH}/motion`;
  push({
    _type: "motionShowcase",
    sectionTitle: "Key Product Experiences",
    rows: [
      {
        _type: "motionRow", _key: key(), device: "mobile",
        label: "Personalized Care Journey",
        caption: "Discover recommendations, understand your results, and begin preventative care through a guided experience.",
        items: [
          await mediaVideo(`${M}/Flow-1 Mobile.mp4`),
          await mediaVideo(`${M}/Flow-2 Mobile.mp4`),
          await mediaVideo(`${M}/Flow-3 Mobile.mp4`),
        ],
      },
      {
        _type: "motionRow", _key: key(), device: "tablet",
        label: "Care Delivery Experience",
        caption: "From booking appointments to attending virtual consultations, Coral Health simplified the entire care-delivery experience so users confidently access care without navigating fragmented healthcare systems.",
        items: [
          await mediaVideo(`${M}/Coral-Tablet-Flow-1.mp4`),
          await mediaVideo(`${M}/Coral-Tablet-Flow-2.mp4`),
        ],
      },
    ],
    appearance: appearance(C.brown),
  });

  // 7 · Marketing Website — desktop Jitter animation.
  push({
    _type: "mediaSection",
    sectionTitle: "Marketing Website",
    body: pt("Beyond the product experience, Coral Health required a public-facing website that communicated trust, educated employees and patients, and clearly articulated the company’s mission before users ever entered the application."),
    items: [await mediaVideo(`${M}/Coral-Desktop-Flow.mp4`)],
    appearance: appearance(C.peach),
  });

  // 8 · Impact (count-up stats — reused real numbers). Figma 600:13125 band.
  push({
    _type: "statsSection",
    sectionTitle: "Impact",
    items: (cs.stats ?? []).map((s) => ({ _type: "statItem", _key: key(), value: s.value, suffix: s.suffix, label: s.label, note: s.note })),
    appearance: appearance(C.impactMist),
  });

  // 9 · Project Highlights (rotating grid). PLACEHOLDER: each cell cross-fades
  //     through its own art (frame 1) + a couple existing Coral frames, so the
  //     grid visibly animates until Saki's real per-cell sets land (07/23).
  const HIGHLIGHT_SETS = [
    [`${CH}/highlights/cell-1.png`, `${CH}/coral_health_desktop.png`, `${CH}/coral_health_desktop_2.png`],
    [`${CH}/highlights/cell-2.png`, `${CH}/ch_di_slider_1.jpg-2.png`, `${CH}/ch_di_slider_2.jpg-2.png`],
    [`${CH}/highlights/cell-3.png`, `${CH}/ch_ai_slider_1.jpg.png`, `${CH}/ch_ai_slider_2.jpg.png`],
    [`${CH}/highlights/cell-4.png`, `${CH}/ch_di_slider_3.jpg-2.png`, `${CH}/ch_di_slider_4.jpg-2.png`],
    [`${CH}/highlights/cell-5.png`, `${CH}/coral_health_desktop_3.png`, `${CH}/coral_health_desktop_4.png`],
    [`${CH}/highlights/cell-6.png`, `${CH}/ch_ai_slider_3.jpg.png`, `${CH}/ch_ai_slider_5.jpg-1.png`],
  ];
  const cells = [];
  for (const set of HIGHLIGHT_SETS) {
    const frames = [];
    for (const p of set) {
      const f = await image(p);
      if (f) frames.push({ ...f, _key: key() });
    }
    if (frames.length) cells.push({ _type: "highlightCell", _key: key(), frames });
  }
  push({ _type: "highlightReel", sectionTitle: "Project Highlights", cells, appearance: appearance(C.reelTeal, true) });

  // 10 · Reflection + Next Steps — one black band (Figma 600:14126). Same bg so
  //      the renderer coalesces them onto a single centred screen. Copy is the
  //      Figma frame text (Next Steps still carries placeholder artist copy —
  //      swap in Studio once real next steps land).
  const REFLECTION = "Coral Health reinforced that healthcare challenges are rarely solved through technology alone. Designing for underserved communities required understanding cultural barriers, trust, healthcare economics, and systemic inequities alongside user experience. The greatest lesson was that successful healthcare products must balance empathy, accessibility, and operational realities while remaining simple enough for users navigating stressful moments.";
  const NEXT_STEPS = [
    "Expand the artist partnership program to additional cities in the US.",
    "Develop limited edition timepiece collaborations with featured campaign artists and implement artist-designed watch face customization options based on campaign feedback. Launch an artist residency program that provides creative spaces and brand partnership opportunities.",
  ];
  push({ _type: "proseSection", sectionTitle: "Reflection", body: pt(REFLECTION), appearance: appearance(C.black, true) });
  push({ _type: "bulletSection", sectionTitle: "Next Steps", items: NEXT_STEPS, appearance: appearance(C.black, true) });

  return sections;
}

async function run() {
  console.log("→ building redesigned Coral Health sections");
  const sections = await buildSections();
  console.log(`→ patching ${DOC_ID} with ${sections.length} sections`);
  await client.patch(DOC_ID).set({ sections }).commit();
  console.log("✓ Coral Health redesign migrated");
}

run().catch((err) => { console.error(err); process.exit(1); });
