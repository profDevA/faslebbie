import type { BuildCaseStudyDetail, BuildProject, BuildToken } from "@/lib/build";
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

function mapCaseStudyDetail(
  raw: SanityBuildProject["caseStudyDetail"],
): BuildCaseStudyDetail | undefined {
  if (!raw?.trigger?.trim()) return undefined;
  return {
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

  const projects: BuildProject[] = (data.projects ?? []).map((p, i) => {
    const images = p.images?.filter((u): u is string => Boolean(u));
    return {
      id: p.id ?? `project-${i}`,
      title: p.title ?? "",
      tech: p.tech ?? [],
      span: p.span ?? "md",
      tint: p.tint || "#2f3b4a",
      lightArt: p.lightArt,
      images,
      outputVisual: p.outputVisual?.trim() || undefined,
      conceptPreview: p.conceptPreview?.trim() || undefined,
      kicker: p.kicker ?? "",
      subtitle: p.subtitle ?? "",
      blurb: p.blurb ?? "",
      caseStudyDetail: mapCaseStudyDetail(p.caseStudyDetail),
    };
  });

  return { intro, projects };
}
