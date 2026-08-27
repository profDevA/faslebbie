/**
 * Structure-first migration of the 14 case studies still on the old
 * (WordPress-derived) layout onto the Coral template — the 08/03 meeting's P0.
 *
 * Old → new, as Israel walked it (docs/meetings/2026-08-03-actions.md):
 *
 *   What I Brought accordion  → plain prose fused with Problem Context on one
 *                               continuous black band
 *   Campaign Background       → dropped
 *   Design Interventions      → becomes the Research Artifacts intro
 *   gallery sections          → Research Artifacts (expandable slider)
 *   Reflections & Impact      → Reflection
 *
 * Nothing is re-exported: every image and video is the asset already on the
 * document, and every word is the copy already published (verified identical to
 * src/lib/case-studies.generated.ts). Only the arrangement changes.
 *
 * Two bands are deliberately left off until their source material exists:
 * Project Highlights (no artwork drawn for these pages yet) and Key Product
 * Experiences (its device slots expect Jitter mockups; the existing demo
 * recordings stay in their own media band, which is what they were drawn as).
 *
 * Band colours are the template's, not per-page — those come from each page's
 * Figma once Israel marks it finalised.
 *
 * Only patches `sections` (card / SEO / order preserved).
 *
 * Run from frontend/:
 *   sanity exec scripts/migrate-remaining-redesign.ts --with-user-token -- --dry
 *   sanity exec scripts/migrate-remaining-redesign.ts --with-user-token -- --slug=life-of-a-miner-vr
 *   sanity exec scripts/migrate-remaining-redesign.ts --with-user-token -- --slug=life-of-a-miner-vr --dry
 */
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import { generatedCaseStudies } from "../src/lib/case-studies.generated";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const slugArg = process.argv.find((a) => a.startsWith("--slug="))?.split("=")[1];

/** Wall order after Coral / Experian / Memory Tubes (see patch-work-img-titles-order.ts). */
export const REMAINING_QUEUE = [
  "life-of-a-miner-vr",
  "snapback-lifestyle",
  "diamond-valuation-ai",
  "financial-data-exchange",
  "remote-assistant-object-detection",
  "oc-digital-resource-navigator",
  "forever-a-surfer",
  "design-assist-ai",
  "oc-links",
  "acme-lending",
  "galderma",
  "vuforia-chalk",
  "vuforia-expert-capture",
  "2020-us-census-benefit-calculator",
] as const;

// Already on the new template — Coral is the reference, the other two were
// migrated 08/04 against their own finalised Figma pages.
const DONE = new Set(["coral-health", "experian-boost", "memory-tubes"]);

type Section = Record<string, any>;

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);
const hexColor = (hex: string, alpha = 1) => ({ _type: "color", hex, alpha });

