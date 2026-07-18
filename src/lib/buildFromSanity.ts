import type { SanityBuildPage } from "@/sanity/types";
import { proseParagraphs, type ProseRun } from "@/lib/sanityProse";
import {
  buildIntro,
  buildProjects as fallbackProjects,
  type BuildProject,
  type BuildToken,
} from "@/lib/build";

export interface BuildContentData {
  intro: BuildToken[][];
  projects: BuildProject[];
}

function runToToken(run: ProseRun): BuildToken {
  if (run.mark?._type === "ref")
    return { t: "proj", id: run.mark.targetId ?? "", text: run.text };
  return { t: "text", text: run.text };
}

export function buildFromSanity(
  data: SanityBuildPage | null | undefined,
): BuildContentData {
  const defaults: BuildContentData = {
    intro: buildIntro,
    projects: fallbackProjects,
  };
  if (!data) return defaults;

  const introTokens = proseParagraphs(data.intro).map((runs) =>
    runs.map(runToToken),
  );
  const intro = introTokens.length ? introTokens : defaults.intro;

  const projects: BuildProject[] = data.projects?.length
    ? data.projects.map((p, i) => ({
        id: p.id ?? `project-${i}`,
        title: p.title ?? "",
        tech: p.tech ?? [],
        span: p.span ?? "md",
        tint: p.tint ?? "#2f3b4a",
        lightArt: p.lightArt,
        kicker: p.kicker ?? "Design · 5 Min Read",
        subtitle: p.subtitle ?? "",
        blurb: p.blurb ?? "",
        description: p.description ?? "",
        howItWorks: p.howItWorks ?? [],
        note: p.note,
        supportedTools: p.supportedTools ?? [],
      }))
    : defaults.projects;

  return { intro, projects };
}
