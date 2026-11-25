import {
  BUILD_SECTION_TITLE_DEFAULTS,
  type BuildCaseStudyDetail,
  type BuildProject,
  type BuildSectionTitles,
  type BuildToken,
} from "@/lib/build";
import { colorToCss } from "@/components/caseStudyView/colors";
import { proseParagraphs, type ProseRun } from "@/lib/sanityProse";
import type { SanityBuildPage, SanityBuildProject } from "@/sanity/types";

export interface BuildContentData {
  intro: BuildToken[][];
  projects: BuildProject[];
}

function runToToken(run: ProseRun): BuildToken {
  if (run.mark?._type === "ref")
    return { t: "proj", id: run.mark.targetId ?? "", text: run.text };
  return { t: "text", text: run.text };
}

const empty: BuildContentData = { intro: [], projects: [] };

/** Studio titles over the defaults; an empty field keeps the default. */
function sectionTitles(raw: SanityBuildPage["sectionTitles"]): BuildSectionTitles {
  const out = { ...BUILD_SECTION_TITLE_DEFAULTS } as BuildSectionTitles;
  for (const k of Object.keys(out) as (keyof BuildSectionTitles)[]) {
    const v = raw?.[k]?.trim();
    if (v) out[k] = v;
  }
  return out;
}

function mapCaseStudyDetail(
  raw: SanityBuildProject["caseStudyDetail"],
  titles: BuildSectionTitles,
): BuildCaseStudyDetail | undefined {
  if (!raw) return undefined;
  return {
    titles,
    statusLabel: raw.statusLabel?.trim() ?? "",
    trigger: raw.trigger?.trim() ?? "",
    observation: raw.observation?.trim() ?? "",
    hypothesis: raw.hypothesis?.trim() ?? "",
    value: raw.value?.trim() || undefined,
    experiment: raw.experiment?.trim() ?? "",
    statusBody: raw.statusBody?.trim() ?? "",
    checklist: (raw.checklist ?? [])
      .filter((c) => c.text?.trim())
      .map((c) => ({ done: Boolean(c.done), text: c.text!.trim() })),
    whoFor: raw.whoFor?.trim() ?? "",
    howItWorks: raw.howItWorks?.filter((s): s is string => Boolean(s?.trim())) ?? [],
    insights: raw.insights?.filter((s): s is string => Boolean(s?.trim())) ?? [],
  };
}

/** Sanity Build page only — no in-code seed fallback. */
export function buildFromSanity(
  data: SanityBuildPage | null | undefined,
): BuildContentData {
  if (!data) return empty;

  const intro = proseParagraphs(data.intro).map((runs) =>
    runs.map(runToToken),
  );

  const titles = sectionTitles(data.sectionTitles);

  // "Hide on site" projects stay in Studio but never reach the page (grid,
  // popup pager, /build/<id>, sitemap).
  const projects: BuildProject[] = (data.projects ?? []).filter((p) => !p.hidden).map((p, i) => {
    const images = p.images?.filter((u): u is string => Boolean(u));
    return {
      id: p.id ?? `project-${i}`,
      title: p.title ?? "",
      tech: p.tech ?? [],
      span: p.span ?? "md",
      tint: p.tint || "#2f3b4a",
      lightArt: p.lightArt,
      images,
      popupImage: p.popupImage?.trim() || undefined,
      outputVisual: p.outputVisual?.trim() || undefined,
      conceptPreview: p.conceptPreview?.trim() || undefined,
      panelColor: colorToCss(p.panelColor),
      panelImageFit: p.panelImageFit === "fill" ? "fill" : "padded",
      kicker: p.kicker ?? "",
      subtitle: p.subtitle ?? "",
      blurb: p.blurb ?? "",
      caseStudyDetail: mapCaseStudyDetail(p.caseStudyDetail, titles),
    };
  });

  return { intro, projects };
}