const C = {
  black: hexColor("#000000"),
  white: hexColor("#ffffff"),
  processBand: hexColor("#99b29d", 0.4), // Coral's mint Design Process band
  processPanelFallback: hexColor("#ff5005", 0.5),
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
const block = (text: string) => ({
  _type: "block",
  _key: key(),
  style: "normal",
  markDefs: [],
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
// The new template states What I Brought as one prose band, but the copy is a
// set of titled contributions — keep the titles as paragraph lead-ins so
// nothing is lost while Fas writes the condensed version.
function ptBrought(items?: { title?: string; paras?: string[] }[]) {
  const blocks = [];
  for (const it of items ?? []) {
    const body = (it.paras ?? []).join(" ").replace(/\n/g, " ").trim();
    if (!body) continue;
    blocks.push(block(it.title ? `${it.title} — ${body}` : body));
  }
  return blocks.length ? blocks : undefined;
}

// Blocks moved between arrays get fresh keys so two sources can't collide.
const rekey = (blocks?: Section[]) => (blocks ?? []).map((b) => ({ ...b, _key: key() }));

const blocksToText = (blocks?: Section[]) =>
  (blocks ?? [])
    .filter((b) => b._type === "block")
    .map((b) => (b.children ?? []).map((c: Section) => c.text).join(""))
    .join(" ")
    .trim();

const IS = {
  brought: /what i brought|my role/i,
  process: /design process/i,
  interventions: /design intervention|design solution|featured designs/i,
  reflection: /reflection|short & long|^impact$/i,
};

function buildSections(slug: string, sections: Section[]) {
  const g = generatedCaseStudies[slug as keyof typeof generatedCaseStudies] as any;
  const of = (t: string) => sections.filter((s) => s._type === t);
  const titled = (t: string, re: RegExp) =>
    sections.find((s) => s._type === t && re.test(s.sectionTitle ?? ""));

  const out: Section[] = [];
  const notes: string[] = [];
  const add = (s: Section) => out.push({ _key: key(), ...s });

  // 01 Hero
  const hero = of("heroSection")[0];
  if (hero) out.push(hero);
  else notes.push("no hero");

  // 02 Project Overview — kept wholesale (side art, service list, team).
  const overview = of("overviewSection")[0];
  if (overview) out.push({ ...overview, sectionTitle: overview.sectionTitle ?? "Overview" });
  else notes.push("no overview section, and none in the copy either");

  // 03 Problem Context + What I Brought — one continuous black band.
  if (g?.problem)
    add({
      _type: "proseSection",
      sectionTitle: "Problem Context",
      body: pt(g.problem),
      appearance: appearance(C.black, true, { paddingBottom: "sm" }),
    });
  const brought = ptBrought(g?.brought);
  if (brought)
    add({
      _type: "proseSection",
      sectionTitle: "What I Brought",
      body: brought,
      appearance: appearance(C.black, true, { paddingTop: "none" }),
    });
  if (titled("accordionSection", IS.brought)?.sectionTitle === "My Role")
    notes.push('renamed "My Role" → "What I Brought"');

  // 04 Design Process — same accordion, now on the template's coloured band.
  const process = titled("accordionSection", IS.process);
  const interventions = sections.find(
    (s) => s._type === "proseSection" && IS.interventions.test(s.sectionTitle ?? ""),
  );
  if (process) {
    const panel = interventions?.appearance?.backgroundColor?.hex;
    out.push({
      ...process,
      sectionTitle: "Design Process",
      variant: "split",
      accordionBackgroundColor: panel ? hexColor(panel, 0.5) : C.processPanelFallback,
      appearance: appearance(C.processBand),
    });
  } else notes.push("no Design Process content");

  // 05 Research Artifacts — every gallery merged into one expandable slider,
  // introduced by what used to be the Design Interventions band. Each gallery
  // also carried its own paragraph; those follow the intro so no copy is lost,
  // led by the gallery's name when a page had more than one.
  const galleries = [...of("gallerySection"), ...of("showcaseGallery")];
  const items = galleries.flatMap((s: Section) =>
    (s.items ?? []).map((it: Section) => ({ ...it, _type: "showcaseItem", _key: key() })),
  );
  const withCopy = galleries.filter((s: Section) => s.body?.length);
  const intro = [
    ...(pt(g?.designInterventions?.body) ?? rekey(interventions?.body)),
    ...withCopy.flatMap((s: Section) =>
      withCopy.length > 1 && s.sectionTitle && !/^gallery$/i.test(s.sectionTitle)
        ? [block(`${s.sectionTitle} — ${blocksToText(s.body)}`)]
        : rekey(s.body),
    ),
  ];
  if (items.length)
    add({
      _type: "showcaseGallery",
      sectionTitle: "Research Artifacts",
      expandable: true,
      introBody: intro.length ? intro : undefined,
      items,
      appearance: appearance(C.black, true),
    });
  else notes.push("no artifact images");

  // 06/07 The demo recordings keep their own band, unchanged.
  for (const m of of("mediaSection")) out.push(m);

  // 08 Impact
  const stats = of("statsSection")[0];
  if (stats) out.push({ ...stats, sectionTitle: "Impact" });
  else notes.push("no impact stats");

  // 10 Reflection / Next Steps
  const reflection = sections.find(
    (s) => s._type === "proseSection" && IS.reflection.test(s.sectionTitle ?? ""),
  );
  if (reflection)
    out.push({
      ...reflection,
      sectionTitle: "Reflection",
      appearance: appearance(C.black, true),
    });
  else if (g?.reflections)
    add({
      _type: "proseSection",
      sectionTitle: "Reflection",
      body: pt(g.reflections),
      appearance: appearance(C.black, true),
    });

  const bullets = of("bulletSection")[0];
  if (bullets)
    out.push({
      ...bullets,
      sectionTitle: "Next Steps",
      appearance: appearance(C.black, true),
    });
  else notes.push("no Next Steps");

  return { sections: out, notes };
}

async function run() {
  const docs: { _id: string; slug: string; sections: Section[] }[] = await client.fetch(
    `*[_type=="caseStudy"]{_id,"slug":slug.current,sections}|order(slug asc)`,
  );

  const pending = docs.filter((d) => !DONE.has(d.slug));
  const queueRank = (slug: string) => {
    const i = REMAINING_QUEUE.indexOf(slug as (typeof REMAINING_QUEUE)[number]);
    return i === -1 ? REMAINING_QUEUE.length : i;
  };
  const targets = slugArg
    ? pending.filter((d) => d.slug === slugArg)
    : [...pending].sort((a, b) => queueRank(a.slug) - queueRank(b.slug));

  if (slugArg && !targets.length) {
    console.error(`No pending case study with slug "${slugArg}" (already migrated or missing).`);
    process.exit(1);
  }

  if (!slugArg) {
    console.log(`Queue (${targets.length} remaining): ${REMAINING_QUEUE.filter((s) => pending.some((d) => d.slug === s)).join(", ")}`);
  }

  for (const doc of targets) {
    const { sections, notes } = buildSections(doc.slug, doc.sections ?? []);
    console.log(`\n${doc.slug}  (${doc.sections?.length ?? 0} → ${sections.length} sections)`);
    for (const s of sections) {
      const count = s.items?.length ?? s.rows?.length ?? s.cells?.length;
      console.log(
        `   ${s._type.padEnd(17)} ${String(s.sectionTitle ?? "").padEnd(22)}` +
          (count ? ` ${count} item(s)` : ""),
      );
    }
    for (const n of notes) console.log(`   ! ${n}`);
    if (!DRY) {
      await client.patch(doc._id).set({ sections }).commit();
      console.log("   ✓ patched");
    }
  }
  if (DRY) console.log("\n(dry run — nothing written)");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
