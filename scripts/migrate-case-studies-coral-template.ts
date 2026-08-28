/**
 * Migrate remaining case studies to the Coral full-page template + collaboration
 * doc copy (FINAL COPY v8). Preserves uploaded assets; only restructures sections
 * and patches text fields.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/migrate-case-studies-coral-template.ts --with-user-token -- --dry
 *   npx sanity exec scripts/migrate-case-studies-coral-template.ts --with-user-token -- --slug=experian-boost
 *   npx sanity exec scripts/migrate-case-studies-coral-template.ts --with-user-token -- --slug=experian-boost --dry
 *
 * Re-parse doc first:
 *   node scripts/parse-case-study-collab-doc.mjs
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import { generatedCaseStudies } from "../src/lib/case-studies.generated";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const slugArg = process.argv.find((a) => a.startsWith("--slug="))?.split("=")[1];
const includeCoral = process.argv.includes("--include-coral");

type Section = Record<string, unknown> & {
  _key?: string;
  _type: string;
  sectionTitle?: string;
};

type CollabCopy = {
  hero?: { projectName?: string; statement?: string; from?: string; to?: string };
  overview?: { body?: string; disciplines?: string; duration?: string; team?: string };
  problemContext?: { problem?: string; brought?: string };
  approach?: { blurb?: string; accordion?: { title: string; body: string }[] };
  artifacts?: { intro?: string };
  desktopMotion?: { body?: string };
  impact?: { metrics?: { value: string; suffix?: string; label: string; note?: string }[] };
  reflection?: { body?: string; nextSteps?: string[] };
};

const COPY: Record<string, CollabCopy> = JSON.parse(
  readFileSync(join(process.cwd(), "scripts/data/caseStudyCollabCopy.json"), "utf8"),
);

const SKIP = new Set([
  ...(includeCoral ? [] : ["coral-health"]),
  "design-assist-aI", // typo duplicate document
]);

const CORAL_ORDER = [
  "heroSection",
  "overviewSection",
  "problemContextSection",
  "coreExperience",
  "accordionSection",
  "showcaseGallery",
  "motionShowcase",
  "desktopMotionShowcase",
  "statsSection",
  "highlightReel",
  "reflectionSection",
] as const;

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);
const norm = (s?: string) => (s ?? "").trim().toLowerCase();
const hexColor = (hex: string, alpha = 1) => ({ _type: "color", hex, alpha });
const C = { black: hexColor("#000000"), white: hexColor("#ffffff") };

function appearance(bg?: ReturnType<typeof hexColor>, textLight = false, extra: Record<string, unknown> = {}) {
  return {
    _type: "appearance",
    ...(bg ? { backgroundColor: bg } : {}),
    ...(textLight ? { textColor: C.white } : {}),
    ...extra,
  };
}

const span = (text: string) => ({ _type: "span", _key: key(), text, marks: [] as string[] });
function block(text: string) {
  return { _type: "block", _key: key(), style: "normal", markDefs: [], children: [span(text)] };
}
function pt(text?: string) {
  if (!text?.trim()) return undefined;
  const blocks = text
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((p) => block(p.replace(/\n/g, " ")));
  return blocks.length ? blocks : undefined;
}

function toStatValue(raw: unknown): number | undefined {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string") {
    const n = parseFloat(raw.replace(/[^\d.]/g, ""));
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function rekeySection(s: Section): Section {
  const out: Section = { ...s, _key: key() };
  if (Array.isArray(out.items)) {
    out.items = (out.items as Section[]).map((it) => ({ ...it, _key: key() }));
  }
  if (Array.isArray(out.rows)) {
    out.rows = (out.rows as Section[]).map((row) => ({
      ...row,
      _key: key(),
      items: Array.isArray(row.items)
        ? (row.items as Section[]).map((it) => ({ ...it, _key: key() }))
        : row.items,
    }));
  }
  return out;
}

function mergeProblemContext(sections: Section[]) {
  const out: Section[] = [];
  for (let i = 0; i < sections.length; i++) {
    const cur = sections[i];
    const next = sections[i + 1];
    if (
      cur._type === "proseSection" &&
      next?._type === "proseSection" &&
      norm(cur.sectionTitle) === "problem context" &&
      (norm(next.sectionTitle) === "what i brought" || norm(next.sectionTitle) === "my role")
    ) {
      out.push({
        _key: cur._key ?? key(),
        _type: "problemContextSection",
        problemHeading: String(cur.sectionTitle ?? "Problem Context"),
        problemBody: cur.body,
        broughtHeading: String(next.sectionTitle ?? "What I Brought"),
        broughtBody: next.body,
        appearance: cur.appearance ?? next.appearance ?? appearance(C.black, true),
      });
      i++;
      continue;
    }
    if (cur._type === "problemContextSection") {
      out.push(cur);
      continue;
    }
    out.push(cur);
  }
  return out;
}

function mergeReflection(sections: Section[]) {
  const rIdx = sections.findIndex(
    (s) => s._type === "proseSection" && norm(s.sectionTitle).startsWith("reflection"),
  );
  const bIdx = sections.findIndex((s) => s._type === "bulletSection");
  if (sections.some((s) => s._type === "reflectionSection")) {
    return sections
      .filter((s) => s._type !== "proseSection" || !norm(s.sectionTitle).startsWith("reflection"))
      .filter((s) => s._type !== "bulletSection");
  }
  if (rIdx < 0 && bIdx < 0) return sections;

  const reflection = rIdx >= 0 ? sections[rIdx] : undefined;
  const bullet = bIdx >= 0 ? sections[bIdx] : undefined;
  const merged: Section = {
    _type: "reflectionSection",
    _key: String(reflection?._key ?? bullet?._key ?? key()),
    reflectionHeading: String(reflection?.sectionTitle ?? "Reflection"),
    reflectionBody: reflection?.body,
    nextStepsHeading: String(bullet?.sectionTitle ?? "Next Steps"),
    nextStepsItems: bullet?.items,
    appearance: reflection?.appearance ?? bullet?.appearance ?? appearance(C.black, true),
  };
  const drop = new Set([rIdx, bIdx].filter((i) => i >= 0));
  const out = sections.filter((_, i) => !drop.has(i));
  const insertAt = Math.min(...[rIdx, bIdx].filter((i) => i >= 0));
  out.splice(insertAt, 0, merged);
  return out;
}

function mediaToDesktopMotion(s: Section): Section {
  return {
    _key: String(s._key ?? key()),
    _type: "desktopMotionShowcase",
    sectionTitle: s.sectionTitle ?? "Desktop Motion Showcase",
    videoFile: s.videoFile,
    videoUrl: s.videoUrl,
    posterImage: s.posterImage ?? s.image,
    body: s.body,
    caption: s.caption,
    appearance: s.appearance,
  };
}

function normalizeStructure(sections: Section[]) {
  let out = [...sections.map(rekeySection)];
  out = mergeProblemContext(out);
  out = mergeReflection(out);

  const galleries = out.filter((s) => s._type === "showcaseGallery");
  const legacyGallery = out.filter((s) => s._type === "gallerySection");
  if (legacyGallery.length) {
    const primary = galleries[0] ?? {
      _key: key(),
      _type: "showcaseGallery",
      sectionTitle: "Research Artifacts",
      expandable: true,
      items: [] as Section[],
      appearance: appearance(C.black, true),
    };
    const mergedItems = [
      ...((primary.items as Section[]) ?? []),
      ...legacyGallery.flatMap((g) => (g.items as Section[]) ?? []),
    ];
    out = out.filter((s) => s._type !== "gallerySection" && s._type !== "showcaseGallery");
    out.push({ ...primary, items: mergedItems });
  }

  const mediaSections = out.filter((s) => s._type === "mediaSection");
  if (mediaSections.length) {
    out = out.filter((s) => s._type !== "mediaSection");
    const desktop = mediaSections.find((s) => !/demo|motion|product/i.test(String(s.sectionTitle)));
    const motionCandidates = mediaSections.filter((s) => s !== desktop);
    if (desktop && !out.some((s) => s._type === "desktopMotionShowcase")) {
      out.push(mediaToDesktopMotion(desktop));
    }
    if (motionCandidates.length && !out.some((s) => s._type === "motionShowcase")) {
      out.push({
        _key: key(),
        _type: "motionShowcase",
        sectionTitle: "Key Product Experiences",
        rows: motionCandidates.map((m) => ({
          _type: "motionRow",
          _key: key(),
          device: "mobile",
          label: m.sectionTitle ?? "Product demo",
          caption: m.caption,
          items: m.videoFile || m.videoUrl
            ? [{ _type: "mediaItem", _key: key(), mediaType: "video", videoFile: m.videoFile, videoUrl: m.videoUrl }]
            : m.image
              ? [{ _type: "mediaItem", _key: key(), mediaType: "image", image: m.image }]
              : [],
        })),
        appearance: motionCandidates[0]?.appearance,
      });
    }
  }

  const coreSections = out.filter((s) => s._type === "coreExperience");
  if (coreSections.length > 1) {
    const [first, second] = coreSections;
    out = out.filter((s) => s !== second);
    if (!out.some((s) => s._type === "motionShowcase")) {
      out.push({
        _key: key(),
        _type: "motionShowcase",
        sectionTitle: String(second.sectionTitle ?? "Key Product Experiences"),
        rows: [],
        appearance: second.appearance,
      });
    }
    void first;
  }

  for (const s of out) {
    if (s._type === "showcaseGallery" && /project highlights/i.test(String(s.sectionTitle))) {
      s._type = "highlightReel";
      s.layout = s.layout ?? "grid";
    }
  }

  // Rename mis-titled motion showcase (legacy migrate-eb-mt label).
  for (const s of out) {
    if (s._type === "motionShowcase" && /core experience/i.test(String(s.sectionTitle))) {
      s.sectionTitle = "Key Product Experiences";
    }
  }

  out = out.filter(
    (s) =>
      !["proseSection", "bulletSection", "mediaSection", "gallerySection"].includes(s._type),
  );

  const rank = (t: string) => {
    const i = CORAL_ORDER.indexOf(t as (typeof CORAL_ORDER)[number]);
    return i === -1 ? CORAL_ORDER.length + 1 : i;
  };
  out.sort((a, b) => rank(a._type) - rank(b._type));
  return out;
}

function applyCopy(sections: Section[], copy?: CollabCopy, slug?: string) {
  const gen = slug ? (generatedCaseStudies as Record<string, unknown>)[slug] : undefined;
  const g = gen as {
    problem?: string;
    brought?: { title?: string; paras?: string[] }[];
    overview?: { body?: string; disciplines?: string; duration?: string; team?: string };
    approach?: { blurb?: string; process?: { title?: string; paras?: string[]; bullets?: string[] }[] };
    designInterventions?: { body?: string };
    reflections?: string;
    nextSteps?: string[];
    stats?: { value?: string; suffix?: string; label?: string; note?: string }[];
    hero?: { caption?: string };
  } | undefined;

  const c = copy ?? {};
  const fallbackProblem = c.problemContext?.problem ?? g?.problem;
  const fallbackBrought =
    c.problemContext?.brought ??
    (g?.brought ?? [])
      .map((it) => [it.title, ...(it.paras ?? [])].filter(Boolean).join(" — "))
      .join("\n\n");

  return sections.map((s) => {
    const sec = { ...s };
    if (sec._type === "heroSection") {
      if (c.hero?.statement) sec.caption = c.hero.statement;
      else if (g?.hero?.caption) sec.caption = g.hero.caption;
      if (c.hero?.projectName) sec.headingOverride = c.hero.projectName;
    }
    if (sec._type === "overviewSection") {
      if (c.overview?.body) sec.body = pt(c.overview.body);
      else if (g?.overview?.body) sec.body = pt(g.overview.body);
      if (c.overview?.disciplines) sec.serviceList = c.overview.disciplines.replace(/\.$/, "");
      else if (g?.overview?.disciplines) sec.serviceList = g.overview.disciplines;
      if (c.overview?.duration) sec.duration = c.overview.duration;
      else if (g?.overview?.duration) sec.duration = g.overview.duration;
      if (c.overview?.team) sec.team = c.overview.team;
      else if (g?.overview?.team) sec.team = g.overview.team;
      if (!sec.serviceCategoryLabel) sec.serviceCategoryLabel = "Research & Design";
    }
    if (sec._type === "problemContextSection") {
      if (fallbackProblem) sec.problemBody = pt(fallbackProblem);
      if (fallbackBrought) sec.broughtBody = pt(fallbackBrought);
      if (!sec.appearance) sec.appearance = appearance(C.black, true);
    }
    if (sec._type === "accordionSection") {
      if (c.approach?.blurb) sec.sideBody = pt(c.approach.blurb);
      else if (g?.approach?.blurb) sec.sideBody = pt(g.approach.blurb);
      const acc = c.approach?.accordion?.length ? c.approach.accordion : g?.approach?.process;
      if (acc?.length) {
        sec.sectionTitle = sec.sectionTitle ?? "Design Process";
        sec.variant = sec.variant ?? "split";
        sec.sideTitle = sec.sideTitle ?? "My Approach";
        sec.items = acc.map((it, i) => ({
          _type: "accordionItem",
          _key: key(),
          title: it.title,
          body: pt("body" in it ? it.body : (it.paras ?? []).concat(it.bullets ?? []).join(" ")),
          defaultOpen: i === 0,
        }));
      }
    }
    if (sec._type === "showcaseGallery") {
      const intro = c.artifacts?.intro ?? g?.designInterventions?.body;
      if (intro) sec.introBody = pt(intro);
      sec.sectionTitle = sec.sectionTitle ?? "Research Artifacts";
      sec.expandable = sec.expandable ?? true;
    }
    if (sec._type === "desktopMotionShowcase") {
      const body = c.desktopMotion?.body;
      if (body) sec.body = pt(body);
    }
    if (sec._type === "statsSection" && c.impact?.metrics?.length) {
      sec.sectionTitle = sec.sectionTitle ?? "Impact";
      sec.items = c.impact.metrics.map((m) => ({
        _type: "statItem",
        _key: key(),
        value: toStatValue(m.value) ?? 0,
        suffix: m.suffix ?? "",
        label: m.label,
        note: m.note,
      }));
    }
    if (sec._type === "reflectionSection") {
      const refBody = c.reflection?.body ?? g?.reflections;
      if (refBody) sec.reflectionBody = pt(refBody);
      const steps = c.reflection?.nextSteps?.length ? c.reflection.nextSteps : g?.nextSteps;
      if (steps?.length) sec.nextStepsItems = steps;
      if (!sec.appearance) sec.appearance = appearance(C.black, true);
    }
    return sec;
  });
}

async function run() {
  const ids: { _id: string; slug: string }[] = await client.fetch(
    `*[_type=="caseStudy" && !(_id in path("drafts.**"))]{ _id, "slug": slug.current } | order(slug asc)`,
  );

  const targets = ids.filter((d) => !SKIP.has(d.slug)).filter((d) => (slugArg ? d.slug === slugArg : true));

  if (slugArg && !targets.length) {
    console.error(`No published case study "${slugArg}"`);
    process.exit(1);
  }

  console.log(`${DRY ? "(dry run) " : ""}migrating ${targets.length} case study/studies…`);

  for (const { _id, slug } of targets) {
    const doc = await client.getDocument(_id);
    if (!doc) continue;
    const before = (doc.sections ?? []) as Section[];
    let sections = normalizeStructure(before);
    sections = applyCopy(sections, COPY[slug], slug);

    const docPatch: Record<string, unknown> = { sections };
    const copy = COPY[slug];
    if (copy?.hero?.projectName) docPatch.title = copy.hero.projectName;
    if (copy?.hero?.statement) docPatch.tagline = copy.hero.statement;
    if (copy?.hero?.from) docPatch.from = copy.hero.from;
    if (copy?.hero?.to) docPatch.to = copy.hero.to;

    console.log(`\n${slug}: ${before.length} → ${sections.length} sections`);
    for (const s of sections) {
      console.log(`   ${String(s._type).padEnd(22)} ${String(s.sectionTitle ?? "").slice(0, 40)}`);
    }
    const copyNote = COPY[slug] ? "collab doc" : "generated fallback";
    console.log(`   copy source: ${copyNote}`);

    if (!DRY) {
      await client.patch(_id).set(docPatch).commit();
      console.log("   ✓ patched");
    }
  }

  if (DRY) console.log("\n(dry run — nothing written)");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
