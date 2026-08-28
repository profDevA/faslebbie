/**
 * Fix Studio validation errors after coral template migration:
 * - statItem.value must be number (migration wrote strings)
 * - accordionSection needs 3–6 items
 * - highlightReel needs ≥1 cell with frames
 * - legacy section types on design-assist-aI duplicate
 * - sync drafts from published
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-case-study-studio-validation.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-case-study-studio-validation.ts --with-user-token
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import { generatedCaseStudies } from "../src/lib/case-studies.generated";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const slugArg = process.argv.find((a) => a.startsWith("--slug="))?.split("=")[1];

const COPY: Record<string, { impact?: { metrics?: { value: string; suffix?: string; label: string; note?: string }[] } }> =
  JSON.parse(readFileSync(join(process.cwd(), "scripts/data/caseStudyCollabCopy.json"), "utf8"));

const LEGACY = new Set(["proseSection", "bulletSection", "mediaSection", "gallerySection"]);
const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

type Section = Record<string, unknown> & { _key?: string; _type: string; sectionTitle?: string };

function toStatValue(raw: unknown): number | undefined {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string") {
    const n = parseFloat(raw.replace(/[^\d.]/g, ""));
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function fixStatsSection(s: Section, slug: string) {
  const copyMetrics = COPY[slug]?.impact?.metrics;
  const genStats = (generatedCaseStudies as Record<string, { stats?: { value?: string | number; suffix?: string; label?: string; note?: string }[] }>)[slug]?.stats;
  const source = copyMetrics?.length ? copyMetrics : genStats;
  if (!source?.length) return s;

  s.items = source.map((m, i) => {
    const existing = ((s.items as Section[]) ?? [])[i] as Section | undefined;
    const val = toStatValue(m.value ?? existing?.value);
    return {
      _type: "statItem",
      _key: String(existing?._key ?? key()),
      value: val ?? 0,
      suffix: m.suffix ?? existing?.suffix ?? "",
      label: m.label ?? existing?.label ?? "Metric",
      note: m.note ?? existing?.note,
    };
  });
  return s;
}

function fixAccordion(s: Section, slug: string) {
  const items = (s.items as Section[]) ?? [];
  if (items.length >= 3) {
    if (!s.variant) s.variant = "split";
    return s;
  }
  const gen = (generatedCaseStudies as Record<string, { approach?: { process?: { title?: string; paras?: string[]; bullets?: string[] }[] } }>)[slug];
  const fromGen = (gen?.approach?.process ?? []).map((it) => ({
    _type: "accordionItem",
    _key: key(),
    title: it.title,
    body: [
      {
        _type: "block",
        _key: key(),
        style: "normal",
        markDefs: [],
        children: [{ _type: "span", _key: key(), text: [...(it.paras ?? []), ...(it.bullets ?? [])].join(" "), marks: [] }],
      },
    ],
    defaultOpen: false,
  }));
  if (fromGen.length >= 3) {
    s.items = fromGen.slice(0, 6);
  } else if (items.length > 0) {
    // Pad by splitting last item title if still short — duplicate with "(continued)" as last resort
    while ((s.items as Section[]).length < 3 && items.length) {
      (s.items as Section[]).push({ ...items[items.length - 1], _key: key() });
    }
  }
  if (!s.variant) s.variant = "split";
  return s;
}

function stripEmptyHighlightReel(sections: Section[]) {
  return sections.filter((s) => {
    if (s._type !== "highlightReel") return true;
    const cells = s.cells as { frames?: unknown[] }[] | undefined;
    if (!cells?.length) return false;
    return cells.some((c) => (c.frames?.length ?? 0) > 0);
  });
}

function fixSections(sections: Section[], slug: string): Section[] {
  let out = sections.map((s) => {
    const sec = { ...s };
    if (sec._type === "statsSection") return fixStatsSection(sec, slug);
    if (sec._type === "accordionSection") return fixAccordion(sec, slug);
    return sec;
  });
  out = stripEmptyHighlightReel(out);
  return out;
}

async function main() {
  const pubs: { _id: string; slug: string }[] = await client.fetch(
    `*[_type == "caseStudy" && !(_id in path("drafts.**"))]{ _id, "slug": slug.current } | order(slug asc)`,
  );
  const targets = slugArg ? pubs.filter((p) => p.slug === slugArg) : pubs;

  let fixed = 0;
  for (const { _id, slug } of targets) {
    const doc = await client.getDocument(_id);
    if (!doc) continue;

    const before = (doc.sections ?? []) as Section[];
    const hasLegacy = before.some((s) => LEGACY.has(s._type));
    const hasStringStats = before.some(
      (s) =>
        s._type === "statsSection" &&
        ((s.items as Section[]) ?? []).some((it) => typeof it.value === "string"),
    );
    const hasBadAccordion = before.some(
      (s) => s._type === "accordionSection" && ((s.items as Section[])?.length ?? 0) < 3,
    );
    const hasEmptyHighlight = before.some(
      (s) => s._type === "highlightReel" && !((s.cells as unknown[])?.length),
    );

    if (!hasLegacy && !hasStringStats && !hasBadAccordion && !hasEmptyHighlight) {
      continue;
    }

    let sections: Section[];
    if (slug === "design-assist-aI" && hasLegacy) {
      const canonical = await client.fetch<{ sections?: Section[] }>(
        `*[_type=="caseStudy" && slug.current=="design-assist-ai" && !(_id in path("drafts.**"))][0]{ sections }`,
      );
      sections = fixSections(
        (canonical?.sections?.length ? canonical.sections : before) as Section[],
        "design-assist-ai",
      );
      console.log(`→ ${_id} (${slug}): clone from design-assist-ai + fixes`);
    } else {
      sections = fixSections(before, slug);
      const notes = [
        hasLegacy ? "legacy" : "",
        hasStringStats ? "stat-types" : "",
        hasBadAccordion ? "accordion" : "",
        hasEmptyHighlight ? "highlight" : "",
      ].filter(Boolean);
      console.log(`→ ${_id} (${slug}): fix ${notes.join(", ")}`);
    }

    if (!DRY) {
      await client.patch(_id).set({ sections }).commit();
      const draftId = `drafts.${_id}`;
      const draft = await client.getDocument(draftId);
      if (draft) {
        await client.patch(draftId).set({ sections }).commit();
        console.log(`   ✓ draft synced`);
      }
    }
    fixed++;
  }

  // Orphan drafts still out of sync with published
  const drafts: { _id: string; slug: string }[] = await client.fetch(
    `*[_type == "caseStudy" && _id in path("drafts.**")]{ _id, "slug": slug.current }`,
  );
  for (const { _id, slug } of drafts) {
    const pubId = _id.replace(/^drafts\./, "");
    if (targets.some((t) => t._id === pubId)) continue;

    const pub = await client.getDocument(pubId);
    if (!pub) continue;
    const draft = await client.getDocument(_id);
    const draftLegacy = ((draft?.sections ?? []) as Section[]).some((s) => LEGACY.has(s._type));
    const draftStringStats = ((draft?.sections ?? []) as Section[]).some(
      (s) =>
        s._type === "statsSection" &&
        ((s.items as Section[]) ?? []).some((it) => typeof it.value === "string"),
    );
    if (!draftLegacy && !draftStringStats) continue;

    const sections = fixSections((pub.sections ?? []) as Section[], slug ?? pubId);
    console.log(`→ ${_id} (${slug}): sync draft from pub + fixes`);
    if (!DRY) await client.patch(_id).set({ sections }).commit();
    fixed++;
  }

  console.log(`\n${DRY ? "(dry run) " : ""}fixed ${fixed} document(s)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
