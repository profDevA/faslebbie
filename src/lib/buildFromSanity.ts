import type { SanityBuildPage } from "@/sanity/types";
import { proseParagraphs, type ProseRun } from "@/lib/sanityProse";
import type { BuildProject, BuildToken } from "@/lib/build";

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
      kicker: p.kicker || "Design · 5 Min Read",
      subtitle: p.subtitle ?? "",
      blurb: p.blurb ?? "",
      description: p.description ?? "",
      howItWorks: p.howItWorks ?? [],
      note: p.note,
      supportedTools: p.supportedTools ?? [],
    };
  });

  return { intro, projects };
}
